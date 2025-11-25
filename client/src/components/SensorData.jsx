import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useData } from "../context/DataContext";

/**
 * Pure subscriber:
 * - Reads {payload, status, lastUpdateTime, timeSeries, parseAvgString} from context
 * - If Offline -> uses Avg_* series (7 points)
 * - If Online  -> uses timeSeries[dataKey] realtime points
 * - Chart is created ONCE, updated in-place only
 */

function SensorData({ label, dataKey, avgKey, chartColor, unit }) {
  const { payload, status, lastUpdateTime, timeSeries, parseAvgString } = useData();

  const [lastValue, setLastValue] = useState("N/A");
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Create chart once
  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: `${label} (${unit})`,
            data: [],
            borderColor: chartColor,
            backgroundColor: chartColor.replace("1)", "0.15)"),
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Time" } },
          y: { title: { display: true, text: `${label} (${unit})` } },
        },
      },
    });

    return () => {
      try {
        chartRef.current?.destroy();
      } catch {}
      chartRef.current = null;
    };
  }, [label, unit, chartColor]);

  // Update chart (no reconstruction) whenever context changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Offline -> show 7-point Avg_* strings
    if (status !== "Online") {
      const avg = parseAvgString(payload?.[avgKey] || "");
      const labels = avg.map((i) => i.time);
      const values = avg.map((i) => i.value);

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update("none");

      setLastValue(values.length ? values[values.length - 1] : "N/A");
      return;
    }

    // Online -> use live timeSeries for this metric
    const live = timeSeries?.[dataKey] || [];
    const labels = live.map((p) => p.time);
    const values = live.map((p) => p.value);

    // If just switched Online and no live points yet, fall back to avg
    if (values.length === 0) {
      const avg = parseAvgString(payload?.[avgKey] || "");
      chart.data.labels = avg.map((i) => i.time);
      chart.data.datasets[0].data = avg.map((i) => i.value);
      chart.update("none");
      setLastValue(avg.length ? avg[avg.length - 1].value : "N/A");
      return;
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update("none");
    setLastValue(values[values.length - 1] ?? "N/A");
  }, [payload, status, timeSeries, avgKey, dataKey, parseAvgString]);

  return (
    <div className="App temp fade-in">
      <div className="row cont">
        <div className="text col-md-4">
          <h1 className="mb-2">{label} Sensor</h1>
          <div className="small text-muted">
            {status === "Online" ? "Realtime (Online)" : "Showing 7-day averages (Offline)"}
          </div>
          <div className="mt-2">
            <strong>Status:</strong> {status}
          </div>
          <div>
            <strong>Last Update:</strong> {lastUpdateTime}
          </div>
          <div className="mt-2">
            <strong>Latest {label}:</strong> {lastValue} {unit}
          </div>
        </div>
        <div className="col-md-8">
          <div style={{ height: 400 }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorData;
