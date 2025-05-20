#!/bin/bash

ssh diabd@192.168.56.102 'bash -s' < ./stopWorker.sh &

ssh diabd@192.168.56.103 'bash -s' < ./stopWorker.sh &

wait

echo "[INFO] Entrambi i worker sono stati arrestati."
sleep 10
