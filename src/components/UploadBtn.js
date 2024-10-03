import './UploadBtn.css'
import React, { useState } from 'react';
import axios from 'axios';
import { FaFileUpload } from 'react-icons/fa';

export const UploadBtn = ({messagesAppend}) => {
    const [loading, setLoading] = useState(false); // Used for styling

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        
        if (!file)
            return;
        
        setLoading(true);
        messagesAppend('user', `Analyzing '${file.name}' (might take a moment)...`);

        try {
            const formData = new FormData();
            formData.append('file', file);
        
            const response = await axios.post('http://localhost:3001/api/analyze', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data', // No longer needed in frontend
                },
            });
        
            // Handle response from the backend
            console.log(response)
            messagesAppend('bot', response.data.response);
        } catch (error) {
            // Handle errors
            console.error(error);
            messagesAppend('bot', 'Error with server communication... Tough luck.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="file-input"> {/* Looks like the icon is the input */}
                <FaFileUpload
                  id="upload-btn"
                  title={`${(loading ? 'Wait for analyze to complete...' : 'Analyze file in sandbox')}`}
                  className={`${(loading ? 'disabled-input' : '')}`}/>
            </label>
        </div>
    );
};
