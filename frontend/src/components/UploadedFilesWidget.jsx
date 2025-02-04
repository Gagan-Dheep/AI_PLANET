import React from "react";
import { FaFilePdf } from "react-icons/fa";
import "../css/UploadedFilesWidget.css"; 

const UploadedFilesWidget = ({ uploadedFiles }) => {
  console.log(uploadedFiles);
  
  if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) return null; 

  return (
    <div className="uploaded-files-widget">
      <h4>Uploaded PDFs</h4>
      <ul>
        {uploadedFiles.map((file, index) => (
          <li key={index}>
            <FaFilePdf className="file-icon" /> {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadedFilesWidget;
