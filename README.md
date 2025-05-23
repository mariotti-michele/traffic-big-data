# Monitoraggio Traffico Stradale

**Documento di progetto del corso DATA INTENSIVE APPLICATION AND BIG DATA**  
**Autori: Michele Mariotti, Martin Arsoski**

## OBIETTIVO

L’obiettivo del progetto è:

- raccogliere i dati relativi al traffico, simulando la trasmissione da parte di sensori situati in diverse postazioni  
- elaborare tali dati per calcolare statistiche relative a ciascuna postazione (transiti medi giornalieri, transiti medi per ogni giorno della settimana, transiti totali settimanali)  
- memorizzare i dati in un database distribuito  
- visualizzare i dati attraverso una semplice interfaccia grafica, permettendo di analizzarli più agevolmente  

## DATASET

I dati utilizzati provengono dal Sistema di Monitoraggio regionale dei flussi di Traffico Stradali (MTS) dell'Emilia-Romagna e sono accessibili al seguente link:

👉 [https://serviziambiente.regione.emilia-romagna.it/portaleviabilita/flussi](https://serviziambiente.regione.emilia-romagna.it/portaleviabilita/flussi)

In particolare, i dati selezionati rappresentano il numero di transiti giornalieri per ciascuna postazione, nel periodo compreso tra il 1° gennaio 2025 e il 31 marzo 2025.  
È stata fatta una pulizia dei dati prima del loro utilizzo attraverso uno script Python.  
L'invio dei dati viene simulato come se avvenisse attraverso operazioni batch a fine giornata da parte dei sensori.

## SPECIFICHE E ARCHITETTURA

Tecnologie usate:

- Java: 21.0.6  
- Apache Kafka: 2.8.1  
- Apache Spark: 3.5.4  
- MongoDB: 8.0.4  
- Python  
- Maven  

### Architettura del sistema

![Architettura Big Data](architettura-bigdata.jpg)

*Per semplicità nella nostra simulazione i sensori sono implementati nei nodi worker, in modo da limitare il numero complessivo di VM.*

## CONFIGURAZIONE

### Connessione delle Macchine Virtuali

Modifica del file `/etc/hosts`:

```
192.168.56.101   master  
192.168.56.102   worker1  
192.168.56.103   worker2  
```

### Configurazione di Kafka (nodo master)

`~/kafka/config/server.properties`:
```
broker.id=0  
listeners=PLAINTEXT://192.168.56.101:9092  
advertised.listeners=PLAINTEXT://192.168.56.101:9092  
zookeeper.connect=localhost:2181  
```

Creazione topic:
```bash
kafka-topics.sh --create --topic traffic --bootstrap-server 192.168.56.101:9092 --partitions 1 --replication-factor 1
```

### Configurazione MongoDB

`/etc/mongod.conf`:

- Master (192.168.56.101):
  ```
  net:
    bindIp: 192.168.56.101
  ```

- Worker1 (192.168.56.102):
  ```
  net:
    bindIp: 192.168.56.102
  ```

- Worker2 (192.168.56.103):
  ```
  net:
    bindIp: 192.168.56.103
  ```

Tutte le macchine:
```yaml
replication:
  replSetName: "rstraffic"
```

Replica set (da master):
```js
rs.initiate({
  _id: "rstraffic",
  members: [
    { _id: 0, host: "192.168.56.101:27017" },
    { _id: 1, host: "192.168.56.102:27017" },
    { _id: 2, host: "192.168.56.103:27017" }
  ]
})
```

### Configurazione Spark

Su tutte le VM modificare `conf/spark-env.sh`.

- Master:
  ```
  export SPARK_MASTER_HOST=192.168.56.101
  ```

- Worker:
  ```
  export SPARK_WORKER_CORES=1
  export SPARK_WORKER_MEMORY=2g
  ```

## SVILUPPO

### Kafka Producer (trasmissione dati)

Simulazione batch a fine giornata. Ogni worker gestisce metà delle postazioni.

Tempo simulato: 1 giorno = 20 secondi.

### Spark Consumer (elaborazione dati)

Logica:

1. Riceve `END_OF_DAY:<data>` da entrambi i sensori  
2. Elabora i dati giornalieri e calcola le statistiche  
3. Salva su MongoDB  
4. Avanza al giorno successivo  

### MongoDB

#### Struttura `daily_transits`

```json
{
  "station_id": 12,
  "station_name": "SS 16 tra A 14 (casello Cattolica) e confine regionale Marche",
  "date": "2025-01-01",
  "total_transits": 10584,
  "day_of_week": 3,
  "week": 1
}
```

#### Struttura `station_stats`

```json
{
  "station_id": 12,
  "daily_avg": 8375,
  "day_of_week_avg": {
    "1": 8231,
    "2": 8120,
    ...
    "7": 7800
  },
  "weekly_total": {
    "1": 54100,
    "2": 56780,
    ...
  },
  "updated_to": "2025-03-31"
}
```

### Lettura/Scrittura

- `readPreference: "primaryPreferred"`  
- `readConcern: "local"`  
- `writeConcern: "majority"`

## VISUALIZZAZIONE

- Backend: Node.js con API REST (GET da MongoDB)  
- Frontend: HTML + CSS + JS  
- Grafici:
  - Line chart (transiti giornalieri + media)
  - Bar chart (medie settimanali per giorno)
  - Bar chart (totali settimanali)

## AVVIO E ARRESTO DEL SISTEMA

### Avvio

1. `startMaster.sh`  
2. `recreateTopic.sh`  
3. `logMessages.sh`  
4. `startWorkers.sh`  
5. `runSparkProcessor.sh`  
6. `node server.js`  
7. `python3 -m http.server 8000`

### Arresto

1. `stopAllWorkers.sh`  
2. `stopMaster.sh`

### Reset Database

```bash
./deleteDB.sh
```