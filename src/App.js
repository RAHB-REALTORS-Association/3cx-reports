import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import KpiGrid from "./components/KpiGrid";
import ChartGrid from "./components/ChartGrid";
import AgentTable from "./components/AgentTable";
import Footer from "./components/Footer";
import { listFiles, storeFiles, updateFileDate } from "./utils/dataStore";
import { build } from "./services/reportService";
import DatePromptModal from "./components/DatePromptModal";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [range, setRange] = useState({ from: "", to: "" });
  const [selectedQueues, setSelectedQueues] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
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
    const data = build(
      range, 
      selectedQueues.length > 0 ? selectedQueues : null,
      selectedAgents.length > 0 ? selectedAgents : null
    );
    if (!data) {
      alert("No files in the selected range. Import CSVs or adjust dates.");
      return;
    }
    setData(data);
  };

  const handleFilesDrop = async (newFiles) => {
    const result = await storeFiles(newFiles);
    const allFiles = listFiles();
    setFiles(allFiles);
    
    // Show user feedback about what happened
    const { summary } = result;
    let message = '';
    
    if (summary.stored.length > 0) {
      message += `✅ Stored ${summary.stored.length} file(s)\n`;
    }
    
    if (summary.duplicates.length > 0) {
      message += `⚠️ Skipped ${summary.duplicates.length} duplicate file(s)\n`;
    }
    
    if (summary.overlaps.length > 0) {
      message += `📅 Found ${summary.overlaps.length} file(s) with overlapping dates\n`;
    }
    
    if (summary.conflicts.length > 0) {
      message += `⚠️ Found ${summary.conflicts.length} file(s) with potential data conflicts\n`;
      message += `This may cause double-counting of metrics.\n`;
    }
    
    if (message) {
      alert(message.trim());
    }
    
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
      const newData = build(
        range, 
        newSelectedQueues.length > 0 ? newSelectedQueues : null,
        selectedAgents.length > 0 ? selectedAgents : null
      );
      setData(newData);
    }
  };

  const handleAgentToggle = (agent, action) => {
    let newSelectedAgents;
    
    if (action === 'all') {
      newSelectedAgents = [];
    } else if (action === 'none') {
      newSelectedAgents = data?.meta?.availableAgents || [];
    } else {
      if (selectedAgents.length === 0) {
        // If all were selected, start with all except the toggled one
        const allAgents = data?.meta?.availableAgents || [];
        newSelectedAgents = allAgents.filter(a => a !== agent);
      } else if (selectedAgents.includes(agent)) {
        // Remove the agent
        newSelectedAgents = selectedAgents.filter(a => a !== agent);
      } else {
        // Add the agent
        newSelectedAgents = [...selectedAgents, agent];
      }
    }
    
    setSelectedAgents(newSelectedAgents);
    
    // Rebuild dashboard with new agent selection
    if (range.from && range.to) {
      const newData = build(
        range, 
        selectedQueues.length > 0 ? selectedQueues : null,
        newSelectedAgents.length > 0 ? newSelectedAgents : null
      );
      setData(newData);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        range={range}
        setRange={setRange}
        onBuild={handleBuildDashboard}
        onFilesDrop={handleFilesDrop}
        files={files}
        onFilesChange={refreshFiles}
        data={data}
        selectedQueues={selectedQueues}
        selectedAgents={selectedAgents}
        onQueueToggle={handleQueueToggle}
        onAgentToggle={handleAgentToggle}
      />
      
      <div className="main-content">
        <Header data={data} range={range} />
        {data && (
          <main className="grid" style={{ gridTemplateRows: "auto auto 1fr" }}>
            <KpiGrid kpis={data.kpis} />
            <ChartGrid data={data} />
            <AgentTable tableData={data.table} meta={data.meta} kpis={data.kpis} />
          </main>
        )}
        <Footer />
      </div>
      
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
