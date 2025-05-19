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

            long startOffset = Math.max(0, lastOffset - 500);
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
            boolean isDayEnded = dfFiltered.filter(col("value").equalTo(marker)).count() > 0;

            if (isDayEnded) {
                System.out.println("[INFO] Fine giornata " + currentDate + ". Elaboro dati...");

                Dataset<Row> data = dfFiltered
                    .filter(col("value").startsWith(currentDateString))
                    .selectExpr(
                        "split(value, ',')[0] as data",
                        "split(value, ',')[1] as giorno_settimana",
                        "split(value, ',')[2] as postazione_id",
                        "CAST(split(value, ',')[3] AS INT) as totale_transiti"
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
