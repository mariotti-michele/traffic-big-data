#!/bin/bash

export PATH="$PATH:$SPARK_HOME/sbin"
export PATH="$PATH:$HOME/kafka/bin"

echo "Avvio MongoDB..."
sudo service mongod start &
sleep 7

echo "Avvio Zookeeper..."
zookeeper-server-start.sh ~/kafka/config/zookeeper.properties &
sleep 7

echo "Avvio Kafka..."
kafka-server-start.sh ~/kafka/config/server.properties &
sleep 7

echo "Avvio Spark Master..."
start-master.sh

echo "Avvio Spark Batch Processor..."
spark-submit \
  --class bigdataman.mm.SparkBatchProcessor \
  spark-batch-processor-1.0-SNAPSHOT.jar