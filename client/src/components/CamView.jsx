import React, { useEffect, useState, useCallback } from "react";

function CamView() {
  const API_BASE = "https://api-server-0f64.onrender.com";
  const API_KEY = import.meta.env.VITE_REACT_KEY;

  const [plants, setPlants] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fetchPlantsSequential = useCallback(async () => {
    setIsFetching(true);
    setCompleted(false);
    setPlants([]);
    setProgress(0);
    setStatusText("Starting data fetch...");

    const results = [];

    for (let i = 1; i <= 5; i++) {
      setStatusText(`Fetching Plant ${i}...`);
      try {
        const res = await fetch(`${API_BASE}/api/plant/${i}`, {
          method: "GET",
          headers: { serv: API_KEY },
        });

        let payload = null;

        if (res.ok) {
          const data = await res.json();
          const doc = Array.isArray(data) ? data[0] || {} : data;
          payload = doc[`Plant_${i}`] || doc;
        }

        if (!payload) payload = { id: i, error: true };
        payload.id = i;

        results.push(payload);
        setPlants([...results]); // instantly render each new plant card
        setProgress(Math.round((i / 5) * 100));
      } catch (err) {
        console.error(`Fetch error for plant ${i}:`, err);
        results.push({ id: i, error: true });
        setPlants([...results]);
        setProgress(Math.round((i / 5) * 100));
      }
    }

    setStatusText("All plant data fetched.");
    setIsFetching(false);
    setCompleted(true);
  }, [API_BASE, API_KEY]);

  useEffect(() => {
    fetchPlantsSequential();
  }, [fetchPlantsSequential]);

  const handleRefresh = () => {
    fetchPlantsSequential();
  };

  return (
    <div className="container mt-4 text-light fade-in scroll">
      <h2 className="mb-1">Camera & AI Monitoring</h2>
      <div className="text-muted small">
        Live Plant Data (fetched from server)
      </div>
      <div className="mt-2">
        <strong>Last Update:</strong> {new Date().toLocaleString()}
      </div>
      <hr />

      {/* Show progress bar only while fetching */}
      {isFetching && (
        <div className="mb-3">
          <div className="progress" style={{ height: 20 }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
          <div className="mt-2 small">{statusText}</div>
        </div>
      )}

      {/* Show refresh message when all done */}
      {!isFetching && completed && (
        <div className="text-center mb-4">
          <h5>All plant data loaded.</h5>
          <p className="text-muted">Click below to fetch the latest data.</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Refresh Data
          </button>
        </div>
      )}

      {/* Render plant cards */}
      <div className="row mt-3">
        {plants.map((p) => (
          <div className="col-md-6 col-lg-6 mb-4" key={p.id}>
            <div className="card shadow-sm fade-in" style={{ borderRadius: "14px" }}>
              {p.image && p.image.length > 0 ? (
                <img
                  src={`data:image/jpeg;base64,${p.image}`}
                  alt={`Plant ${p.id}`}
                  className="card-img-top"
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                />
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center text-muted"
                  style={{
                    height: "200px",
                    background: "#202327",
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                >
                  {p.error ? "Error loading data" : "Loading image..."}
                </div>
              )}

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Plant {p.id}</h5>
                  <span
                    className={`badge ${
                      p.signal === "green"
                        ? "bg-success"
                        : p.signal === "yellow"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  >
                    {p.signal || "N/A"}
                  </span>
                </div>
                <div className="mt-2 small text-muted">
                  {p.timestamp || p.LastUpdated || "-"}
                </div>

                <div className="mt-3">
                  <div><strong>Label:</strong> {p.label || "N/A"}</div>
                  <div>
                    <strong>Accuracy:</strong>{" "}
                    {p.confidence
                      ? (p.confidence * 100).toFixed(2) + "%"
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Height:</strong> {p.height_cm ?? "N/A"} cm
                  </div>
                  <div>
                    <strong>Predicted:</strong>{" "}
                    {p.predicted_height_cm
                      ? p.predicted_height_cm.toFixed(2) + " cm"
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CamView;
