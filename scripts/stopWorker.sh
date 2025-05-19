#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/sbin"

echo "Arresto Spark Worker..."
stop-worker.sh
sleep 7

echo "Arresto MongoDB..."
sudo service mongod stop

sleep 10