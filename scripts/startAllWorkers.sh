#!/bin/bash

ssh diabd@192.168.56.102 'bash -s' < ./startWorker1.sh &

ssh diabd@192.168.56.103 'bash -s' < ./startWorker2.sh &

wait

echo "Operazioni completate."
sleep 10
