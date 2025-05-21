const express = require("express");
const cors = require("cors");

const { MongoClient, ReadConcern, ReadPreference } = require("mongodb");

const uri = "mongodb://192.168.56.101,192.168.56.102,192.168.56.103";
const client = new MongoClient(uri, {
    replicaSet: "rstraffic",
    readConcern: new ReadConcern("local"),
    readPreference: ReadPreference.primaryPreferred,
});

const app = express();
const PORT = 3000;

const dbName = "traffic";
const transitsCollectionName = "daily_transits";
const statsCollectionName = "station_stats";

app.use(cors());
app.use(express.static("public"));

let db;

app.get("/station/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const transits = await db.collection(transitsCollectionName).find({ station_id: id }).toArray();
        const stats = await db.collection(statsCollectionName).find({ station_id: id }).toArray();

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
        const ids = await db.collection(transitsCollectionName).distinct("station_id");
        res.json(ids);
    } catch (err) {
        console.error(err);
        res.status(500).send("Errore nel recupero degli ID");
    }
});

async function main() {
    await client.connect();
    db = client.db(dbName);
    app.listen(PORT, () => {
        console.log(`Server in ascolto su http://localhost:${PORT}`);
    });
}

process.on("SIGINT", async () => {
    console.log("Chiusura connessione MongoDB...");
    await client.close();
    process.exit(0);
});

main().catch(console.error);