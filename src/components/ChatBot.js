import "./ChatBot.css"
import React, { useState, useEffect } from 'react';
import { RiRobot2Line } from "react-icons/ri";
import { FaArrowLeft } from "react-icons/fa6";
import { BsFillSendFill } from "react-icons/bs";

export const ChatBot = () => {
    const [isMaximized, setIsMaximized] = useState(true);

    // 2 seperate functions, because it shouldn't be minimized when clicking anywhere in the chat
    const handleMaximizeClick = () => {
        if (!isMaximized)
            setIsMaximized(true);
    };
    const handleMinimizeClick = () => {
        setIsMaximized(false);
    }

    // Handle visibility changes and trigger transitions
    useEffect(() => {
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
    }, [isMaximized]);

    return (
      <div className={`bot-container ${isMaximized ? 'maximized' : ''}`} onClick={handleMaximizeClick}>
        <RiRobot2Line id="robot-icon" display={isMaximized ? 'none' : 'block'}/>
        <div className={'chat-container'}>
          <FaArrowLeft id="arrow-icon" onClick={handleMinimizeClick}/>
          <h1>Chat with NinjaBot 🥷</h1>
          <div className="chat">hi</div>
          <div className="input-container">
            <input placeholder="Type your message here...">
            </input>
            <div className="send">
              <BsFillSendFill/>
            </div>
          </div>
        </div>
      </div>
  )
}
