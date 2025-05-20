#!/bin/bash

ssh diabd@192.168.56.103 'bash -s' < ./startWorker2.sh &

ssh diabd@192.168.56.102 'bash -s' < ./startWorker1.sh &

runSparkProcessor.sh &

wait

echo "Operazioni completate su entrambi i Worker."
sleep 10
