import "./ChatBot.css"
import { useState } from 'react';
import { RiRobot2Line } from "react-icons/ri";
import { FaArrowLeft } from "react-icons/fa6";

export const ChatBot = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    const handleClick = () => {
        setIsMaximized(!isMaximized);
    };

    return (
      <div className={`bot-container ${isMaximized ? 'maximized' : ''}`} onClick={handleClick}>
        <RiRobot2Line id="robot-icon" display={isMaximized ? 'none' : 'none'}/>
        <div className={`chat-container ${isMaximized ? 'visible' : 'invisible'}`}>
          <FaArrowLeft/>
          <h1>Speaking to Ninja 🥷</h1>
        </div>
      </div>
  )
}
