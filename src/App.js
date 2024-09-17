import './App.css';
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify'; // Sanitize HTML tags
import { SearchBar } from './components/SearchBar';
import { ChatBot } from './components/ChatBot';

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
  
  return (
    <div className="App">
      <header className="App-header">
        <SearchBar data={data} setResults={setResults}/>
        <table className="attacks-data">
          <thead id="theadd">
            <tr>
              <th className="name">Name</th>
              <th className="desc">Description</th>
              <th className="detection">Detection</th>
              <th className="platforms">Platforms</th>
              <th className="phase">Phase</th>
              <th className="id">Unique ID</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => ( // Will replicate template for each element
              <tr key={item.id}>
                <td>{item.name}</td>
                <td dangerouslySetInnerHTML={{__html: sanitize(shorten(item.description))}}></td>
                <td dangerouslySetInnerHTML={{__html: sanitize(shorten(item.detection))}}></td>
                <td>{item.platforms}</td>
                <td>{item.phase_name}</td>
                <td>{item.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ChatBot/>
      </header>
    </div>
  );
}

function shorten(desc) {
  // Handle edge-case
  if (desc.length === 0)
    return 'N/A';

  // Set a maximum length for content
  desc = desc.slice(0, 200);

  // Make sure not to cut in the middle of a word
  const position = desc.lastIndexOf(' ');
  
  return desc.slice(0, position) + "...";
}

// Process the HTML tags in the recieved raw data
function sanitize(html) {
  return DOMPurify.sanitize(html, {ALLOWED_TAGS: ['br', 'code']});
}

export default App;
