import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Centralized data layer:
 * - Fetches /api/data from Render (uses serv key from env)
 * - Polls every 2s when Online, every 10s when Offline
 * - Exposes:
 *   - payload (latest document from Mongo)
 *   - status ("Online" | "Offline" | "Error" | "Loading...")
 *   - lastUpdateTime ("DD/MM HH:mm" or "N/A")
 *   - timeSeries: rolling arrays per live key for realtime charts
 *   - parseAvgString: helper to parse Avg_* strings
 */

const DataContext = createContext(null);

const LIVE_KEYS = [
  "Temperature",
  "Humidity",
  "CO2",
  "Lux",
  "TDS",
  "FlowRate",
  "Level",
  "pH",
  "BatteryCurrent",
  "LoadCurrent",
  "SolarCurrent",
];

export function DataProvider({
  children,
  pollMsOnline = 2000,
  pollMsOffline = 10000,
  seriesMaxPoints = 60,
}) {
  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [lastUpdateTime, setLastUpdateTime] = useState("Loading...");
  const [timeSeries, setTimeSeries] = useState({}); // { key: [{time, value}], ... }

  const apiBase =  "https://api-server-0f64.onrender.com";
  const servKey = import.meta.env.VITE_REACT_KEY;

  const pollTimerRef = useRef(null);
  const abortRef = useRef(null);

  // ---- Helpers ----
  const parseAvgString = (avgStr = "") =>
    (avgStr || "")
      .split(",")
      .map((s) => {
        const [v, t] = s.split(":");
        const value = parseFloat(v);
        return { value: Number.isFinite(value) ? value : null, time: t || "Unknown" };
      })
      .filter((x) => x.value != null);

  // push one realtime point per LIVE_KEYS into timeSeries (bounded length)
  const pushLivePoint = (doc) => {
    setTimeSeries((prev) => {
      const next = { ...prev };
      const time = new Date().toLocaleTimeString();
      LIVE_KEYS.forEach((k) => {
        const val = doc?.[k];
        if (val == null) return;
        const arr = Array.isArray(next[k]) ? [...next[k]] : [];
        arr.push({ time, value: val });
        if (arr.length > seriesMaxPoints) arr.shift();
        next[k] = arr;
      });
      return next;
    });
  };

  const fetchOnce = async () => {
    if (!servKey) {
      console.error("VITE_REACT_KEY missing. Add it to your .env.");
      setStatus("Error");
      return;
    }
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${apiBase}/api/data`, {
        method: "GET",
        headers: { serv: servKey },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const doc = Array.isArray(json) ? json[0] : json;

      setPayload(doc || null);

      const s = doc?.Sensor || "Offline";
      setStatus(s);

      if (doc?.LastUpdate) {
        const { Date: d, Time: t } = doc.LastUpdate;
        setLastUpdateTime(`${d || "N/A"} ${t || "N/A"}`);
      } else {
        setLastUpdateTime("N/A");
      }

      if (s === "Online" && doc) {
        pushLivePoint(doc);
      }
    } catch (err) {
      console.error("Data fetch error:", err);
      setStatus("Error");
    }
  };

  // Dynamic polling based on status
  useEffect(() => {
    // first fetch on mount
    fetchOnce();

    return () => {
      clearInterval(pollTimerRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adjust polling interval when status changes
  useEffect(() => {
    clearInterval(pollTimerRef.current);
    const intervalMs = status === "Online" ? pollMsOnline : pollMsOffline;
    pollTimerRef.current = setInterval(fetchOnce, intervalMs);
    return () => clearInterval(pollTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pollMsOnline, pollMsOffline]);

  const value = useMemo(
    () => ({
      payload,
      status,
      lastUpdateTime,
      timeSeries,
      parseAvgString,
    }),
    [payload, status, lastUpdateTime, timeSeries]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
