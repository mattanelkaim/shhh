/* VirusTotal */

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

    processQuery(query).then(answer => {
        res.send(answer);
    })
});

// Listen from incoming requests from frontend
app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});

/* chatBotProcessing */

const VirusTotalAPIKey = '';
const wordsToOmit = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
    'of', 'to', 'into', 'on', 'at', 'by', 'with', 'from', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
    'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought']);


async function processQuery(query) {
    query = query.toLowerCase();

    // Omit common words from query
    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are deleted
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }

    const md5Match = query.match('check\\s+md5\\s+([a-fA-F0-9]{32})');
    if (md5Match) {
        return {'response': await analyzeMD5Signature(md5Match[1])};
    } else {
        return {'response': "Invalid MD5 request syntax."};
    }
}

async function analyzeMD5Signature(hash) {
    try {
        const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
            method: 'get',
            headers: new Headers({
              'x-apikey': VirusTotalAPIKey
            })
        });
        
        // Handle edge cases
        if (response.status === 404)
            return "MD5 signature is unknown to VirusTotal."
        if (response.status !== 200)
            return "There seems to be an issue with the VirusTotal API."
        
        // Extract relevant data
        const data = await response.text();
        const stats = JSON.parse(data)['data']['attributes']['last_analysis_stats'];
    
        // possible stats: 'malicious', 'suspicious', 'undetected', 'harmless', 'timeout', 'confirmed-timeout', 'failure', 'type-unsupported'
        if (stats['malicious'] + stats['suspicious'] > 0) {
            return "This MD5 signature was <b>flagged as malicious</b> in VirusTotal's DB!";
        } else {
            return "This MD5 signature <b>does not</b> seem to be malicious, according to the VirusTotal's DB.";
        }
      } catch (error) {
            console.error("Error checking MD5: ", error);
            return "There seems to be an error on our end. Please try again later.";
      }
}
