import React, { useEffect, useState } from "react";

function CamView() {
  const [status, setStatus] = useState("Loading...");
  const [lastUpdateTime, setLastUpdateTime] = useState("Loading...");
  const [aiResult, setAiResult] = useState("Loading...");
  const [Acc, setAcc] = useState("Loading...");
  const [imageB64, setImageB64] = useState(null);

  const fetchCamData = async () => {
    try {
      const res = await fetch(
        "https://rk-server.up.railway.app/api/data",
        { headers: { serv: "aosrhglakjhfglkjahrsoutyapow448097539208475908274dilfhgjalsh24jthwkljhlkjhw45th3lkj5h34lkj5h32lk4jhlkjhqlwekjrhtlkjwh35M" } }
      );
      
      const data = await res.json();
      const payload = data[0] || {};
      
      console.log(data);
      const currentStatus = payload.Sensor || "Offline";
      setStatus(currentStatus);

      if (payload.LastUpdate) {
        setLastUpdateTime(
          `${payload.LastUpdate.Date || "N/A"} ${payload.LastUpdate.Time || "N/A"}`
        );
      }
      if (payload.AI_Result != null) {
        setAiResult(payload.AI_Result);
      }
      if (payload.Accuracy != null) {
        setAcc(payload.Accuracy);
      }
      if (payload.Image) {
        setImageB64(payload.Image);
      }
    } catch (err) {
      console.error("Error fetching Cam data:", err);
      setStatus("Error");
      setLastUpdateTime("N/A");
      setAiResult("N/A");
    }
  };

  useEffect(() => {
    fetchCamData();
    const iv = setInterval(fetchCamData, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="App temp container">
      <h2>Camera & AI Monitoring</h2>
      <div><strong>Status:</strong> {status}</div>
      <div><strong>Last Update:</strong> {lastUpdateTime}</div>
      <div><strong>AI Result</strong> {aiResult}</div>
      <div><strong>Accuracy</strong> {Acc}</div>
      <div className="col-md-12 mt-4 d-flex align-items-center justify-content-center">
        <div className="col-md-10">
          {imageB64 ? (
            <img
              src={`data:image/jpeg;base64,${imageB64}`}  
              alt="Plant Snapshot"
              style={{ width: "100%", borderRadius: 8 }}
            />
          ) : (
            <div className="text-muted">No image available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CamView;