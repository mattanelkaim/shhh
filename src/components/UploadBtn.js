import "./UploadBtn.css"
import React, { useState } from 'react';
import axios from 'axios';
import { FaFileUpload } from "react-icons/fa";

const VirusTotalAPIKey = '';

export const UploadBtn = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false); // Used for styling
    const [error, setError] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (!file)
            return;

        setLoading(true);
        setError(null);

        try {
            // Create a formData object in order to send the file
            const formData = new FormData();
            formData.append('file', file);

            // Send the file to the sandbox
            const response = await axios.post(
                'https://www.virustotal.com/api/v3/files',
                formData, // Send the file
                {
                headers: {
                    'x-apikey': VirusTotalAPIKey,
                    'Content-Type': 'multipart/form-data',
                },
                }
            );

            const reportURL = response.data.permalink;

            // Get report results (in a JSON format)
            const analysisResponse = await axios.get(
                `https://www.virustotal.com/api/v3/files/${reportURL}`,
                {
                headers: {
                    'x-apikey': VirusTotalAPIKey,
                },
                }
            );
            setResults(analysisResponse.data);
        } catch (error) {
            console.error(error);
            if (error.status === 401) // Unauthorized
                setError('Internal server ERROR with API key.');
            else
                setError(error.message);
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
