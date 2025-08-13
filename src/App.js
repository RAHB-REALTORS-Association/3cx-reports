import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Header from "./components/Header";
import Controls from "./components/Controls";
import KpiGrid from "./components/KpiGrid";
import ChartGrid from "./components/ChartGrid";
import AgentTable from "./components/AgentTable";
import { listFiles, storeFiles, updateFileDate } from "./utils/dataStore";
import { build } from "./services/reportService";
import DatePromptModal from "./components/DatePromptModal";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [range, setRange] = useState({ from: "", to: "" });
  const [promptingFile, setPromptingFile] = useState(null);

  const refreshFiles = () => setFiles(listFiles());

  useEffect(() => {
    refreshFiles();
  }, []);

  useEffect(() => {
    const ensureRangeDefaults = () => {
      if (files.length > 0) {
        const dates = files
          .filter((f) => !!f.date)
          .map((f) => f.date)
          .sort();
        if (dates.length > 0) {
          setRange({ from: dates[0], to: dates[dates.length - 1] });
        }
      }
    };
    ensureRangeDefaults();
  }, [files]);

  const handleBuildDashboard = () => {
    if (!range.from || !range.to) {
      alert("Choose a From and To date first.");
      return;
    }
    const data = build(range);
    if (!data) {
      alert("No files in the selected range. Import CSVs or adjust dates.");
      return;
    }
    setData(data);
  };

  const handleFilesDrop = async (newFiles) => {
    await storeFiles(newFiles);
    const allFiles = listFiles();
    setFiles(allFiles);
    const fileToPrompt = allFiles.find((f) => !f.date);
    if (fileToPrompt) {
      setPromptingFile(fileToPrompt);
    }
  };

  const handleDatePromptSave = (isoDate) => {
    if (promptingFile) {
      updateFileDate(promptingFile.id, isoDate);
      setPromptingFile(null);
      refreshFiles();
    }
  };

  const handleDatePromptCancel = () => {
    setPromptingFile(null);
  };

  return (
    <div className="dashboard">
      <Header data={data} range={range} />
      <Controls
        range={range}
        setRange={setRange}
        onBuild={handleBuildDashboard}
        onFilesDrop={handleFilesDrop}
      />
      {data && (
        <main className="grid" style={{ gridTemplateRows: "auto auto 1fr" }}>
          <KpiGrid kpis={data.kpis} />
          <ChartGrid data={data} />
          <AgentTable tableData={data.table} meta={data.meta} kpis={data.kpis} />
        </main>
      )}
      {promptingFile && (
        <DatePromptModal
          fileName={promptingFile.name}
          onSave={handleDatePromptSave}
          onCancel={handleDatePromptCancel}
        />
      )}
    </div>
  );
}

export default App;
