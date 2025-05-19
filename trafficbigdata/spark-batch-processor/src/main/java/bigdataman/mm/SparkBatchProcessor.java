package bigdataman.mm;

import org.apache.spark.sql.*;
import org.apache.spark.sql.types.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

import static org.apache.spark.sql.functions.*;

public class SparkBatchProcessor {

    private static SparkSession startSparkSession() {
        SparkSession spark = SparkSession.builder()
            .appName("SparkBatchProcessor")
            .master("spark://192.168.56.101:7077")
            .config("spark.mongodb.output.uri", "mongodb://192.168.56.101,192.168.56.102,192.168.56.103/traffic.daily_transits?replicaSet=rstraffic&writeConcern=majority&readPreference=primaryPreferred&readConcernLevel=local")
            .getOrCreate();
        
        return spark;
    }

    public static void main(String[] args) {

        SparkSession spark = startSparkSession();

        Dataset<Row> dfKafka;
        LocalDate currentDate = LocalDate.of(2025, 1, 1);
        long lastOffset = 0;

        while (true) {

            long startOffset = Math.max(0, lastOffset - 1000);
            String startingOffsets = String.format("{\"traffic\":{\"0\":%d}}", startOffset);

            dfKafka = spark.read()
                .format("kafka")
                .option("kafka.bootstrap.servers", "192.168.56.101:9092")
                .option("subscribe", "traffic")
                .option("startingOffsets", startingOffsets)
                .load()
                .selectExpr("CAST(key AS STRING)", "CAST(value AS STRING)", "offset");

            Dataset<Row> dfFiltered = dfKafka.cache();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String currentDateString = currentDate.format(formatter);
            String marker = "END_OF_DAY:" + currentDateString;
            boolean isDayEnded = dfFiltered.filter(col("value").equalTo(marker)).count() == 2;

            if (isDayEnded) {
                System.out.println("[INFO] Fine giornata " + currentDate + ". Elaboro dati...");

                Dataset<Row> data = dfFiltered
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

                data.write()
                    .format("mongo")
                    .mode(SaveMode.Append)
                    .save();

                System.out.println("[INFO] Scritti i dati del " + currentDate + " su MongoDB.");
                currentDate = currentDate.plusDays(1);
            }

            long maxOffset = dfFiltered.agg(max("offset"))
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
