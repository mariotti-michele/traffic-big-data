#!/bin/bash

echo "Arresto..."
pkill -f 'TrafficKafkaProducer'
sleep 10