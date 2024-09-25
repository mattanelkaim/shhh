/* VirusTotal */

import express from 'express';
import sqlite3 from 'sqlite3';
import processQuery from './chatBotProcessing.mjs';
const app = express();
const port = 3001;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Open the database
const db = new sqlite3.Database('backend/attacks_data.db');

// Define an API endpoint to handle database operations
app.get('/api/data', (req, res) => {
    db.all('SELECT * FROM attacks', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching data from DB");
        } else {
            res.json(rows); // Send the data as json
        }
    });
});

// Define an API endpoint to handle database operations
app.get('/api/chatbot', (req, res) => {
    const {query} = req.query;

    if (!query) {
        res.json({'response': "Error: invalid api usage!"});
        return;
    }

    processQuery(query, db).then(answer => {
        res.send(answer);
    })
});

// Listen from incoming requests from frontend
app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});
