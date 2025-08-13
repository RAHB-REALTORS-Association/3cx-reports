import React from "react";
import Dropzone from "./Dropzone";

const Controls = ({ range, setRange, onBuild, onFilesDrop }) => {
  const handleDateChange = (e) => {
    setRange({ ...range, [e.target.id]: e.target.value });
  };

  const setDateRange = (q) => {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    if (q === "today") {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      setRange({ from: iso(d), to: iso(d) });
    }
    if (q === "yesterday") {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      );
      setRange({ from: iso(d), to: iso(d) });
    }
    if (q === "last7") {
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      setRange({ from: iso(start), to: iso(end) });
    }
  };

  const handleClear = () => {
    if (window.confirm("Remove all imported data and cached dashboards?")) {
      localStorage.removeItem("ivr_data_v2");
      localStorage.removeItem("ivr_dash_cache_v2");
      window.location.reload();
    }
  };

  const handleExport = () => {
    const payload = {
      data: JSON.parse(localStorage.getItem("ivr_data_v2") || "{}"),
      cache: JSON.parse(localStorage.getItem("ivr_dash_cache_v2") || "{}"),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ivr_local_export.json";
    a.click();
  };

  const handleImport = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (obj.data)
          localStorage.setItem("ivr_data_v2", JSON.stringify(obj.data));
        if (obj.cache)
          localStorage.setItem("ivr_dash_cache_v2", JSON.stringify(obj.cache));
        alert("Imported.");
        window.location.reload();
      } catch (err) {
        alert("Invalid JSON.");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="controls">
      <div className="card row">
        <label className="pill">
          From{" "}
          <input
            className="input"
            type="date"
            id="from"
            value={range.from}
            onChange={handleDateChange}
          />
        </label>
        <label className="pill">
          To{" "}
          <input
            className="input"
            type="date"
            id="to"
            value={range.to}
            onChange={handleDateChange}
          />
        </label>
        <button className="btn" onClick={() => setDateRange("today")}>
          Today
        </button>
        <button className="btn" onClick={() => setDateRange("yesterday")}>
          Yesterday
        </button>
        <button className="btn" onClick={() => setDateRange("last7")}>
          Last 7
        </button>
        <button className="btn primary" onClick={onBuild}>
          Build dashboard
        </button>
      </div>
      <div className="card row">
        <Dropzone onFilesDrop={onFilesDrop} />
        <button className="btn" onClick={handleClear}>
          Clear data
        </button>
        <button className="btn" onClick={handleExport}>
          Export data
        </button>
        <input
          id="importData"
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
        <button
          className="btn"
          onClick={() => document.getElementById("importData").click()}
        >
          Import
        </button>
      </div>
    </div>
  );
};

export default Controls;
