import React, { useState } from "react";

const DatePromptModal = ({ fileName, onSave, onCancel }) => {
  const [date, setDate] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div className="card" style={{ minWidth: "320px", maxWidth: "94vw" }}>
        <div style={{ fontWeight: 800, marginBottom: "6px" }}>
          Set date for: {fileName}
        </div>
        <div className="muted" style={{ marginBottom: "10px" }}>
          We couldn't infer a date from the filename. Choose the service date
          for this CSV.
        </div>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div
          className="row"
          style={{ marginTop: "12px", justifyContent: "flex-end" }}
        >
          <button className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => onSave(date)}
            disabled={!date}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePromptModal;
