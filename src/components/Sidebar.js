import React, { useState } from "react";
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
  onAgentToggle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>Controls</h2>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '◀' : '▶'}
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Date Range & Build</h3>
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
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
