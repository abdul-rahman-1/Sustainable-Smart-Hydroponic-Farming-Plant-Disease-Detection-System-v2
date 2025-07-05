import React from "react";
import SensorData from "./SensorData";

function Ph() {
  return (
    <SensorData
      label="pH"
      dataKey="pH"
      avgKey="Avg_pH"
      chartColor="rgba(153, 102, 255, 1)"
      unit="pH"
    />
  );
}

export default Ph;
