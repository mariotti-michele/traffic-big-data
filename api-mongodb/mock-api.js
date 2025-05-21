const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

const mockStationIds = ["A1", "B2", "C3"];

const mockData = {
  A1: {
    station_id: "A1",
    transits: [
      { date: "2025-03-25", total_transits: 120 },
      { date: "2025-03-26", total_transits: 135 },
      { date: "2025-03-27", total_transits: 150 },
      { date: "2025-03-28", total_transits: 110 },
      { date: "2025-03-29", total_transits: 140 },
    ],
    stats: [
      {
        daily_avg: 131,
        day_of_week_avg: {
          lun: 130,
          mar: 125,
          mer: 140,
          gio: 120,
          ven: 140,
          sab: 135,
          dom: 130
        },
        weekly_total: {
          "12": 900,
          "13": 950
        },
        updated_to: "2025-03-29"
      }
    ]
  },
  B2: {
    station_id: "B2",
    transits: [
      { date: "2025-03-25", total_transits: 100 },
      { date: "2025-03-26", total_transits: 105 },
      { date: "2025-03-27", total_transits: 110 },
      { date: "2025-03-28", total_transits: 115 },
      { date: "2025-03-29", total_transits: 120 },
    ],
    stats: [
      {
        daily_avg: 110,
        day_of_week_avg: {
          lun: 100,
          mar: 105,
          mer: 110,
          gio: 115,
          ven: 120,
          sab: 95,
          dom: 105
        },
        weekly_total: {
          "12": 750,
          "13": 800
        },
        updated_to: "2025-03-29"
      }
    ]
  },
  C3: {
    station_id: "C3",
    transits: [],
    stats: []
  }
};

app.get("/station_ids", (req, res) => {
  res.json(mockStationIds);
});

app.get("/station/:id", (req, res) => {
  const id = req.params.id;
  if (mockData[id]) {
    res.json(mockData[id]);
  } else {
    res.status(404).json({ error: "Stazione non trovata" });
  }
});

app.listen(PORT, () => {
  console.log(`Mock API attiva su http://localhost:${PORT}`);
});
