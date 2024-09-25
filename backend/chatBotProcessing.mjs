import sqlite3 from 'sqlite3';

const VirusTotalAPIKey = '';
const wordsToOmit = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
    'of', 'to', 'into', 'on', 'at', 'by', 'with', 'from', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
    'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought']);

export default async function processQuery(query, db) {
    query = query.toLowerCase();

    // Omit common words from query
    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are deleted
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }

    if (query.startsWith('how many')) {
        query = query.replace(/^how many /g, ''); // Remove only first match
        return {'response': queryDB(query, db)};
    }
        

    if (query.match('check\\s+md5\\s+([a-fA-F0-9]{32})'))
        return {'response': await analyzeMD5Signature(md5Match[1])};
    
    return {'response': "I'm not sure I understand. Type <code>help</code> to see the supported commands."};
}

function queryDB(query, db) {
    if (query === attacks)
    return query.length;
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
