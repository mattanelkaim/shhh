const VirusTotalAPIKey = 'YOUR_VIRUSTOTAL_API_KEY'; // Replace with your actual API key
const wordsToOmit = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet', 'in',
    'of', 'to', 'into', 'on', 'at', 'by', 'with', 'from', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'mine', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'be', 'am',
    'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'doing', 'done', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought']);


export function processQuery(query) {
    query = query.toLowerCase();

    for (const word of wordsToOmit) {
        // Wrapping with '\b' ensures only whole words are deleted
        query = query.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }

    const md5Match = query.match('check\\s+md5\\s+([a-fA-F0-9]{32})');
    if (md5Match) {
        isMD5SignatureMalicious(md5Match[1])
        .then(result => {
            return {'response': result};
        });
    } else {
        return {'response': "Invalid md5 request syntax"};
    }
}

async function isMD5SignatureMalicious(hash) {
    try {
        const response = await axios.get(`https://www.virustotal.com/api/v3/files/${md5}`, {
          headers: {
            'x-apikey': VirusTotalAPIKey
          }
        });
    
        const data = response.data;
    
        if (data.attributes.last_analysis_stats.malicious > 0) {
          console.log(`${md5} is known as malicious.`);
          return true;
        } else {
          console.log(`${md5} is not known as malicious.`);
          return false;
        }
      } catch (error) {
        console.error('Error checking MD5:', error);
      }
}
