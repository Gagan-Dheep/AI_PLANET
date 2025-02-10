import React, { useState, useEffect, useRef } from "react";
import ChatBody from "../components/ChatBody";
import ChatInput from "../components/ChatInput";
import UploadedFilesWidget from "../components/UploadedFilesWidget";

const Chat = () => {
const [chatMessages, setChatMessages] = useState([]);
const [userInput, setUserInput] = useState("");
const [isChatbotTyping, setIsChatbotTyping] = useState(false);
const [typingIntervalId, setTypingIntervalId] = useState(null);
const [typingIndicatorMessage, setTypingIndicatorMessage] =
  useState("Typing");
const [sessionId, setSessionId] = useState(null);
const [uploadedFiles, setUploadedFiles] = useState([]);
const firstRender = useRef(true);

const displayUserMessage = (message) => {
  setChatMessages((prevChatMessages) => [
    ...prevChatMessages,
    { message, type: "user" },
  ]);
  setUserInput("");
};

const displayChatbotMessage = (message) => {
  if (isChatbotTyping) {
    clearInterval(typingIntervalId);
    setIsChatbotTyping(false);
  }

  setChatMessages((prevChatMessages) => [
    ...prevChatMessages,
    { message, type: "chatbot" },
  ]);
};

const displayTypingIndicator = () => {
  if (!isChatbotTyping) {
    setIsChatbotTyping(true);
    clearInterval(typingIntervalId);

    const intervalId = setInterval(() => {
      setTypingIndicatorMessage((prevMessage) => {
        if (prevMessage === "Typing...") {
          return "Typing";
        } else if (prevMessage === "Typing") {
          return "Typing.";
        } else if (prevMessage === "Typing.") {
          return "Typing..";
        } else if (prevMessage === "Typing..") {
          return "Typing...";
        }
        return "Typing...";
      });
    }, 400);
    setTypingIntervalId(intervalId);
  }
};

const sendMessage = async () => {
  if (userInput.trim() === "") {
    return;
  }
  console.log(sessionId);
  

  if (!sessionId) {
    displayChatbotMessage("Please upload your PDF files first.");
    return;
  }

  displayUserMessage(userInput);
  displayTypingIndicator();

  try {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("question", userInput);

    const response = await fetch("https://intellichatpdf.onrender.com/ask/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to get response from server"
      );
    }

    const data = await response.json();
    console.log("Assistant's response:", data);

    displayChatbotMessage(data.answer);
    setIsChatbotTyping(false);
  } catch (error) {
    console.error("Error:", error);
    displayChatbotMessage(
      `Sorry, an error has occurred... (${error.message})`
    );
    setIsChatbotTyping(false);
  }
};

const handleInputChange = (e) => {
  setUserInput(e.target.value);
};

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
};

useEffect(() => {
  const checkTaskStatus = async () => {
    try {
      console.log("Checking task status...");
      
      const response = await fetch('https://intellichatpdf.onrender.com/');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching task status:', error);
    }
  };
  checkTaskStatus()
  if (firstRender.current) {
    firstRender.current = false;
    displayChatbotMessage(
      `Hi, I'm a PDF Chat Bot. Upload your PDF files below.`
    );
  }
}, []);

return (
  <div className="chat-container">
    <UploadedFilesWidget uploadedFiles={uploadedFiles} />
    <div className="chat-title">Chatbot</div>
    <ChatBody
      chatMessages={chatMessages}
      isChatbotTyping={isChatbotTyping}
      typingIndicatorMessage={typingIndicatorMessage}
    />
    <ChatInput
      value={userInput}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder="Type your question here..."
      onClick={sendMessage}
      setSessionId={setSessionId}
      setUploadedFiles={setUploadedFiles}
      uploadedFiles={uploadedFiles}
      displayChatbotMessage={displayChatbotMessage}
    />
  </div>
);
};

export default Chat;
