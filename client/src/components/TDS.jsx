import React from 'react';
import SensorData from "./SensorData";

function TDS() {
  return (
    <SensorData
      label="TDS"
      dataKey="TDS"
      avgKey="Avg_TDS"
      chartColor="rgba(255, 159, 64, 1)" // Orange tone
      unit="ppm"
    />
  );
}

export default TDS;
