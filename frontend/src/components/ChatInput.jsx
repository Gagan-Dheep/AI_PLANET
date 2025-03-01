import React, { useRef, useState } from "react";
import { FaPaperclip } from "react-icons/fa";
import Spinner from "./Spinner"; 
import "../css/ChatInput.css";

const ChatInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  onClick,
  setSessionId,
  setUploadedFiles, 
  uploadedFiles,
  displayChatbotMessage
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);  

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setIsUploading(true);

    let hasDuplicate = false;
    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].type !== "application/pdf") {
        displayChatbotMessage("Please upload only PDF files.");
        setIsUploading(false);
        return;
      }
      
      const isDuplicate = uploadedFiles.some(file => file.name === files[i].name);
      if (isDuplicate) {
        displayChatbotMessage(`File "${files[i].name}" is already uploaded.`);
        hasDuplicate = true;
        continue;
      }

      newFiles.push(files[i]);
    }

    if (newFiles.length === 0) {
      setIsUploading(false);
      if (!hasDuplicate) {
        displayChatbotMessage("No new files to upload.");
      }
      return;
    }

    try {
      for (let file of newFiles) {
        const formData = new FormData();
        formData.append("file", file);  // Send one file per request

        const response = await fetch("https://your-railway-proxy-url.com/upload_pdf/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to upload PDF");
        }

        const data = await response.json();
        console.log("Upload successful:", data);

        if (data.session_id) {
          setSessionId(data.session_id); 
          setUploadedFiles((prevFiles) => [...prevFiles, file]);
        } else {
          displayChatbotMessage("No session ID returned from the server.");      
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      displayChatbotMessage(`Error uploading files: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chat-footer">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      <button id="send-button" onClick={onClick}>
        Send
      </button>

      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        multiple
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {isUploading && <Spinner />}

      <FaPaperclip
        className="upload-icon"
        onClick={() => fileInputRef.current.click()}
        title="Upload PDFs"
      />
    </div>
  );
};

export default ChatInput;
