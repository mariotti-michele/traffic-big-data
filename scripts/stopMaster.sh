#!/bin/bash

echo "Arresto Kafka..."
pkill -f kafka.Kafka

echo "Arresto Zookeeper..."
pkill -f zookeeper