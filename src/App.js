import './App.css';
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify'; // Sanitize HTML tags
import InfiniteScroll from 'react-infinite-scroll-component';
import { SearchBar } from './components/SearchBar.js';
import { ChatBot } from './components/ChatBot.js';
import { Hint } from './components/Hint.js';

function App() {
  const [data, setData] = useState([]);
  const [results, setResults] = useState([]);

  // Fetch should be async, run in the background
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch & save data from server endpoint once
        const response = await fetch('http://localhost:3001/api/data');
        const data = await response.json();
        setData(data);

        // Will be assigned ONLY in the first render & after data has been fetched
        setResults(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData(); // Then call the lambda
  }, []);

  // Handle thead stickiness
  const [isSticky, setIsSticky] = useState(false);
  const stickyThead = document.querySelector('.attacks-data thead');
  const [hintPos, setHintPos] = useState('above');

  const handleScroll = () => {
    if (stickyThead) {
      // Sticky thead stuff
      setIsSticky(stickyThead.offsetTop > 0);

      // Apply sticky class for th elements if needed
      const thElements = stickyThead.querySelectorAll('th');
      thElements.forEach(th => {
        th.classList.toggle('sticky-th', isSticky);
      });

      // Toggle hint position if needed
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        const y = tooltip.getBoundingClientRect().top;
        const height = tooltip.offsetHeight;
        console.log('y = ' + y);
        // console.log('height = ' + height);

        if (hintPos === 'above') {
          if (y <= 0) { // || Math.abs(y) < height
            setTimeout(() => {
              setHintPos('below');
            }, 70); // With a delay so it won't flicker
          }
        } else {
          if (!isSticky && Math.abs(y) >= height) {
            setTimeout(() => {
              setHintPos('above');
            }, 70); // With a delay so it won't flicker
          }
        }
      }
    }
  };
  window.addEventListener('scroll', handleScroll);

  // Handle expanding/collapsing rows
  const [expandedRows, setExpandedRows] = useState({});
  const handleRowClick = (id) => {
    // Append to expandedRows (or update value if exists)
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows, [id]: !prevExpandedRows[id] // Toggle expanded state for clicked row
    }));
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <SearchBar data={data} setResults={setResults}/>
        { /* Using InfiniteScroll for lazy loading */ }
        <InfiniteScroll className="scroll-container" dataLength={results.length}>
          <table className="attacks-data">
            <thead className={`${isSticky ? 'sticky-header' : ''}`}>
              <tr>
                <th className="name">Name</th>
                <th className="desc">Description<Hint position={hintPos}/></th>
                <th className="detection">Detection<Hint position={hintPos}/></th>
                <th className="platforms">Platforms</th>
                <th className="phase">Phase</th>
                <th className="id">Unique ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => ( // Will replicate template for each element
                <tr key={item.id} onClick={() => handleRowClick(item.id)}>
                  <td>{item.name}</td>
                  <td dangerouslySetInnerHTML={{__html: sanitize(
                    expandedRows[item.id] ? item.description : shorten(item.description)
                  )}}></td>
                  <td dangerouslySetInnerHTML={{__html: sanitize(
                    expandedRows[item.id] ? (item.detection || 'N/A') : shorten(item.detection) // Replaces with N/A if empty
                  )}}></td>
                  <td>{item.platforms}</td>
                  <td>{item.phase_name}</td>
                  <td>{item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
        <ChatBot/>
      </header>
    </div>
  );
}

function shorten(text) {
  // Handle edge-case
  if (text.length === 0)
    return 'N/A';

  // Set a maximum length for content
  text = text.slice(0, 200);

  // Make sure not to cut in the middle of a word
  const position = text.lastIndexOf(' ');
  return text.slice(0, position) + '...';
}

// Remove unwanted HTML tags to safely put in dangerouslySetInnerHTML
function sanitize(html) {
  return DOMPurify.sanitize(html, {ALLOWED_TAGS: ['br', 'code']});
}

export default App;
