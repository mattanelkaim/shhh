import React, { useState } from 'react';
import axios from 'axios';

const VirusTotalAPIKey = '';

export const VirusTotalAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    // Upload file & get results
    const handleSubmit = async (event) => {
        event.preventDefault();

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
        <div>
        <h1>VirusTotal Analyzer</h1>
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} />
            <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
            </button>
        </form>
        {error && <p>Error: {error}</p>}
        {results && (
            <pre>
            {JSON.stringify(results, null, 2)}
            </pre>
        )}
        </div>
    );
};
