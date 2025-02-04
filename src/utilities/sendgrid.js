// Sendgrid function APIs

import { APP_MODE } from '../config/app.js';

// Send verification email
export const sendVerificationEmail = async (email, code) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/sendVerificationEmail';
    if (APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/sendVerificationEmail';
    }
    
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: email, 
            code: code 
        })
    }).catch(err => {
        console.error('Error sending verification email', err);
        return false;
    });

    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }

}