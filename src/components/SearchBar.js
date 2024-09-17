import "./SearchBar.css"
import React from 'react'
import { FaSearch } from "react-icons/fa";

function filterData(data, query, setFiltered) {
  if (query === "")
    setFiltered(data);
  query = query.toLowerCase();
  setFiltered(data.filter(item => item.description.toLowerCase().includes(query)));
}

export const SearchBar = ({data, filter}) => {
  return (
    <div className='search-bar-container'>
      <FaSearch id="search-icon"/>
      <input type='text' placeholder={filterData(data, 'Task', filter[1])}></input>
    </div>
  )
}
