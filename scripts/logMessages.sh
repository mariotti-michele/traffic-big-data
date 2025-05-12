#!/bin/bash

export PATH="$PATH:$HOME/kafka/bin"

kafka-console-consumer.sh --bootstrap-server 192.168.56.101:9092 --topic traffic --from-beginning