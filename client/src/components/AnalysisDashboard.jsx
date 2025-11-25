import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./App.css";
import { useData } from "../context/DataContext";

/** --- Constants (kept) --- */
const COAL_KWH_PER_KG = 6.67;
const CO2_PER_KWH = 0.9;
const CO2_PER_TREE_PER_YEAR = 21;

/** --- Chart helper (kept) --- */
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
        scales: {
          x: { ticks: { maxRotation: 0, autoSkip: true } },
          y: { beginAtZero: true },
        },
      },
    });
  } else {
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = data;
    chartRef.current.update("none");
  }
};

/** --- Small UI helpers (new) --- */
const SectionCard = ({ title, children, right }) => (
  <div className="card p-3 mb-4 shadow-sm">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h5 className="mb-0">{title}</h5>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ children }) => (
  <span className="badge rounded-pill bg-accent me-2 mb-2">{children}</span>
);

export default function AnalysisDashboard() {
  const { payload, parseAvgString } = useData();
  const [ready, setReady] = useState(false);

  /** canvases */
  const solarCanvas = useRef(null);
  const batteryCanvas = useRef(null);
  const loadCanvas = useRef(null);
  const compareCanvas = useRef(null);

  /** chart refs */
  const solarChartRef = useRef(null);
  const batteryChartRef = useRef(null);
  const loadChartRef = useRef(null);
  const compareChartRef = useRef(null);

  useEffect(() => {
    setReady(true);
    return () => {
      [solarChartRef, batteryChartRef, loadChartRef, compareChartRef].forEach((ref) => {
        try {
          ref.current?.destroy();
        } catch {}
      });
    };
  }, []);

  /** --- Derived metrics (kept) --- */
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
      solarV,
      batteryV,
      loadV,
      solarI,
      batteryI,
      loadI,
      solarW,
      batteryW,
      loadW,
      solarDaily_kWh,
      loadDaily_kWh,
      generated_kWh,
      consumed_kWh,
      netSaved_kWh,
      coalSavedKg,
      treesEquivalent,
    };
  };

  /** --- Charts data binding (kept) --- */
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
            { label: "Solar", borderColor: "rgba(255,206,86,1)", data: solarData, tension: 0.3, fill: false },
            { label: "Battery", borderColor: "rgba(255,99,132,1)", data: batteryData, tension: 0.3, fill: false },
            { label: "Load", borderColor: "rgba(54,162,235,1)", data: loadData, tension: 0.3, fill: false },
          ],
        },
        options: {
          animation: false,
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            x: { ticks: { maxRotation: 0, autoSkip: true } },
            y: { beginAtZero: true },
          },
        },
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

  if (!payload) return <div className="container scroll">No Data Available</div>;
  const m = computeMetrics(payload);

  /** progress (kept) */
  const pHseries = parseAvgString(payload?.Avg_pH || "");
  const daysCollected = pHseries.length;
  const recommendedDays = 28;
  const progressPct = Math.min(100, Math.round((daysCollected / recommendedDays) * 100));

  /** convenience: date */
  const todayDate = payload?.LastUpdate?.Date || "—";

  return (
    /** scroll class added on main wrapper (requested) */
    <div className="container my-4 text-light scroll">
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
.title-shadow { text-shadow: 0 6px 18px rgba(0,0,0,.35); }
.hr-soft { border-color: rgba(255,255,255,.15); opacity:.75; }
.kv { font-weight:600; opacity:.9 }
`}
      </style>

      {/* ====== HERO / HEADER & CREDITS (NEW) ====== */}
      <div className="card glass p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div>
            <h2 className="mb-2 title-shadow">
              Harvesting Sustainability: GreenTech for Hydroponic Farming with Waste Water Management
            </h2>
            <div className="d-flex flex-wrap gap-2">
              <Pill>Solar-Powered</Pill>
              <Pill>IoT & AI</Pill>
              <Pill>Hydroponics</Pill>
              <Pill>Wastewater Reuse</Pill>
              <Pill>Real-time Dashboard</Pill>
            </div>
          </div>

          <div className="credits card bg-dark-2 p-3 rounded-3 shadow-sm w-100 w-lg-auto">
            <div className="small text-muted mb-1">BY</div>
            <div className="mb-1 fw-semibold">Developed by (Students):</div>
            <ul className="mb-0 ps-3">
              <li>Abdul Rahman — Enrollment: 23001001128 — B.Tech CSE (A)</li>
              <li>Mohammed Qambar Syed — Enrollment: 2100100918 — B.Tech CSE (C)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ====== KPI CARDS (kept) ====== */}
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

      {/* ====== Efficiency (kept) ====== */}
      <SectionCard title="GreenTech System Efficiency">
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Generated (kWh)</th>
                <th>Consumed (kWh)</th>
                <th>Net Saved (kWh)</th>
                <th>Coal Saved (kg)</th>
                <th>Trees (yr eqv.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{todayDate}</td>
                <td>{m.generated_kWh.toFixed(3)}</td>
                <td>{m.consumed_kWh.toFixed(3)}</td>
                <td>{m.netSaved_kWh.toFixed(3)}</td>
                <td>{m.coalSavedKg.toFixed(3)}</td>
                <td>{m.treesEquivalent.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ====== Charts Row (kept) ====== */}
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

      {/* ====== Environmental Impact (kept) + Hydroponic Growth (kept) ====== */}
      <div className="row">
        <div className="card p-3 mb-4 col-md-5 analysis-card">
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

        <div className="card p-3 mb-4 col-md-5 analysis-card">
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
      </div>

      {/* ====== Progress (kept) ====== */}
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
      {/* ====== NEW SECTION: PROJECT ARCHITECTURE & VISUALS ====== */}
      <SectionCard
        title="V. Project Architecture & Visuals"
        right={<span className="badge bg-accent text-dark">Visuals</span>}
      >
        <p className="text-muted small mb-4">
          The following figures illustrate the complete IoT circuit, data architecture,
          and solar power program logic used in the <strong>GreenTech Hydroponic System</strong>.
        </p>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-dark-2 p-2 h-100 shadow-sm">
              <img
                src="/images/1.jpg"
                alt="IoT Circuit Diagram"
                className="img-fluid rounded-3"
              />
              <div className="text-center mt-2 small text-muted">
                <strong>Figure 1:</strong> IoT Circuit Diagram showing sensors, ESP32 nodes,
                Raspberry Pi 5 master, and relay control.
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card bg-dark-2 p-2 h-100 shadow-sm">
              <img
                src="/images/5.png"
                alt="Data Flow & Architecture Diagram"
                className="img-fluid rounded-3"
              />
              <div className="text-center mt-2 small text-muted">
                <strong>Figure 2:</strong> Data Flow Architecture of the GreenTech system
                showing sensor data transmission, AI analysis, and dashboard visualization.
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card bg-dark-2 p-2 h-100 shadow-sm">
              <img
                src="/images/6.png"
                alt="Power Program Diagram"
                className="img-fluid rounded-3"
              />
              <div className="text-center mt-2 small text-muted">
                <strong>Figure 3:</strong> Solar Power Management & Program Logic — showcasing
                battery charging, load balancing, and solar control.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>



      {/* ====== FOOTER ====== */}
      <div className="text-center text-muted small mb-5">
        <hr className="hr-soft my-4" />
        <div>Dashboard &amp; implementation by <strong>Abdul Rahman</strong>.</div>
        <div>Last update: {todayDate}</div>
      </div>
    </div>
  );
}
