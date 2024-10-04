import './Hint.css';
import React from 'react';
import { AiFillQuestionCircle } from 'react-icons/ai';

export const Hint = ({position}) => {
    return (
        <div className="hint-wrapper">
            <AiFillQuestionCircle id="icon"/>
            <span className={`tooltip ${position}`}>Click on rows to expand/collapse text</span>
        </div>
    );
}
