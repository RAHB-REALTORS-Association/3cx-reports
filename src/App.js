import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Header from "./components/Header";
import Controls from "./components/Controls";
import KpiGrid from "./components/KpiGrid";
import ChartGrid from "./components/ChartGrid";
import AgentTable from "./components/AgentTable";
import QueueFilter from "./components/QueueFilter";
import { listFiles, storeFiles, updateFileDate } from "./utils/dataStore";
import { build } from "./services/reportService";
import DatePromptModal from "./components/DatePromptModal";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [range, setRange] = useState({ from: "", to: "" });
  const [selectedQueues, setSelectedQueues] = useState([]);
  const [promptingFile, setPromptingFile] = useState(null);

  const refreshFiles = () => setFiles(listFiles());

  useEffect(() => {
    refreshFiles();
  }, []);

  useEffect(() => {
    const ensureRangeDefaults = () => {
      if (files.length > 0) {
        // Collect all dates from files, including date ranges
        const allDates = [];
        
        files.forEach((f) => {
          if (f.dateRange && f.dateRange.from && f.dateRange.to) {
            // File spans multiple days - include both start and end
            allDates.push(f.dateRange.from, f.dateRange.to);
          } else if (f.date) {
            // Single day file
            allDates.push(f.date);
          }
        });
        
        if (allDates.length > 0) {
          const sortedDates = allDates.sort();
          setRange({ from: sortedDates[0], to: sortedDates[sortedDates.length - 1] });
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
    const data = build(range, selectedQueues.length > 0 ? selectedQueues : null);
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

  const handleQueueToggle = (queue, action) => {
    let newSelectedQueues;
    
    if (action === 'all') {
      newSelectedQueues = [];
    } else if (action === 'none') {
      newSelectedQueues = data?.meta?.availableQueues || [];
    } else {
      if (selectedQueues.length === 0) {
        // If all were selected, start with all except the toggled one
        const allQueues = data?.meta?.availableQueues || [];
        newSelectedQueues = allQueues.filter(q => q !== queue);
      } else if (selectedQueues.includes(queue)) {
        // Remove the queue
        newSelectedQueues = selectedQueues.filter(q => q !== queue);
      } else {
        // Add the queue
        newSelectedQueues = [...selectedQueues, queue];
      }
    }
    
    setSelectedQueues(newSelectedQueues);
    
    // Rebuild dashboard with new queue selection
    if (range.from && range.to) {
      const newData = build(range, newSelectedQueues.length > 0 ? newSelectedQueues : null);
      setData(newData);
    }
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
      {data && data.meta?.availableQueues && (
        <QueueFilter
          availableQueues={data.meta.availableQueues}
          selectedQueues={selectedQueues}
          onQueueToggle={handleQueueToggle}
        />
      )}
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
