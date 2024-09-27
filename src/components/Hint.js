import './Hint.css';
import React from 'react';
import { AiFillQuestionCircle } from "react-icons/ai";

export const Hint = () => {
    return (
        <div className='hint-wrapper'>
            <AiFillQuestionCircle id='icon'/>
            <span class="tooltip">Click on rows to expand/collapse text</span>
        </div>
    );
}
