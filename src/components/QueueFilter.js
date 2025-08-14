import React from "react";

const QueueFilter = ({ availableQueues, selectedQueues, onQueueToggle }) => {
  if (!availableQueues || availableQueues.length === 0) {
    return null;
  }

  const handleToggle = (queue) => {
    onQueueToggle(queue);
  };

  const handleSelectAll = () => {
    onQueueToggle(null, 'all');
  };

  const handleSelectNone = () => {
    onQueueToggle(null, 'none');
  };

  const allSelected = selectedQueues.length === 0 || selectedQueues.length === availableQueues.length;
  const someSelected = selectedQueues.length > 0 && selectedQueues.length < availableQueues.length;

  return (
    <div className="card">
      <div className="queue-filter">
        <div className="queue-filter-header">
          <h3>Queue Filter</h3>
          <div className="queue-filter-actions">
            <button 
              className={`btn ghost ${allSelected ? 'active' : ''}`}
              onClick={handleSelectAll}
              title="Show all queues"
            >
              All
            </button>
            <button 
              className="btn ghost"
              onClick={handleSelectNone}
              title="Hide all queues"
            >
              None
            </button>
          </div>
        </div>
        <div className="queue-list">
          {availableQueues.map((queue) => {
            const isSelected = selectedQueues.length === 0 || selectedQueues.includes(queue);
            return (
              <label key={queue} className={`queue-item ${isSelected ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(queue)}
                />
                <span className="queue-name">{queue}</span>
              </label>
            );
          })}
        </div>
        {someSelected && (
          <div className="queue-filter-summary">
            Showing {selectedQueues.length} of {availableQueues.length} queues
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueFilter;
