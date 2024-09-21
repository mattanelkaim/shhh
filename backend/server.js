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

// Define an API endpoint to handle database operations
app.get('/api/chatbot', (req, res) => {
    let {query} = req.query;

    if (!query) {
        res.json({'response': "Error: invalid api usage!"});
        return;
    }

    query = query.toLowerCase();

    const wordsToOmit = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
        'of', 'to', 'into', 'on', 'at', 'by', 'with', 'from', 'up', 'down', 'out', 'off', 'over',
        'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
        'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
        'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
        'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
        'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought'];

    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are replaced
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }

    console.log("Checking: '" + query + '\'')
    const md5Match = query.match('check\\s+md5\\s+([a-fA-F0-9]{32})');
    console.log(md5Match);
    if (md5Match) {
        res.json({'response': "Found match: " + md5Match[1]});
    } else {
        res.json({'response': "Invalid md5 request syntax"});
    }

});

// Listen from incoming requests from frontend
app.listen(port, () => {
    console.log('Server listening on port ' + port + '...');
});
