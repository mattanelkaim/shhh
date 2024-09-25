import sqlite3 from 'sqlite3';

const VirusTotalAPIKey = '';

const wordsToOmit = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
    'of', 'to', 'into', 'on', 'at', 'by', 'with', 'from', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
    'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought']);

// Using &lt; (<) and &gt; (>) to escape dangerouslySetInnerHTML 
const commands = "Available commands:<ul>\
    <li><code>Check MD5 &lt;your signature&gt;</code></li>\
    <li><code>Analyze {platforms | phases}</code></li>\
    <li><code>How many attacks [with n {platforms | phases}]</code></li></ul>";

// Use constants instead of hardcoding
const DB_NAMES = {
    attacksTable: 'attacks',
    // Columns
    attackID: 'id',
    attackName: 'name',
    description: 'description',
    platforms: 'platforms',
    detection: 'detection',
    phases: 'phase_name',
};


export default async function processQuery(query, db) {
    query = query.toLowerCase();

    // Omit common words from query
    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are deleted
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }
    
    if (query === 'help')
        return {'response': commands};

    if (query.startsWith('how many ')) {
        query = query.replace(/^how many /g, ''); // Remove only first match
        return {'response': await getAttacksDataDB(query, db)};
    }
    if (query.startsWith('analyze ')) {
        query = query.replace(/^analyze /g, ''); // Remove only first match
        return {'response': await analyzeAttacksDB(query, db)};
    }
    if (query.match('check\\s+md5\\s+([a-fA-F0-9]{32})'))
        return {'response': await analyzeMD5Signature(md5Match[1])};
    
    return {'response': "I'm not sure I understand. Type <code>help</code> to see the supported commands."};
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

async function getAttacksDataDB(input, db) {
    let sql;

    if (input === 'attacks')
        sql = `SELECT COUNT(*) AS count FROM ${DB_NAMES['attacksTable']}`;
    else
        return 'Not supported';

    const data = await queryDB(sql, db);
    
    return `Found a total of ${data[0].count} attacks.`;
}

async function analyzeAttacksDB(input, db) {
    if (input !== 'platforms' && input !== 'phases')
        return 'Not supported';

    // Get data from DB
    const column = DB_NAMES[input];
    const sql = `SELECT ${column} FROM ${DB_NAMES['attacksTable']}`;
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
