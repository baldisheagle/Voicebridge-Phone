// VAPI Utilities
import { VAPI_PHONE_RECEPTIONIST_TEMPLATE } from '../config/templates.js';

// Create Vapi assistant
export const createVapiAssistant = async (assistant) => {

    // Replace variables in assistant
    let _assistant = replaceVariablesInTemplate(assistant);

    // console.log('Call function to create new assistant', _assistant);

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiCreateAssistant';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiCreateAssistant';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assistant: _assistant
        })
    });

    if (res.status !== 200) {
        return false;
    } else {
        let data = await res.json();
        return data.id;
    }

}

// Update Vapi assistant
export const updateVapiAssistant = async (assistant) => {

    // TODO: Choose template based on assistant.templateId

    // Replace variables in assistant
    let _assistant = replaceVariablesInTemplate(assistant);

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiUpdateAssistant';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiUpdateAssistant';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assistant_id: assistant.vapiAssistantId,
            assistant: _assistant
        })
    });

    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }

}

// Delete Vapi assistant
export const deleteVapiAssistant = async (assistantId) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiDeleteAssistant';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiDeleteAssistant';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assistant_id: assistantId
        })
    });

    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }

}

// Buy Vapi number
export const buyVapiNumber = async (nickname, areaCode) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiBuyNumber';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiBuyNumber';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname: nickname, areaCode: areaCode })
    });

    let resJson = await res.json();

    if (res.status !== 200) {
        // console.log('Error buying number', resJson);
        return false;
    } else {
        return resJson;
    }   

}

// Delete Vapi number
export const deleteVapiNumber = async (numberId) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiDeleteNumber';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiDeleteNumber';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numberId: numberId })
    });

    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }

}

// Link phone number to Vapi assistant
export const linkPhoneNumberToAssistant = async (assistantId, phoneNumberId) => {

    let url = 'http://127.0.0.1:5001/voicebridge-app/us-central1/vapiLinkPhoneNumberToAssistant';
    if (process.env.REACT_APP_APP_MODE === 'production') {
        url = 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiLinkPhoneNumberToAssistant';
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assistantId: assistantId, phoneNumberId: phoneNumberId })
    });

    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }
    
}

// Replace variables in template
const replaceVariablesInTemplate = (assistant) => {

    let template = JSON.parse(JSON.stringify(VAPI_PHONE_RECEPTIONIST_TEMPLATE));

    // Agent name
    template.name = assistant.id;

    // Model
    template.model.model = assistant.model;

    // System prompt
    let newBusinessInfo = createBusinessInfo(assistant.businessInfo);
    let newFAQ = createFAQ(assistant.faq);
    template.model.messages[0].content = template.model.messages[0].content.replaceAll('[[AGENT_NAME]]', assistant.agentName)
    template.model.messages[0].content = template.model.messages[0].content.replaceAll('[[BUSINESS_NAME]]', assistant.businessInfo.name)
    template.model.messages[0].content = template.model.messages[0].content.replaceAll('[[BUSINESS_INFO]]', newBusinessInfo)
    template.model.messages[0].content = template.model.messages[0].content.replaceAll('[[FAQ]]', newFAQ);
    template.model.messages[0].content = template.model.messages[0].content.replaceAll('[[EVENT_TERM]]', assistant.eventTerm);

    // First message
    template.firstMessage = template.firstMessage.replaceAll('[[AGENT_NAME]]', assistant.agentName).replaceAll('[[BUSINESS_NAME]]', assistant.businessInfo.name);
    template.firstMessage = template.firstMessage.replaceAll('[[EVENT_TERM]]', assistant.eventTerm);
    
    // Ambient sound
    template.backgroundSound = template.backgroundSound.replaceAll('[[AMBIENT_SOUND]]', assistant.ambientSound);

    // Language
    template.transcriber.language = assistant.language;

    // Voice
    template.voice.voiceId = assistant.voiceId;

    // console.log('New template', template.model.messages[0].content);
    
    return template;

}

// Create Business Info from businessInfo object
export const createBusinessInfo = (businessInfo) => {

    let knowledge = '';
    if (businessInfo.name && businessInfo.name !== '') {
        knowledge += `Business Name: ${businessInfo.name}\n`;
    }
    if (businessInfo.location && businessInfo.location !== '') {
        knowledge += `Business Location: ${businessInfo.location}\n`;
    }
    if (businessInfo.phoneNumber && businessInfo.phoneNumber !== '') {
        knowledge += `Business Phone Number: ${businessInfo.phoneNumber}\n`;
    }
    if (businessInfo.email && businessInfo.email !== '') {
        knowledge += `Business Email: ${businessInfo.email}\n`;
    }
    if (businessInfo.businessHours && businessInfo.businessHours !== '') {
        const hours = businessInfo.businessHours;
        let hoursText = 'Business Hours:\n';
        Object.values(hours).forEach(day => {
            if (day.isOpen) {
                // Convert 24h times to 12h format
                const openTime = new Date(`2000-01-01T${day.open}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                const closeTime = new Date(`2000-01-01T${day.close}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                hoursText += `Open on ${day.label}s between ${openTime} and ${closeTime}\n`;
            } else {
                hoursText += `Closed on ${day.label}s\n`;
            }
        });
        knowledge += hoursText;
    }
    if (businessInfo.description && businessInfo.description !== '') {
        knowledge += `About the business: ${businessInfo.description}\n`;
    }
    if (businessInfo.website && businessInfo.website !== '') {
        knowledge += `Business Website: ${businessInfo.website}\n`;
    }
    if (businessInfo.services && businessInfo.services !== '') {
        knowledge += `Services offered: ${businessInfo.services}\n`;
    }
    if (businessInfo.email && businessInfo.email !== '') {
        knowledge += `Business Email: ${businessInfo.email}\n`;
    }
    if (businessInfo.insuranceAccepted && businessInfo.insuranceAccepted !== '') {
        knowledge += `Insurance accepted: ${businessInfo.insuranceAccepted}\n`;
    }
    if (knowledge === '') {
        return "";
    } else {
        return knowledge;
    }
}

// Create FAQ from faq object
export const createFAQ = (faq) => {

    let knowledge = '';

    if (faq && faq.length > 0) {
        knowledge += `Frequently-asked questions:\n`;
        faq.forEach(question => {
            knowledge += `Question: ${question.question}\n`;
            knowledge += `Answer: ${question.answer}\n`;
        });
    } else {
        knowledge = " ";
    }

    return knowledge;
}

