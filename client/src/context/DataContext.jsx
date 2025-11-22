import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const SERV_KEY = import.meta.env.VITE_REACT_KEY;
const API_URL = "https://api-server-ab9a.onrender.com/api/data";

const DataContext = createContext(null);

export function DataProvider({ children, pollMs = 2000 }) {
  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [lastUpdateTime, setLastUpdateTime] = useState("Loading...");
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const abortRef = useRef(null);

  const fetchOnce = async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch(API_URL, {
        headers: { serv: SERV_KEY },
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      const p = data?.[0] ?? {};

      setPayload(p || null);

      const st = p.Sensor || "Offline";
      setStatus(st);

      if (p.LastUpdate) {
        const { Date: dt, Time: tm } = p.LastUpdate;
        setLastUpdateTime(`${dt || "N/A"} ${tm || "N/A"}`);
      } else {
        setLastUpdateTime("N/A");
      }

      setError(null);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e?.message || "Network error");
        setStatus("Error");
      }
    }
  };

  useEffect(() => {
    // initial fetch immediately on load
    fetchOnce();
    // start polling
    intervalRef.current = setInterval(fetchOnce, pollMs);

    return () => {
      clearInterval(intervalRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  // derived helpers
  const plants = useMemo(() => {
    const arr = [];
    if (!payload) return arr;
    for (let i = 1; i <= 5; i++) {
      const p = payload[`Plant_${i}`];
      if (p) arr.push({ ...p, id: i });
    }
    return arr;
  }, [payload]);

  const value = useMemo(
    () => ({
      payload,
      status,
      lastUpdateTime,
      error,
      plants,
      // parsing helper reused by multiple screens
      parseAvgString: (avgStr = "") =>
        (avgStr || "")
          .split(",")
          .map((s) => {
            const [v, t] = s.split(":");
            const value = parseFloat(v);
            return { value: isNaN(value) ? null : value, time: t || "Unknown" };
          })
          .filter((x) => x.value != null),
    }),
    [payload, status, lastUpdateTime, error, plants]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
