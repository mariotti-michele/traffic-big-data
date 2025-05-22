#!/bin/bash

nodes=("192.168.56.101" "192.168.56.102" "192.168.56.103")

echo "Avvio dei servizi mongod su tutti i nodi..."

for node in "${nodes[@]}"; do
    echo "Avvio mongod su $node"
    ssh diabd@$node "sudo service mongod start"
done

sleep 5

echo "Eliminazione di tutte le collection dal database 'traffic'..."

mongosh "mongodb://192.168.56.101,192.168.56.102,192.168.56.103/traffic?replicaSet=rstraffic" --eval '
	db.getCollectionNames().forEach(function(c) {
		print("Dropping collection: " + c);
		db[c].drop();
	});
'

sleep 5

echo "Arresto dei servizi mongod su tutti i nodi..."

for node in "${nodes[@]}"; do
    echo "Arresto mongod su $node"
    ssh diabd@$node "sudo service mongod stop"
done

sleep 5
