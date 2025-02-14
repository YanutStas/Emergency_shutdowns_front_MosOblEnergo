import React from "react";

const StartDate = ({ date, time }) => {
  return (
    <div style={{ flex: 2 }}>
      <p>
        <strong>Дата начала:</strong> {date} {time}
      </p>
    </div>
  );
};

export default StartDate;
