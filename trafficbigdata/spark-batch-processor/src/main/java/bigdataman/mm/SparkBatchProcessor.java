package bigdataman.mm;

import org.apache.spark.sql.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

import static org.apache.spark.sql.functions.*;

public class SparkBatchProcessor {

    private static SparkSession startSparkSession() {
        SparkSession spark = SparkSession.builder()
            .appName("SparkBatchProcessor")
            .master("spark://192.168.56.101:7077")
            .config("spark.mongodb.connection.uri", "mongodb://192.168.56.101,192.168.56.102,192.168.56.103")
            .config("spark.mongodb.read.connection.uri", "mongodb://192.168.56.101,192.168.56.102,192.168.56.103")
            .config("spark.mongodb.write.connection.uri", "mongodb://192.168.56.101,192.168.56.102,192.168.56.103")
            .getOrCreate();
        
        return spark;
    }

    private static Dataset<Row> insertDailyTransits(Dataset<Row> dfKafka, String currentDateString) {
        Dataset<Row> df = dfKafka
            .filter(col("value").startsWith(currentDateString))
            .selectExpr(
                "split(value, ',')[2] as station_id",
                "split(value, ',')[3] as station_name",
                "split(value, ',')[0] as date",
                "CAST(split(value, ',')[4] AS INT) as total_transits",
                "split(value, ',')[1] as day_of_week",
                "split(value, ',')[4] as week"
            ).withColumn("date", to_date(col("date"), "dd/MM/yyyy"))
            .withColumn("week",
                when(col("date").lt(lit("2025-01-06")), lit(1))
                    .otherwise(
                        floor(datediff(col("date"), lit("2025-01-06")).divide(7)).plus(2)
                    )
            );

        df.write()
            .format("mongodb")
            .mode(SaveMode.Append)
            .option("replicaSet", "rstraffic")
            .option("writeConcern.w", "majority")
            .option("database", "traffic")
            .option("collection", "daily_transits")
            .save();

        return df;
    }

    private static void updateStatistics(SparkSession spark) {
        Dataset<Row> df = spark.read()
            .format("mongodb") 
            .option("replicaSet", "rstraffic")
            .option("readConcern.level", "local")
            .option("readPreference.name", "primaryPreferred")
            .option("database", "traffic")
            .option("collection", "daily_transits")
            .load()
            .withColumn("date", to_date(col("date"), "yyyy-MM-dd"));

        Dataset<Row> dailyAvg = df.groupBy("station_id")
            .agg(avg("total_transits").alias("daily_avg"));

        Dataset<Row> dayOfWeekAvg = df.groupBy("station_id", "day_of_week")
            .agg(avg("total_transits").alias("value"))
            .groupBy("station_id")
            .agg(map_from_entries(collect_list(struct(col("day_of_week"), col("value")))).alias("day_of_week_avg"));

        Dataset<Row> weeklyTotal = df.groupBy("station_id", "week")
            .agg(sum("total_transits").alias("value"))
            .groupBy("station_id")
            .agg(map_from_entries(collect_list(struct(col("week").cast("string"), col("value")))).alias("weekly_total"));

        Dataset<Row> updatedTo = df.groupBy("station_id")
            .agg(date_format(max("date"), "yyyy-MM-dd").alias("updated_to"));

        Dataset<Row> result = dailyAvg
            .join(dayOfWeekAvg, "station_id")
            .join(weeklyTotal, "station_id")
            .join(updatedTo, "station_id");

        result.write()
            .format("mongodb")
            .mode(SaveMode.Overwrite)
            .option("replicaSet", "rstraffic")
            ///.option("writeConcern.w", "majority")
            .option("database", "traffic")
            .option("collection", "station_stats")
            .save();
    }

    private static boolean isDayEnded(Dataset<Row> dfKafka, String currentDateString) {
        String marker = "END_OF_DAY:" + currentDateString;
        boolean isDayEnded = dfKafka.filter(col("value").startsWith(marker)).count() == 2;
        return isDayEnded;
    }

    public static void main(String[] args) {

        SparkSession spark = startSparkSession();

        Dataset<Row> dfKafka;
        LocalDate currentDate = LocalDate.of(2025, 1, 1);
        long lastOffset = 0;

        while (true) {

            long startOffset = Math.max(0, lastOffset - 1000);
            String startingOffsets = String.format("{\"traffic\":{\"0\":%d}}", startOffset);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String currentDateString = currentDate.format(formatter);

            dfKafka = spark.read()
                .format("kafka")
                .option("kafka.bootstrap.servers", "192.168.56.101:9092")
                .option("subscribe", "traffic")
                .option("startingOffsets", startingOffsets)
                .load()
                .selectExpr("CAST(key AS STRING)", "CAST(value AS STRING)", "offset")
                .cache();

            if (isDayEnded(dfKafka, currentDateString)) {
                System.out.println("[INFO] Fine giornata " + currentDate + ". Elaboro dati...");

                insertDailyTransits(dfKafka, currentDateString);
                updateStatistics(spark);

                System.out.println("[INFO] Scritti i dati del " + currentDate + " su MongoDB.");
                currentDate = currentDate.plusDays(1);
            }

            long maxOffset = dfKafka.agg(max("offset"))
                    .as(Encoders.LONG())
                    .collectAsList()
                    .get(0);

            lastOffset = maxOffset;

            try{
                TimeUnit.SECONDS.sleep(5);
            } catch(Exception e){
                e.printStackTrace();
            }

        }
    }
}
