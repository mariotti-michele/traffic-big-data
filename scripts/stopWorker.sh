#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/sbin"

echo "Arresto Kafka Producer"
pkill -f 'kafka-producer-1.0-SNAPSHOT-jar-with-dependencies.jar'

echo "Arresto Spark Worker..."
stop-worker.sh
sleep 7

echo "Arresto MongoDB..."
sudo service mongod stop

sleep 10
