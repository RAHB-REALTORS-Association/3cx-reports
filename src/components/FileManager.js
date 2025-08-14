import React from "react";
import { removeFile } from "../utils/dataStore";

const FileManager = ({ files, onFilesChange }) => {
  if (!files || files.length === 0) {
    return null;
  }

  const handleDeleteFile = (fileId, fileName) => {
    if (window.confirm(`Delete "${fileName}"? This will remove all data from this file.`)) {
      removeFile(fileId);
      onFilesChange();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (file) => {
    if (file.dateRange && file.dateRange.from !== file.dateRange.to) {
      return `${file.dateRange.from} to ${file.dateRange.to}`;
    }
    return file.date || 'No date';
  };

  const formatAddedAt = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="card">
      <div className="file-manager">
        <div className="file-manager-header">
          <h3>Uploaded Files ({files.length})</h3>
          <span className="file-manager-summary">
            {files.reduce((sum, f) => sum + f.rows.length, 0)} total records
          </span>
        </div>
        
        <div className="file-list">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-details">
                  <span className="file-date">📅 {formatDate(file)}</span>
                  <span className="file-size">📊 {file.rows.length} records</span>
                  <span className="file-size">💾 {formatFileSize(file.size)}</span>
                  <span className="file-added">🕒 {formatAddedAt(file.addedAt)}</span>
                </div>
              </div>
              
              <button
                className="btn btn-delete"
                onClick={() => handleDeleteFile(file.id, file.name)}
                title={`Delete ${file.name}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
