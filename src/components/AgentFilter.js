import React from "react";

const AgentFilter = ({ availableAgents, selectedAgents, onAgentToggle }) => {
  if (!availableAgents || availableAgents.length === 0) {
    return null;
  }

  const handleToggle = (agent) => {
    onAgentToggle(agent);
  };

  const handleSelectAll = () => {
    onAgentToggle(null, 'all');
  };

  const handleSelectNone = () => {
    onAgentToggle(null, 'none');
  };

  const allSelected = selectedAgents.length === 0 || selectedAgents.length === availableAgents.length;
  const someSelected = selectedAgents.length > 0 && selectedAgents.length < availableAgents.length;

  return (
    <div className="card">
      <div className="agent-filter">
        <div className="filter-header">
          <h3>Agent Filter</h3>
          <div className="filter-actions">
            <button 
              className={`btn ghost ${allSelected ? 'active' : ''}`}
              onClick={handleSelectAll}
              title="Show all agents"
            >
              All
            </button>
            <button 
              className="btn ghost"
              onClick={handleSelectNone}
              title="Hide all agents"
            >
              None
            </button>
          </div>
        </div>
        <div className="filter-pills">
          {availableAgents.map((agent) => {
            const isSelected = selectedAgents.length === 0 || selectedAgents.includes(agent);
            return (
              <button
                key={agent}
                className={`pill filter-pill ${isSelected ? 'selected' : 'unselected'}`}
                onClick={() => handleToggle(agent)}
                title={`Toggle ${agent}`}
              >
                {agent}
              </button>
            );
          })}
        </div>
        {someSelected && (
          <div className="filter-summary">
            Showing {selectedAgents.length} of {availableAgents.length} agents
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentFilter;
