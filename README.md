# traffic-big-data

Per avviare il sistema, esegui in ordine dal nodo Master:
1) startMaster.sh
2) recreateTopic.sh
3) logMessages.sh
4) startWorkers.sh
5) runSparkProcessor.sh

Per arrestare l'esecuzione:
1) stopAllWorkers.sh
2) stopMaster.sh

Per cancellare il database traffic di MongoDB esegui deleteDB.sh