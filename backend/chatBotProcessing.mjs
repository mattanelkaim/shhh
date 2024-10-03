import axios from 'axios';
import FormData from 'form-data'; // To allow constructor with 3 arguments

const VirusTotalAPIKey = 'a6fd7bee54f3e55c8b89cf6fbf8d3e5fe5eb1d2076c1ac5169a79d246dfb67a3';

const wordsToOmit = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
    'of', 'to', 'into', 'on', 'at', 'by', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
    'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought'
]);

const commandFormats = {
    // Using &lt; (<) and &gt; (>) to escape dangerouslySetInnerHTML 
    checkMD5: 'Check MD5 &lt;your signature&gt;',
    analyze: 'Analyze {platforms | phases}',
    getAttacks: 'How many attacks [with &lt;int&gt; {platforms | phases}]',
}

// Join all commands in a nice list format
const commands = `Available commands:<ul>\
    ${Object.entries(commandFormats).map(([name, format]) => {
        return `<li><code>${format}</code></li>`;
    }).join('')}</ul>`;

// Use constants instead of hardcoding
const DB_NAMES = {
    table: 'attacks',
    // Columns
    attackID: 'id',
    attackName: 'name',
    description: 'description',
    platforms: 'platforms',
    detection: 'detection',
    phases: 'phase_name',
};


export async function processQuery(query, db) {
    query = query.toLowerCase().trim();

    // Omit common words from query
    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are deleted
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }
    
    if (query === 'help')
        return {response: commands};

    if (query.startsWith('how many attacks')) {
        query = query.replace(/^how many attacks/, '').trim(); // Remove only first match
        return {response: await getAttacksDataDB(query, db)};
    }
    if (query.startsWith('analyze ')) {
        query = query.replace(/^analyze /, ''); // Remove only first match
        return {response: await analyzeAttacksDB(query, db)};
    }
    if (query.match('^check\\s+md5\\s+([a-fA-F0-9]{32})$'))
        return {response: await analyzeMD5Signature(md5Match[1])};
    
    return {response: "I'm not sure I understand. Type <code>help</code> to see the supported commands."};
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
            return 'MD5 signature is unknown to VirusTotal.'
        if (response.status !== 200)
            return 'There seems to be an issue with the VirusTotal API.'
        
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
            console.error('Error checking MD5: ', error);
            return 'There seems to be an error on our end. Please try again later.';
      }
}

// Convenience function
async function queryDB(sqlQuery, db) {
    // Resolve the promise later with await
    return new Promise((resolve, reject) => {
        db.all(sqlQuery, (err, rows) => {
            if (err)
                reject('N/A');
            else
                resolve(rows);
        });
    });
}

// Use a function instead of hardcoding every time
function invalidUsage(properUsage) {
    return `Invalid usage. Format:<br/><code>${properUsage}</code>`
}

function isInt(str) {
    const parsedInt = parseInt(str);
    // If float, then second condition wont be met
    return !isNaN(parsedInt) && parsedInt.toString() === str;
}

async function getAttacksDataDB(input, db) {
    if (input === '') {
        const sql = `SELECT COUNT(*) AS count FROM ${DB_NAMES['table']}`;
        const data = await queryDB(sql, db);
        return `Found a total of ${data[0].count} attacks.`;
    }

    const args = input.split(' ');
    // Make sure it's in the format (with <int> {platform|phase}[s])
    if (args.length !== 3 || args[0] !== 'with' || !isInt(args[1]) || !args[2].match('^(platform|phase)s?$'))
        return invalidUsage(commandFormats['getAttacks']);

    const num = parseInt(args[1]);
    // Handle edge-case
    if (num < 0)
        return `How can there be a negative amount of ${args[2]}?`;
        
    // startsWith instead of direct comparison to take optional 's' into account
    const column = (args[2].startsWith('phase') ? DB_NAMES['phases'] : DB_NAMES['platforms']);

    // Could use trinary but it's unreadable. And IIFE isn't worth it here
    let condition;
    if (num === 0) {
        condition = `LENGTH(${column}) = 0`;
    }
    else {
        // Use (num-1) ',' delimiters to count in each row
        condition = `LENGTH(${column}) - LENGTH(REPLACE(${column}, ',', '')) = ${num - 1};`;
    }

    const sql = `SELECT COUNT(*) AS count FROM ${DB_NAMES['table']} WHERE ${condition}`;

    const data = await queryDB(sql, db);
    return `Found ${data[0].count} attacks with ${num} ${args[2]}.`;
}

async function analyzeAttacksDB(input, db) {
    if (input !== 'platforms' && input !== 'phases')
        return invalidUsage(commandFormats['analyze'])

    // Get data from DB
    const column = DB_NAMES[input];
    const sql = `SELECT ${column} FROM ${DB_NAMES['table']}`;
    const data = await queryDB(sql, db);

    // Analyze the data
    let frequencies = {};
    data.forEach((item) => {
        const platforms = item[column].split(', ');
        platforms.forEach((platform) => {
            // Increase OR start from 1 if doesn't exist yet
            frequencies[platform] = (frequencies[platform] || 0) + 1;
        });
    });

    // Sort the frequencies in a descending order
    const sorted = Object.entries(frequencies) // Break to an array of pairs
      .sort((a, b) => b[1] - a[1]) // b - a to sort descending
      .reduce((item, [name, count]) => ({ ...item, [name]: count }), {}); // Re-construct the dict

    // Join all data to 1 ul for a nice presentation
    const total = Object.values(sorted).reduce((sum, value) => sum + value, 0);
    const itemsArr = Object.entries(sorted).map(([name, count]) => {
        const percentage = (count * 100 / total).toFixed(2); // Show 2 decimal places
        return `<li><u>${name}</u>: <b>${count}</b> (${percentage}%)</li>`;
    });

    return `<ul>${itemsArr.join('')}</ul>`;
}



export async function analyzeFile(file) {
    try {
        // Conver the file (type=Express.Multer.File) to a formData format to send it
        const formData = new FormData();
        formData.append('file', Buffer.from(file.buffer) , file.originalname);

        // Send the file to the sandbox
        console.log('SENDING.......');
        
        const response = await axios.post(
            'https://www.virustotal.com/api/v3/files',
            formData, // Send the file
            {headers: {
                'x-apikey': VirusTotalAPIKey,
                'Content-Type': 'multipart/form-data',
            }}
        );

        const reportURL = response.data.data.links.self;

        // Get report results (in a JSON format)
        const analysisResponse = await axios.get(
            reportURL,
            {headers: {
                'x-apikey': VirusTotalAPIKey,
            }}
        );

        console.log('sent successfuly');
        
        // Determine wheter file is malicious or not and respond to client
        const stats = analysisResponse.data.data.attributes.stats;

        // possible stats: 'malicious', 'suspicious', 'undetected', 'harmless', 'timeout', 'confirmed-timeout', 'failure', 'type-unsupported'
        if (stats['malicious'] + stats['suspicious'] > 0) {
            return {response: 'VirusTotal has flagged this file as <b>malicious</b>!'};
        } else {
            return {response: 'This file <b>does not</b> seem to be malicious, according to VirusTotal.'};
        }
    } catch (error) {
        // Try to print a detailed error from Axios, if defined
        console.error('ERROR: ' + error.response ?? error);
        return {response: 'Error with VirusTotal!'};
    }
}
