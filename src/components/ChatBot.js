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
  const initialMsg = "Hi there, I'm NinjaBot👋<br/>You can ask me questions about the displayed data, or even validate MD5 signatures.\
                      Type <code>help</code> to learn more.<br/>I'll do my best to help you!";
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([['bot', initialMsg]]); // List of [{bot/user}, {message}]

  const handleInputChange = (input) => {
    setMessageInput(input);

    const sendBtn = document.querySelector('#send-btn');
    if (input) {
      sendBtn.style.background = '#0F1313';
      sendBtn.style.cursor = 'pointer';
    } else {
      sendBtn.style.background = 'none';
      sendBtn.style.cursor = 'auto';
    }
  };

  const handleMsgInput = () => {
    if (!messageInput) return; // Skip if empty

    // Store user message
    const newUserMessage = ['user', messageInput];
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    getBotResponse(messageInput)
    .then(response => {
      const newBotMessage = ['bot', response['response'] ];
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    });
    
    // Clear user input
    setMessageInput('');
    handleInputChange(''); // To reset send button

    // Scroll to bottom after a slight delay, to allow for messages to re-render first
    const chat = document.querySelector('.chat');
    setTimeout(() => {
      chat.scrollTop = chat.scrollHeight;
    }, 20); // 20ms
  };

  // const addToInput = () => {
  //   const input = document.querySelector('.input-container input');
  //   console.log('click: ' + messageInput);
  //   //setMessageInput(input.value + 'hi');
  //   const newMessageInput = messageInput.length + 'hi';
  //   setMessageInput(newMessageInput);
  // };

  // /* Code blocks click */
  // const codeBlocksRef = document.querySelector('.chat');
  // useEffect(() => {
  //   // Skip if null or if not a bot message
  //   if (!codeBlocksRef?.lastChild?.classList.contains('bot-message'))
  //     return;

  //   const codeBlocks = Array.from(codeBlocksRef.lastChild.querySelectorAll('code'));
  //   codeBlocks.forEach((codeBlock) => {
  //     codeBlock.addEventListener('click', addToInput);
  //   });
  // }, [messages.length]); // Each time a message is added

  return (
    <div className={`bot-container ${isMaximized ? 'maximized' : ''}`} onClick={handleMaximizeClick}>
      <RiRobot2Line id="robot-icon" display={isMaximized ? 'none' : 'block'}/>
      <div className='chat-container'>
        <FaArrowLeft id="arrow-icon" onClick={() => setIsMaximized(false)}/>
        <h1>Chat with NinjaBot 🥷</h1>
        <div className="chat">
          {messages.map((message, index) => (
            /* Determine message type based on first element (user/bot).
               Also content wrapped in <p> to solve a bug where double clicking
               on last word will select first word of next message as well */
            <div key={index} className={`message ${(message[0] === "user" ? 'user-message' : 'bot-message')}`}>
              {message[0] === 'bot' ? (
                // Allows text formatting only for bot for security reasons
                <p dangerouslySetInnerHTML={{__html: message[1]}}></p>
              ) : (
                <p>{message[1]}</p>
              )}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter') handleMsgInput()}}
          />
          <div className="send">
            <BsFillSendFill id="send-btn" onClick={handleMsgInput}/>
          </div>
        </div>
      </div>
    </div>
  );
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

async function getBotResponse(userQuery) {
  try {
    const response = await fetch('http://localhost:3001/api/chatbot?query=' + userQuery);
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(error);
    return "Sorry, an error has occurred.<br/>Check console for more details."
  }
}
