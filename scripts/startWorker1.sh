#!/bin/bash

export PATH="$PATH:$SPARK_HOME/sbin"

echo "Avvio MongoDB..."
sudo service mongod start &
sleep 10

echo "[INFO] Avvio Spark Worker..."
start-worker.sh spark://192.168.56.101:7077 &
sleep 10

echo "Avvio Kafka Producer sensore 1..."
java -jar kafka-producer-1.0-SNAPSHOT-jar-with-dependencies.jar 1