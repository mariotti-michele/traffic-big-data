#!/bin/bash

export PATH="$PATH:$HOME/kafka/bin"

echo "Avvio Zookeeper..."
zookeeper-server-start.sh ~/kafka/config/zookeeper.properties &
sleep 7

echo "Avvio Kafka..."
kafka-server-start.sh ~/kafka/config/server.properties