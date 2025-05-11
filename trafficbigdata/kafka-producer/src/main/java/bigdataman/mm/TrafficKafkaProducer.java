package bigdataman.mm;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

public class TrafficKafkaProducer {

    private static final String TOPIC = "traffic";
    private static final String BROKER = "192.168.56.101:9092"; // IP del nodo master
    private static final int NUM_DATA_SENT_EACH_TIME = 10;
    private static final int SECONDS_INTERVAL = 5;

    private static Properties getProperties(int sensorId) {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, BROKER);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.CLIENT_ID_CONFIG, "Sensor" + sensorId);
        return props;
    }

    private static void sendData(int sensorId) {
        try (KafkaProducer<String, String> producer = new KafkaProducer<>(getProperties(sensorId))) {
            String filePath = "src/main/resources/traffic-dataset-half-" + sensorId + ".csv";
            try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
                String line;
                int count = 0;
                while ((line = br.readLine()) != null) {
                    String station = line.split(",")[1];
                    ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, station, line);
                    producer.send(record);
                    System.out.println("Sent: " + line);
                    count++;
                    if(count == NUM_DATA_SENT_EACH_TIME) {
                        count = 0;
                        TimeUnit.SECONDS.sleep(SECONDS_INTERVAL);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {

        if (args.length != 1 || (!args[0].equals("1") && !args[0].equals("2"))) {
            System.out.println("Uso: java App <1|2>");
            return;
        }
        int sensorId = Integer.parseInt(args[0]);

        sendData(sensorId);
    }
}