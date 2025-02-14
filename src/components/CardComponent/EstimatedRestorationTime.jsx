import React from "react";

const EstimatedRestorationTime = ({ date, time }) => {
  return (
    <div style={{ flex: 2 }}>
      <p>
        <strong>Прогноз восстановления:</strong> {date} {time}
      </p>
    </div>
  );
};

export default EstimatedRestorationTime;
