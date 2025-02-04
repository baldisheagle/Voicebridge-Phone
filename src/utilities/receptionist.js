// Utilities for Receptionist

import { TIMEZONE_OFFSETS } from "../config/lists";
import { RETELL_TEMPLATE_PHONE_RECEPTIONIST_AGENT, RETELL_TEMPLATE_PHONE_RECEPTIONIST_LLM } from "../config/retelltemplates.js";
import { createRetellLlmAndAgentForReceptionist, updateRetellAgentForReceptionist, updateRetellLlmForReceptionist } from "./retell.js";

// Create Retell LLM and Agent for Receptionist
export const createReceptionist = async (_agent) => {

    // console.log('Creating receptionist', _agent);

    // Create Retell LLM
    let llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_LLM));

    // Replace variables in model
    llm.model = _agent.model;

    // Replace variables in begin_message
    llm.begin_message = llm.begin_message.replaceAll('[[AGENT_NAME]]', _agent.agentName);
    llm.begin_message = llm.begin_message.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
    llm.begin_message = llm.begin_message.replaceAll('[[INCLUDE_DISCLAIMER]]', _agent.includeDisclaimer ? 'If this is an emergency, please hang up and dial Nine-One-One.' : '');

    // Replace variables in general_prompt
    llm.general_prompt = llm.general_prompt.replaceAll('[[AGENT_NAME]]', _agent.agentName);
    llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
    llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_INFO]]', createBusinessInfo(_agent.businessInfo));
    llm.general_prompt = llm.general_prompt.replaceAll('[[FAQ]]', createFAQ(_agent.faq));

    // Replace variables in general_tools
    llm.general_tools = llm.general_tools.map(tool => {
        if (tool.cal_api_key) {
            tool.cal_api_key = tool.cal_api_key.replaceAll('[[CAL_API_KEY]]', _agent.calCom.apiKey);
        }
        if (tool.event_type_id) {
            tool.event_type_id = parseInt(tool.event_type_id.replaceAll('[[CAL_EVENT_TYPE_ID]]', _agent.calCom.eventId));
        }
        if (tool.description) {
            tool.description = tool.description.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
        }
        if (tool.timezone) {
            tool.timezone = tool.timezone.replaceAll('[[TIMEZONE]]', TIMEZONE_OFFSETS.find(offset => offset.value === _agent.businessInfo.timezone).timezone);
        }
        return tool;
    });

    // Create Retell Agent

    let agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_AGENT));

    // Update agent's dynamic properties
    agent.agent_name = _agent.retellAgentCode;
    agent.voice_id = _agent.voiceId;
    agent.language = _agent.language;
    agent.response_engine.llm_id = llm.llm_id;

    // Call createRetellLlmForReceptionist function
    let res = await createRetellLlmAndAgentForReceptionist(_agent.id, _agent.workspaceId, llm, agent);

    if (res) {
        return true;
    } else {
        return false;
    }

}

// Update Retell LLM
export const updateReceptionistLlm = async (_agent) => {

    // Update Retell LLM
    let llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_LLM));

    // Replace variables in model
    llm.model = _agent.model;

    // Replace variables in begin_message
    llm.begin_message = llm.begin_message.replaceAll('[[AGENT_NAME]]', _agent.agentName);
    llm.begin_message = llm.begin_message.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
    llm.begin_message = llm.begin_message.replaceAll('[[INCLUDE_DISCLAIMER]]', _agent.includeDisclaimer ? 'If this is an emergency, please hang up and dial Nine-One-One.' : '');

    // Replace variables in general_prompt
    llm.general_prompt = llm.general_prompt.replaceAll('[[AGENT_NAME]]', _agent.agentName);
    llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
    llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_INFO]]', createBusinessInfo(_agent.businessInfo));
    llm.general_prompt = llm.general_prompt.replaceAll('[[FAQ]]', createFAQ(_agent.faq));

    // Replace variables in general_tools
    llm.general_tools = llm.general_tools.map(tool => {
        if (tool.cal_api_key) {
            tool.cal_api_key = tool.cal_api_key.replaceAll('[[CAL_API_KEY]]', _agent.calCom.apiKey);
        }
        if (tool.event_type_id) {
            tool.event_type_id = parseInt(tool.event_type_id.replaceAll('[[CAL_EVENT_TYPE_ID]]', _agent.calCom.eventId));
        }
        if (tool.description) {
            tool.description = tool.description.replaceAll('[[BUSINESS_NAME]]', _agent.businessInfo.name);
        }
        if (tool.timezone) {
            tool.timezone = tool.timezone.replaceAll('[[TIMEZONE]]', TIMEZONE_OFFSETS.find(offset => offset.value === _agent.businessInfo.timezone).timezone);
        }
        return tool;
    });

    // Call updateRetellLlm function
    let res = await updateRetellLlmForReceptionist(_agent.retellLlmId, llm);

    return llm;

}

// Update Retell Agent
export const updateReceptionistAgent = async (agent) => {

    let _agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_AGENT));

    // Update agent's dynamic properties
    _agent.agent_name = agent.retellAgentCode;
    _agent.voice_id = agent.voiceId;
    _agent.language = agent.language;
    _agent.response_engine.llm_id = agent.retellLlmId;
    
    // console.log('Retell Agent', _agent);
    
    let res = await updateRetellAgentForReceptionist(agent.retellAgentId, _agent);

    return _agent;

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
        return null;
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
