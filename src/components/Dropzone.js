import React, { useCallback, useState } from "react";

const Dropzone = ({ onFilesDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    onFilesDrop(files);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    onFilesDrop(files);
    e.target.value = "";
  };

  return (
    <div
      className={`dropzone ${isDragging ? "drag" : ""}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span>⬆️ Drag & drop CSVs here (or click)</span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Dropzone;
