#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/sbin"
export PATH="$PATH:$SPARK_HOME/bin"
export PATH="$PATH:$HOME/kafka/bin"

echo "Avvio MongoDB..."
sudo service mongod start &
sleep 7

echo "Avvio Spark Master..."
start-master.sh
sleep 7

echo "Avvio Zookeeper..."
zookeeper-server-start.sh ~/kafka/config/zookeeper.properties &
sleep 7

echo "Avvio Kafka..."
kafka-server-start.sh ~/kafka/config/server.properties
sleep 7
