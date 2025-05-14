#!/bin/bash

export PATH="$PATH:$HOME/kafka/bin"

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