# traffic-big-data

Per avviare il sistema, esegui in ordine dal nodo Master:
1) startMaster.sh
2) recreateTopic.sh (per pulire dati salvati in kafka)
3) logMessages.sh
4) startWorkers.sh
5) runSparkProcessor.sh
6) node server.js
7) python3 -m http.server 8000
8) http://localhost:8000

Per arrestare l'esecuzione:
1) stopAllWorkers.sh
2) stopMaster.sh

Per cancellare il database traffic di MongoDB esegui deleteDB.sh