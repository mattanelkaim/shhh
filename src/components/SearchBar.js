import './SearchBar.css'
import { FaSearch } from 'react-icons/fa';

function filterData(data, query) {
  // Handle edge case (display all when empty)
  if (!query)
    return data

  // Return all elements that contain the query (case insensitive)
  return data.filter(item => item.description.toLowerCase().includes(query.toLowerCase()));
}

export const SearchBar = ({data, setResults}) => {
  return (
    <div className="search-bar-container">
      <FaSearch id="search-icon"/>
      <input
        type="text"
        placeholder="Search descriptions..."
        // Refresh results on each input change, using a filter function
        onChange={(e) => setResults(filterData(data, e.target.value))}
      />
    </div>
  )
}
