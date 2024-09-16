const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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
            res.status(500).send('Error fetching data from DB');
        } else {
            res.json(rows); // Send the data as json
        }
    });
});

// Listen from incoming requests from frontend
app.listen(port, () => {
    console.log('Server listening on port ${port}');
});
