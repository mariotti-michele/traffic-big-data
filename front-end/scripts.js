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
        const formattedDate = new Date(lastDate).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
        lastUpdateEl.textContent = `Dati aggiornati al ${formattedDate}`;
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

    const dates = transits.map(e => {
        const dateObj = new Date(e.date);
        return dateObj.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    });

    const totalTransits = transits.map(e => e.total_transits);

    const dailyAvg = stats[0]?.daily_avg || 0;
    const avgLine = new Array(dates.length).fill(dailyAvg);

    if (lineChart){
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

    const dayAvg = stats[0]?.day_of_week_avg || {};
    const dayNames = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
    const days = Object.keys(dayAvg).map(d => dayNames[parseInt(d) - 1]);
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

    const weekly = stats[0]?.weekly_total || {};
    const totals = Object.values(weekly);

    const sortedDates = transits
        .map(e => new Date(e.date))
        .sort((a, b) => a - b);

    const weekLabels = [];
    let startDate = new Date(sortedDates[0]);

    const format = (date) =>
    date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });

    for (let i = 0; i < totals.length; i++) {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (i === 0 ? 4 : 6));

    weekLabels.push(`${format(startDate)} - ${format(endDate)}`);

    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() + 1);
    }

    if (barChartWeek) barChartWeek.destroy();
    barChartWeek = new Chart(document.getElementById("barChartWeek"), {
        type: "bar",
        data: {
            labels: weekLabels,
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
