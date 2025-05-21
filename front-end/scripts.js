const stationSelect = document.getElementById("stationSelect");
let lineChart, barChartDay, barChartWeek;

async function fetchStationIds() {
  const res = await fetch("http://localhost:3000/station_ids");  const ids = await res.json();
  stationSelect.innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join("");
  fetchAndRenderData(ids[0]);
}

async function fetchAndRenderData(stationId) {
  const res = await fetch(`http://localhost:3000/station/${stationId}`);
  const data = await res.json();
  renderCharts(data);
}

function renderCharts(data) {
  const { transits, stats } = data;

  const dates = transits.map(e => e.date);
  const totalTransits = transits.map(e => e.total_transits);

  const dailyAvg = stats[0]?.daily_avg || 0;
  const avgLine = new Array(dates.length).fill(dailyAvg);

  // Line Chart
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Transiti Totali",
          data: totalTransits,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Media Giornaliera",
          data: avgLine,
          borderColor: "red",
          borderDash: [5, 5],
          fill: false,
        }
      ],
    },
    options: {
      animation: false
    }
  });

  // Day of Week Bar Chart
  const dayAvg = stats[0]?.day_of_week_avg || {};
  const days = Object.keys(dayAvg);
  const values = Object.values(dayAvg);

  if (barChartDay) barChartDay.destroy();
  barChartDay = new Chart(document.getElementById("barChartDay"), {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Media per Giorno",
        data: values,
        backgroundColor: "orange"
      }]
    },
    options: {
      animation: false,
    }
  });

  // Weekly Total Bar Chart
  const weekly = stats[0]?.weekly_total || {};
  const weeks = Object.keys(weekly);
  const totals = Object.values(weekly);

  if (barChartWeek) barChartWeek.destroy();
  barChartWeek = new Chart(document.getElementById("barChartWeek"), {
    type: "bar",
    data: {
      labels: weeks,
      datasets: [{
        label: "Totale Settimanale",
        data: totals,
        backgroundColor: "green"
      }]
    },
    options: {
      animation: false,
      indexAxis: "y",
    }
  });
}

stationSelect.addEventListener("change", () => {
  fetchAndRenderData(stationSelect.value);
});

fetchStationIds();
setInterval(() => fetchAndRenderData(stationSelect.value), 5000);
