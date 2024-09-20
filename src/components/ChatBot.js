import "./ChatBot.css"
import React, { useState, useEffect } from 'react';
import { RiRobot2Line } from "react-icons/ri";
import { FaArrowLeft } from "react-icons/fa6";
import { BsFillSendFill } from "react-icons/bs";

export const ChatBot = () => {
  const [isMaximized, setIsMaximized] = useState(true);

  // Call this function whenever isMaximized is changed
  useEffect(() => {
    handleVisibilityChange(isMaximized);
  }, [isMaximized]);

  const handleMaximizeClick = () => {
    if (!isMaximized)
      setIsMaximized(true);
  };

  /* Messages handling */
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]); // List of [{bot/user}, {message}]

  const handleUserMessageInput = (e) => {
    if (e.key !== 'Enter' || !messageInput) // Ignore empty
      return;

    // Store user message
    const newUserMessage = ['user', messageInput];
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const newBotMessage = ['bot', getBotResponse(messageInput)]
    setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    
    // Clear user input
    setMessageInput('');
  }

  return (
    <div className={`bot-container ${isMaximized ? 'maximized' : ''}`} onClick={handleMaximizeClick}>
      <RiRobot2Line id="robot-icon" display={isMaximized ? 'none' : 'block'}/>
      <div className='chat-container'>
        <FaArrowLeft id="arrow-icon" onClick={() => setIsMaximized(false)}/>
        <h1>Chat with NinjaBot 🥷</h1>
        <div className="chat">
          {messages.map((message, index) => (
            // Determine message type based on first element (user/bot)
            <div key={index} className={`message ${(message[0] == "user" ? 'user-message' : 'bot-message')}`}>
              {message[1]}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            placeholder="Type your message here..."
            value={messageInput}
            onKeyDown={handleUserMessageInput}
            onChange={(e) => setMessageInput(e.target.value)}/>
          <div className="send">
            <BsFillSendFill/>
          </div>
        </div>
      </div>
    </div>
  )
}

function handleVisibilityChange(isMaximized) {
  const chat = document.querySelector('.chat-container');
  const botContainer = document.querySelector('.bot-container');

  if (isMaximized) {
    // First display it although opacity is 0
    chat.style.display = 'flex';

    // Then start the transition to opacity 1 with a delay
    setTimeout(() => {
      chat.style.opacity = 1;
    }, 500); // 0.5s

    // Also change the pointer
    botContainer.style.cursor = 'auto';
  } else {
    // Hide chat immediately
    chat.style.display = 'none';
    chat.style.opacity = 0;

    // Then change the pointer
    botContainer.style.cursor = 'pointer';
  }
}

function getBotResponse(userInput) {
  return "I gotchu";
}
