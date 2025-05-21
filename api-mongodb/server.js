const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = 3000;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "traffic";
const transitsCollectionName = "daily_transits";
const statsCollectionName = "station_stats";

app.use(cors());
app.use(express.static("public"));

app.get("/station/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await client.connect();
        const db = client.db(dbName);
        const transitsCollection = db.collection(transitsCollectionName);
        const statsCollection = db.collection(statsCollectionName);

        const transits = await transitsCollection.find({ station_id: id }).toArray();
        const stats = await statsCollection.find({ station_id: id }).toArray();

        res.json({
            station_id: id,
            transits,
            stats
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Errore nel recupero dati");
    }
});

app.get("/station_ids", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const transitsCollection = db.collection(transitsCollectionName);

        const ids = await transitsCollection.distinct("station_id");
        res.json(ids);
    } catch (err) {
        console.error(err);
        res.status(500).send("Errore nel recupero degli ID");
    }
});


app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});