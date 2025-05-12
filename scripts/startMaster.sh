#!/bin/bash

echo "Avvio Zookeeper..."
zookeeper-server-start.sh ~/kafka/config/zookeeper.properties

echo "Avvio Kafka..."
kafka-server-start.sh ~/kafka/config/server.properties