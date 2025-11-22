import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./App.css";
import { useData } from "../context/DataContext";

const COAL_KWH_PER_KG = 6.67;
const CO2_PER_KWH = 0.9;
const CO2_PER_TREE_PER_YEAR = 21;

const createChart = (canvas, chartRef, labels, data, color) => {
  if (!canvas.current) return;
  if (!chartRef.current) {
    chartRef.current = new Chart(canvas.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Value",
            data,
            borderColor: color,
            backgroundColor: color.replace("1)", "0.2)"),
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: { legend: { display: false } },
      },
    });
  } else {
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = data;
    chartRef.current.update("none");
  }
};

export default function AnalysisDashboard() {
  const { payload, parseAvgString } = useData();
  const [ready, setReady] = useState(false);

  const solarCanvas = useRef(null);
  const batteryCanvas = useRef(null);
  const loadCanvas = useRef(null);
  const compareCanvas = useRef(null);

  const solarChartRef = useRef(null);
  const batteryChartRef = useRef(null);
  const loadChartRef = useRef(null);
  const compareChartRef = useRef(null);

  useEffect(() => {
    setReady(true);
    return () => {
      [solarChartRef, batteryChartRef, loadChartRef, compareChartRef].forEach((ref) => {
        try { ref.current?.destroy(); } catch {}
      });
    };
  }, []);

  const computeMetrics = (p) => {
    const solarV = p.SolarVoltage ?? 18;
    const batteryV = p.BatteryVoltage ?? 12.8;
    const loadV = p.LoadVoltage ?? 12.8;

    const solarI = Number(p.SolarCurrent ?? 0);
    const batteryI = Number(p.BatteryCurrent ?? 0);
    const loadI = Number(p.LoadCurrent ?? 0);

    const solarW = solarI * solarV;
    const batteryW = batteryI * batteryV;
    const loadW = loadI * loadV;

    const solarDaily_kWh = (solarW * 24) / 1000;
    const loadDaily_kWh = (loadW * 24) / 1000;

    const generated_kWh = solarDaily_kWh;
    const consumed_kWh = loadDaily_kWh;
    const netSaved_kWh = Math.max(0, generated_kWh - consumed_kWh);

    const coalSavedKg = netSaved_kWh / COAL_KWH_PER_KG;
    const treesEquivalent = (netSaved_kWh * CO2_PER_KWH) / CO2_PER_TREE_PER_YEAR;

    return {
      solarV, batteryV, loadV,
      solarI, batteryI, loadI,
      solarW, batteryW, loadW,
      solarDaily_kWh, loadDaily_kWh,
      generated_kWh, consumed_kWh, netSaved_kWh,
      coalSavedKg, treesEquivalent,
    };
  };

  useEffect(() => {
    if (!ready || !payload) return;

    const avgSolar = parseAvgString(payload.Avg_SolarCurrent);
    const avgBattery = parseAvgString(payload.Avg_BatteryCurrent);
    const avgLoad = parseAvgString(payload.Avg_LoadCurrent);

    const solarLabels = avgSolar.map((i) => i.time);
    const solarData = avgSolar.map((i) => i.value);
    const batteryLabels = avgBattery.map((i) => i.time);
    const batteryData = avgBattery.map((i) => i.value);
    const loadLabels = avgLoad.map((i) => i.time);
    const loadData = avgLoad.map((i) => i.value);

    createChart(solarCanvas, solarChartRef, solarLabels, solarData, "rgba(255,206,86,1)");
    createChart(batteryCanvas, batteryChartRef, batteryLabels, batteryData, "rgba(255,99,132,1)");
    createChart(loadCanvas, loadChartRef, loadLabels, loadData, "rgba(54,162,235,1)");

    if (!compareChartRef.current) {
      compareChartRef.current = new Chart(compareCanvas.current, {
        type: "line",
        data: {
          labels: solarLabels,
          datasets: [
            { label: "Solar", borderColor: "rgba(255,206,86,1)", data: solarData, tension: 0.3 },
            { label: "Battery", borderColor: "rgba(255,99,132,1)", data: batteryData, tension: 0.3 },
            { label: "Load", borderColor: "rgba(54,162,235,1)", data: loadData, tension: 0.3 },
          ],
        },
        options: { animation: false, responsive: true },
      });
    } else {
      compareChartRef.current.data.labels = solarLabels;
      compareChartRef.current.data.datasets[0].data = solarData;
      compareChartRef.current.data.datasets[1].data = batteryData;
      compareChartRef.current.data.datasets[2].data = loadData;
      compareChartRef.current.update("none");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, ready]);

  if (!payload) return <div className="container">No Data Available</div>;
  const m = computeMetrics(payload);

  const pHseries = parseAvgString(payload?.Avg_pH || "");
  const daysCollected = pHseries.length;
  const recommendedDays = 28;
  const progressPct = Math.min(100, Math.round((daysCollected / recommendedDays) * 100));

  return (
    <div className="container my-4 text-light">
      <style>
        {`
.analysis-card {
  height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.analysis-card table { flex-grow: 1; overflow-y: auto; }
`}
      </style>
      <h2 className="mb-4">Project Analysis & Insights</h2>

      <div className="scroll">
        {/* ===== OVERVIEW CARDS ===== */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <div className="text-muted small">Solar (inst)</div>
              <h5>
                {m.solarI.toFixed(2)} A @ {m.solarV.toFixed(1)} V
              </h5>
              <div>
                {m.solarW.toFixed(1)} W — ~{m.solarDaily_kWh.toFixed(2)} kWh/day
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <div className="text-muted small">Battery (inst)</div>
              <h5>
                {m.batteryI.toFixed(2)} A @ {m.batteryV.toFixed(1)} V
              </h5>
              <div>
                {m.batteryW.toFixed(1)} W — ~{m.solarDaily_kWh.toFixed(2)} kWh/day
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <div className="text-muted small">Load (inst)</div>
              <h5>
                {m.loadI.toFixed(2)} A @ {m.loadV.toFixed(1)} V
              </h5>
              <div>
                {m.loadW.toFixed(1)} W — ~{m.loadDaily_kWh.toFixed(2)} kWh/day
              </div>
            </div>
          </div>
        </div>

        {/* ===== EFFICIENCY TABLE ===== */}
        <div className="card p-3 mb-4">
          <h5>GreenTech System Efficiency</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Generated</th>
                <th>Consumed</th>
                <th>Net Saved</th>
                <th>Coal Saved</th>
                <th>Trees</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{payload.LastUpdate?.Date}</td>
                <td>{m.generated_kWh.toFixed(3)}</td>
                <td>{m.consumed_kWh.toFixed(3)}</td>
                <td>{m.netSaved_kWh.toFixed(3)}</td>
                <td>{m.coalSavedKg.toFixed(3)}</td>
                <td>{m.treesEquivalent.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== CHART ROW ===== */}
        <div className="row">
          <div className="card p-3 mb-3 col-md-5">
            <h5>Solar Current (7-day avg)</h5>
            <canvas ref={solarCanvas}></canvas>
          </div>

          <div className="card p-3 mb-3 col-md-5">
            <h5>Battery Current (7-day avg)</h5>
            <canvas ref={batteryCanvas}></canvas>
          </div>

          <div className="card p-3 mb-3 col-md-5">
            <h5>Load Current (7-day avg)</h5>
            <canvas ref={loadCanvas}></canvas>
          </div>

          <div className="card p-3 mb-4 col-md-8">
            <h5>Solar vs Battery vs Load (Comparison)</h5>
            <canvas ref={compareCanvas}></canvas>
          </div>
        </div>

        <div className="row">
          {/* ===== CO₂ SAVINGS ===== */}
          <div className="card p-3 mb-4 col-md-3 analysis-card">
            <h5>Environmental Impact — CO₂ & Green Savings</h5>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>CO₂ Saved (kg/day)</td>
                  <td>{(m.netSaved_kWh * CO2_PER_KWH).toFixed(3)}</td>
                </tr>
                <tr>
                  <td>Coal Not Burnt (kg/day)</td>
                  <td>{m.coalSavedKg.toFixed(3)}</td>
                </tr>
                <tr>
                  <td>Tree Equivalent</td>
                  <td>{m.treesEquivalent.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card p-3 mb-4 col-md-3 analysis-card">
            <h5>CO₂ Emission Comparison</h5>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>Solar Energy</td>
                  <td>0.000</td>
                </tr>
                <tr>
                  <td>Coal Power Equivalent</td>
                  <td>{(m.generated_kWh * CO2_PER_KWH).toFixed(3)}</td>
                </tr>
                <tr>
                  <td>Tree Burning Equivalent</td>
                  <td>{(m.generated_kWh * 1.8).toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== Hydroponic Growth ===== */}
          <div className="card mb-4 p-3 col-md-5 analysis-card">
            <h5>1. Hydroponic Growth Metrics</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Plant</th>
                    <th>Height</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const plant = payload[`Plant_${i + 1}`] || {};
                    return (
                      <tr key={i}>
                        <td>{payload.LastUpdate?.Date}</td>
                        <td>{plant.label || `Plant_${i + 1}`}</td>
                        <td>{plant.height_cm ?? "N/A"}</td>
                        <td>{plant.signal ?? ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== PROGRESS BAR ===== */}
        <div className="card mb-4 p-3">
          <h5>Recommended Duration for Data Collection</h5>

          <table className="table table-sm">
            <tbody>
              <tr>
                <td>Plant Growth</td>
                <td>28–42 days</td>
                <td>Full growth cycle</td>
              </tr>
              <tr>
                <td>Water Reuse</td>
                <td>28–42 days</td>
                <td>Daily variations</td>
              </tr>
              <tr>
                <td>Solar Efficiency</td>
                <td>14–28 days</td>
                <td>Weather variation</td>
              </tr>
            </tbody>
          </table>

          <div className="d-flex justify-content-between">
            <div>Plant Growth Observation Progress</div>
            <div>{progressPct}%</div>
          </div>

          <div className="progress" style={{ height: 18 }}>
            <div
              className="progress-bar progress-bar-striped"
              role="progressbar"
              style={{ width: `${progressPct}%` }}
            >
              {progressPct}%
            </div>
          </div>

          <small className="text-muted">
            Based on {daysCollected} days of Avg_pH entries. Goal: {recommendedDays} days.
          </small>
        </div>
      </div>
    </div>
  );
}
