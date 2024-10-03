import express from 'express';
import sqlite3 from 'sqlite3';
import processQuery from './chatBotProcessing.mjs';
const app = express();
const PORT = 3001;

const CODES = {
    'OK': 200,
    'BAD_REQUEST': 400,
    'SERVER_ERROR': 500,
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Open the database
const db = new sqlite3.Database('backend/attacks_data.db', sqlite3.OPEN_READONLY);

// API endpoint to handle database operations
app.get('/api/data', (req, res) => {
    db.all('SELECT * FROM attacks', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(CODES.SERVER_ERROR).send('Error fetching data from DB');
        } else {
            res.json(rows); // Send the data as json
        }
    });
});

// API endpoint to handle database operations
app.get('/api/chatbot', (req, res) => {
    const {query} = req.query; // {} is crucial

    if (!query) {
        res.json({'response': 'Error: invalid api usage!'});
        return;
    }    

    processQuery(query, db).then(response => {
        res.send(response);
    });
});

// API endpoint to handle file analyzing WITHOUT SAVING THE FILE LOCALLY
app.post('/api/analyze', (req, res) => {
    const file = req.file;
    console.log('file=' + file);
  
    if (!file) {
      console.error('no upload');
      return res.status(400).json({'error': 'No file uploaded'});
    }
    
    // Forward the file to another API, don't implement yet

    res.json({ message: 'File forwarded successfully' });
});

// Listen from incoming requests from frontend
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

/*
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

            const reportURL = response.data.data.links.self;

            // Get report results (in a JSON format)
            const analysisResponse = await axios.get(
                reportURL,
                {
                headers: {
                    'x-apikey': VirusTotalAPIKey,
                },
                }
            );
            setResults(analysisResponse.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
*/