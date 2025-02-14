import React from "react";

const Description = ({ text }) => {
  return (
    <div style={{ flex: 3 }}>
      <p>
        <strong>Описание:</strong> {text}
      </p>
    </div>
  );
};

export default Description;