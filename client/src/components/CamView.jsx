import React from "react";
import { useData } from "../context/DataContext";

function CamView() {
  const { status, lastUpdateTime, plants } = useData();

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-3">Camera & AI Monitoring</h2>

      <div><strong>Status:</strong> {status}</div>
      <div><strong>Last Update:</strong> {lastUpdateTime}</div>

      <hr />

      <div className="row mt-4 scroll">
        {(!plants || plants.length === 0) && (
          <div className="text-muted">No plant data available</div>
        )}

        {plants?.map((p) => (
          <div className="col-md-6 col-lg-6 mb-4" key={p.id}>
            <div className="card shadow-sm" style={{ borderRadius: "10px" }}>
              {p.image && p.image.length > 0 ? (
                <img
                  src={`data:image/jpeg;base64,${p.image}`}
                  alt="Plant"
                  className="card-img-top h-100"
                  style={{ height: "180px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center text-muted"
                  style={{
                    height: "180px",
                    background: "#f5f5f5",
                    borderRadius: "10px 10px 0 0",
                  }}
                >
                  No Image
                </div>
              )}

              <div className="card-body">
                <h5 className="card-title">Plant {p.id}</h5>

                <p className="card-text mb-1">
                  <strong>Label:</strong> {p.label}
                </p>

                <p className="card-text mb-1">
                  <strong>Accuracy:</strong> {(p.confidence * 100).toFixed(2)}%
                </p>

                <p className="card-text mb-1">
                  <strong>Signal:</strong>{" "}
                  <span
                    className={`badge ${
                      p.signal === "green"
                        ? "bg-success"
                        : p.signal === "yellow"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  >
                    {p.signal}
                  </span>
                </p>

                <p className="card-text mb-1">
                  <strong>Height:</strong> {p.height_cm} mm
                </p>

                <p className="card-text">
                  <strong>Predicted:</strong> {p.predicted_height_cm.toFixed(2)} cm
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CamView;
