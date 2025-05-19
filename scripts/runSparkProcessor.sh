#!/bin/bash

export SPARK_HOME=/home/diabd/Desktop/spark
export PATH="$PATH:$SPARK_HOME/bin"

echo "Avvio Spark Batch Processor..."
spark-submit \
  --class bigdataman.mm.SparkBatchProcessor \
  spark-batch-processor-1.0-SNAPSHOT.jar