const stationSelect = document.getElementById("stationSelect");
const stationNameEl = document.getElementById("stationName");
const lastUpdateEl = document.getElementById("lastUpdate");
let lineChart, barChartDay, barChartWeek;

async function fetchStationIds() {
  const res = await fetch("http://localhost:3000/station_ids");  const ids = await res.json();
  stationSelect.innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join("");
  fetchAndRenderData(ids[0]);
}

async function fetchAndRenderData(stationId) {
  const res = await fetch(`http://localhost:3000/station/${stationId}`);
  const data = await res.json();
  stationNameEl.textContent = `Postazione: ${data.transits[0].station_name}`;
  if (data.transits && data.transits.length > 0) {
    const dates = data.transits.map(e => e.date);
    dates.sort();
    const lastDate = dates[dates.length - 1];
    lastUpdateEl.textContent = `Dati aggiornati al ${lastDate}`;
  } else {
    lastUpdateEl.textContent = "";
  }
  renderCharts(data);
}

stationSelect.addEventListener("change", () => {
  if (lineChart) lineChart.resetZoom();
  fetchAndRenderData(stationSelect.value);
});

function renderCharts(data) {
  const { transits, stats } = data;

  const dates = transits.map(e => e.date);
  const totalTransits = transits.map(e => e.total_transits);

  const dailyAvg = stats[0]?.daily_avg || 0;
  const avgLine = new Array(dates.length).fill(dailyAvg);

  // Line Chart
  if (lineChart){
    //lineChart.destroy();
    lineChart.data.labels = dates;
    lineChart.data.datasets[0].data = totalTransits;
    lineChart.data.datasets[1].data = avgLine;
    lineChart.update();
  } else {
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
            borderWidth: dates.length > 100 ? 1 : 2,
          },
          {
            label: "Media Giornaliera",
            data: avgLine,
            borderColor: "red",
            borderDash: [5, 5],
            fill: false,
            borderWidth: dates.length > 100 ? 1 : 2,
          }
        ],
      },
      options: {
        animation: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Data"
            },
          },
          y: {
            title: {
              display: true,
              text: "Numero di Transiti"
            },
            ticks: {
              callback: function(value) { return Math.round(value); },
            },
          }
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',
              threshold: 1, 
              modifierKey: null,
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
            },
             limits: {
              y: { min: 0 }
            }
          }
        }
      }
    });
  }

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
      scales: {
        x: {
          title: {
            display: true,
            text: "Giorno della Settimana"
          }
        },
        y: {
          title: {
            display: true,
            text: "Media Transiti"
          }
        }
      }
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
      scales: {
        x: {
          title: {
            display: true,
            text: "Totale Transiti"
          }
        },
        y: {
          title: {
            display: true,
            text: "Settimana"
          }
        }
      }
    }
  });
}

stationSelect.addEventListener("change", () => {
  fetchAndRenderData(stationSelect.value);
});

fetchStationIds();
setInterval(() => fetchAndRenderData(stationSelect.value), 5000);
