import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useData } from "../context/DataContext";

function SensorData({ label, dataKey, avgKey, chartColor, unit }) {
  const { payload, status, lastUpdateTime, parseAvgString } = useData();

  const [lastValue, setLastValue] = useState("N/A");
  const [sensorStatus, setSensorStatus] = useState("Loading...");

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const prevStatus = useRef(null);

  // init chart
  const initChart = () => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
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
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: { title: { display: true, text: "Time" } },
          y: { title: { display: true, text: `${label} (${unit})` } },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  const pushPoint = (value) => {
    if (!chartRef.current || value == null) return;
    const t = new Date().toLocaleTimeString();
    const ds = chartRef.current.data.datasets[0];
    chartRef.current.data.labels.push(t);
    ds.data.push(value);
    if (ds.data.length > 20) {
      chartRef.current.data.labels.shift();
      ds.data.shift();
    }
    chartRef.current.update("none");
  };

  const showOfflineAvg = (p) => {
    const avg = parseAvgString(p?.[avgKey] || "");
    const labels = avg.map((i) => i.time);
    const values = avg.map((i) => i.value);
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = values;
    chartRef.current.update("none");
    if (values.length) setLastValue(values.at(-1));
    else setLastValue("N/A");
  };

  // initialize chart once
  useEffect(() => {
    initChart();
    return () => chartRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // react to global payload/status updates
  useEffect(() => {
    setSensorStatus(status || "Offline");
    if (!payload) return;

    const currentStatus = status;
    const was = prevStatus.current;

    // re-init when coming back online
    if (currentStatus === "Online" && (was === "Offline" || was === "Error" || was === null)) {
      initChart();
    }
    prevStatus.current = currentStatus;

    if (currentStatus === "Online") {
      const val = payload?.[dataKey];
      setLastValue(val ?? "N/A");
      pushPoint(val);
    } else {
      showOfflineAvg(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, status]);

  return (
    <div className="App temp">
      <div className="row cont">
        <div className="text col-md-4">
          <h1>{label} Sensor Data</h1>
          <div><strong>Sensor Status:</strong> {sensorStatus}</div>
          <div><strong>Last Update Time:</strong> {lastUpdateTime}</div>
          <div>
            <strong>Last {label}:</strong> {lastValue} {sensorStatus === "Online" ? unit : ""}
          </div>
        </div>
        <div className="col-md-8">
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
}

export default SensorData;
