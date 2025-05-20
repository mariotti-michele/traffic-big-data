#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/sbin"

echo "[Worker 2] Avvio MongoDB..."
sudo service mongod start &
sleep 10

echo "[Worker 2] Avvio Spark Worker..."
start-worker.sh spark://192.168.56.101:7077 &
sleep 10

echo "[Worker 2] Avvio Kafka Producer sensore 2..."
java -jar /home/diabd/Desktop/progetto_traffic/kafka-producer-1.0-SNAPSHOT-jar-with-dependencies.jar 2
