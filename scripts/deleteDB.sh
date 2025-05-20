#!/bin/bash

echo "Eliminazione di tutti i dati dal database traffic..."

mongo traffic --eval '
    db.getCollectionNames().forEach(function(c) {
        print("Dropping collection: " + c);
        db[c].drop();
    });
'

sleep 5