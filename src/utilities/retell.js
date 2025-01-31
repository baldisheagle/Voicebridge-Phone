// Retell API

export const createRetellAgent = async (agent) => {
    console.log('Creating Retell Agent');
    let res = await fetch('http://127.0.0.1:5001/voicebridge-app/us-central1/createRetellAgent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            template: agent.template,
            agentId: agent.id,
            agentName: agent.agentName,
            businessInfo: agent.businessInfo,
            model: agent.model,
            voiceId: agent.voiceId,
            language: agent.language,
            includeDisclaimer: agent.includeDisclaimer
        })
    });
    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }
}

export const deleteRetellAgent = async (retellLlmId, retellAgentId) => {

    // TODO: Call function to delete agent on Retell
    let res = await fetch('http://127.0.0.1:5001/voicebridge-app/us-central1/deleteRetellAgent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            retellLlmId: retellLlmId, 
            retellAgentId: retellAgentId 
        })
    });
    if (res.status !== 200) {
        return false;
    } else {
        return true;
    }
}