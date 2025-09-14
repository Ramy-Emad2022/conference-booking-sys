import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)} // هذا الكود يعود خطوة واحدة إلى الخلف في التاريخ
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: "#f0f0f0",
        margin: "10px",
      }}
    >
      &larr; Back
    </button>
  );
};

export default BackButton;
