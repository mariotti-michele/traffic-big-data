#!/bin/bash

export PATH="$PATH:$HOME/kafka/bin"

echo "Eliminazione topic traffic"
kafka-topics.sh --bootstrap-server 192.168.56.101:9092 --delete --topic traffic

sleep 5

echo "Creazione topic traffic"
kafka-topics.sh --create --topic traffic --bootstrap-server 192.168.56.101:9092 --partitions 1 --replication-factor 1

sleep 10