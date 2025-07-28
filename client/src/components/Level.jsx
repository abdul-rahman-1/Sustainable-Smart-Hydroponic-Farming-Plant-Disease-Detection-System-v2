import React from 'react';
import SensorData from "./SensorData";

function Level() {
  return (
    <SensorData
      label="Water Level"
      dataKey="Level"
      avgKey="Avg_Level"
      chartColor="rgb(99, 255, 247)" // Red tone
      unit="cm"
    />
  );
}

export default Level;
