#!/bin/bash

echo "Avvio MongoDB..."
sudo service mongod start &
sleep 10

echo "Avvio Kafka Producer sensore 2..."
java -jar kafka-producer-1.0-SNAPSHOT-jar-with-dependencies.jar 2