import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
const SERV_KEY = import.meta.env.VITE_REACT_KEY;
console.log("aa:"+SERV_KEY);
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
        datasets: [
          {
            label: `${label} (${unit})`,
            data: [],
            borderColor: chartColor,
            backgroundColor: chartColor.replace("1)", "0.2)"),
            fill: true,
            borderWidth: 2,
          },
        ],
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
      const res = await fetch("http://127.0.0.1:3000/api/data", {
        headers: {
          serv: SERV_KEY,
        },
      });
      const data = await res.json();
      const payload = data[0] || {};
      const currentStatus = payload.Sensor || "Offline";

      if (
        currentStatus === "Online" &&
        ["Offline", "Error_Offline"].includes(previousStatus.current)
      ) {
        initChart();
      }
      previousStatus.current = currentStatus;
      setSensorStatus(currentStatus);

      // Set last update
      if (payload.LastUpdate) {
        const { Date: dt, Time: tm } = payload.LastUpdate;
        setLastUpdateTime(`${dt || "N/A"} ${tm || "N/A"}`);
      }

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
    const avgRaw = payload[avgKey] || "";
    const avgData = avgRaw.split(",").map((entry) => {
      const [val, tm] = entry.split(":");
      return {
        value: parseFloat(val),
        time: tm || "Unknown",
      };
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
          <div>
            <strong>Sensor Status:</strong> {sensorStatus}
          </div>
          <div>
            <strong>Last Update Time:</strong> {lastUpdateTime}
          </div>
          <div>
            <strong>Last {label}:</strong> {lastValue}{" "}
            {sensorStatus === "Online" ? unit : ""}
          </div>
        </div>
        <div className="col-md-8">
          <canvas ref={ctx}></canvas>
        </div>
      </div>
    </div>
  );
}

export default SensorData;
