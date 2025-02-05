export const firecrawl = async (scrapeUrl) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/firecrawlExtract';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/firecrawlExtract';
    }
    
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            url: scrapeUrl 
        })
    }).catch(err => {
        console.error('Error extracting data', err);
        return false;
    });

    if (res.status !== 200) {
        return false;
    } else {
        const data = await res.json();
        // console.log('Firecrawl response', data);
        return data;
    }

};


