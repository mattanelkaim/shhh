import "./SearchBar.css"
import React, {useState} from 'react'
import { FaSearch } from "react-icons/fa";

function filterData(data, query) {
  // Handle edge case
  if (query === "")
    return data

  // Return all elements that contain the query
  query = query.toLowerCase();
  return data.filter(item => item.description.toLowerCase().includes(query));
}

export const SearchBar = ({data, setResults}) => {
  const [input, setInput] = useState("");

  const handleChange = (value) => {
    setInput(value);
    setResults(filterData(data, value));
  }

  return (
    <div className='search-bar-container'>
      <FaSearch id="search-icon"/>
      <input
        type='text'
        placeholder="Search descriptions..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}
