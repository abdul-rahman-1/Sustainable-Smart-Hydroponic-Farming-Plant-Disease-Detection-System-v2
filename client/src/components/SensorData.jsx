import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

function SensorData({ label, dataKey, avgKey, chartColor, unit }) {
  const [sensorStatus, setSensorStatus] = useState("Loading...");
  const [lastValue, setLastValue] = useState("N/A");
  const [lastUpdateTime, setLastUpdateTime] = useState("Loading...");

  const ctx = useRef(null);
  const chartRef = useRef(null);
  const previousStatus = useRef(sensorStatus);

  const initChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(ctx.current, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: `${label} (${unit})`,
          data: [],
          borderColor: chartColor,
          backgroundColor: chartColor.replace("1)", "0.2)"),
          fill: true,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Time" } },
          y: { title: { display: true, text: `${label} (${unit})` } },
        },
      },
    });
  };

  const fetchSensorData = async () => {
    try {
      const res = await fetch(
        "https://rk-server.up.railway.app/api/data",
        { headers: { serv: "aosrhglakjhfglkjahrsoutyapow448097539208475908274dilfhgjalsh24jthwkljhlkjhw45th3lkj5h34lkj5h32lk4jhlkjhqlwekjrhtlkjwh35M" } }
      );
      const data = await res.json();
      const payload = data[0] || {};
      console.log(data);
      const currentStatus = payload.Sensor || "Offline";

      // Reset chart on reconnect
      if (
        currentStatus === "Online" &&
        ["Offline", "Error_Offline"].includes(previousStatus.current)
      ) {
        initChart();
      }
      previousStatus.current = currentStatus;
      setSensorStatus(currentStatus);

      // Update last update time
      if (payload.LastUpdate) {
        setLastUpdateTime(
          `${payload.LastUpdate.Date || "N/A"} ${payload.LastUpdate.Time || "N/A"}`
        );
      }

      // Handle sensor reading
      if (currentStatus === "Online") {
        const value = payload[dataKey];
        setLastValue(value != null ? value : "N/A");
        updateChart(value);
      } else {
        handleOfflineStatus(payload);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setSensorStatus("Error");
      setLastUpdateTime("N/A");
      setLastValue("N/A");
    }
  };

  const updateChart = (value) => {
    if (chartRef.current && value != null) {
      const t = new Date().toLocaleTimeString();
      chartRef.current.data.labels.push(t);
      chartRef.current.data.datasets[0].data.push(value);
      if (chartRef.current.data.labels.length > 10) {
        chartRef.current.data.labels.shift();
        chartRef.current.data.datasets[0].data.shift();
      }
      chartRef.current.update();
    }
  };

  const handleOfflineStatus = (payload) => {
    const avgData = (payload[avgKey]?.split(",") || []).map((it) => {
      const [val, tm] = it.split(":");
      return { value: parseFloat(val), time: tm || "Unknown" };
    });
    setLastValue(avgData.length ? `${avgData.at(-1).value} ${unit}` : "N/A");
    if (chartRef.current) {
      chartRef.current.data.labels = avgData.map((i) => i.time);
      chartRef.current.data.datasets[0].data = avgData.map((i) => i.value);
      chartRef.current.update();
    }
  };

  useEffect(() => {
    initChart();
    const iv = setInterval(fetchSensorData, 2000);
    return () => {
      clearInterval(iv);
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div className="App temp">
      <div className="row cont">
        <div className="text col-md-4">
          <h1>{label} Sensor Data</h1>
          <div><strong>Sensor Status:</strong> {sensorStatus}</div>
          <div><strong>Last Update Time:</strong> {lastUpdateTime}</div>
          <div><strong>Last {label}:</strong> {lastValue} {sensorStatus === "Online" ? unit : ""}</div>
        </div>
        <div className="col-md-8">
          <canvas ref={ctx}></canvas>
        </div>
      </div>
    </div>
  );
}

export default SensorData;
