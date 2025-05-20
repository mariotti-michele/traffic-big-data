#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/sbin"
export PATH="$PATH:$HOME/kafka/bin"

echo "Arresto Spark Master..."
stop-master.sh
sleep 7

echo "Arresto Kafka..."
kafka-server-stop.sh
sleep 7

echo "Arresto Zookeeper..."
zookeeper-server-stop.sh
sleep 7

echo "Arresto MongoDB..."
sudo service mongod stop

echo "Servizi arrestati correttamente."
sleep 10
