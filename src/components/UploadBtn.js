import "./UploadBtn.css"
import React, { useState } from 'react';
import axios from 'axios';
import { FaFileUpload } from "react-icons/fa";

export const UploadBtn = () => {
    const [loading, setLoading] = useState(false); // Used for styling

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        
        if (!file)
            return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            console.log(formData);
        
            const response = await axios.post('http://localhost:3001/api/analyze', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data', // No longer needed in frontend
                },
              });
        
            // Handle response from the backend
            console.log(response.data);
        } catch (error) {
            // Handle errors
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload">
            {/* Looks like the icon is the input */}
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="file-input">
                <FaFileUpload
                  id="upload-btn"
                  title={`${(loading ? 'Wait for analyze to complete...' : 'Analyze file in sandbox')}`}
                  className={`${(loading ? 'disabled-input' : '')}`}/>
            </label>
        </div>
    );
};
