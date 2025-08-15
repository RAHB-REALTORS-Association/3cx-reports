import React from "react";
import Controls from "./Controls";
import FileManager from "./FileManager";
import QueueFilter from "./QueueFilter";
import AgentFilter from "./AgentFilter";

const Sidebar = ({ 
  range, 
  setRange, 
  onBuild, 
  onFilesDrop, 
  files, 
  onFilesChange,
  data,
  selectedQueues,
  selectedAgents,
  onQueueToggle,
  onAgentToggle,
  isCollapsed,
  onToggle
}) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-collapse-btn"
            onClick={onToggle}
            title="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Date Range</h3>
            <Controls
              range={range}
              setRange={setRange}
              onBuild={onBuild}
              onFilesDrop={onFilesDrop}
            />
          </div>

          {files && files.length > 0 && (
            <div className="sidebar-section">
              <h3>File Management</h3>
              <FileManager
                files={files}
                onFilesChange={onFilesChange}
              />
            </div>
          )}

          {data && (data.meta?.availableQueues || data.meta?.availableAgents) && (
            <div className="sidebar-section">
              <h3>Filters</h3>
              <div className="filters-stack">
                {data.meta?.availableQueues && (
                  <QueueFilter
                    availableQueues={data.meta.availableQueues}
                    selectedQueues={selectedQueues}
                    onQueueToggle={onQueueToggle}
                  />
                )}
                {data.meta?.availableAgents && (
                  <AgentFilter
                    availableAgents={data.meta.availableAgents}
                    selectedAgents={selectedAgents}
                    onAgentToggle={onAgentToggle}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
