import React from "react";
import SensorData from "./SensorData";

function Light() {
  return (
    <SensorData
      label="Light Intensity"
      dataKey="Lux"
      avgKey="Avg_Lux"
      chartColor="rgba(255, 206, 86, 1)" // Yellow shade
      unit="Lux"
    />
  );
}

export default Light;
