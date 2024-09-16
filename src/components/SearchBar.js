import "./SearchBar.css"
import React from 'react'
import { FaSearch } from "react-icons/fa";

export const SearchBar = () => {
    return (
        <div className='search-bar-container'>
          <FaSearch id="search-icon"/>
          <input type='text' placeholder="Search in descriptions..."></input>
        </div>
    )
}
