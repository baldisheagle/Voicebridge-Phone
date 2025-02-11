const { v4: uuidv4 } = require('uuid');
const { Retell } = require("retell-sdk");
const z = require('zod');
const chrono = require('chrono-node');

// Firebase
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
const db = getFirestore();

// Cors
const cors = require('cors');
const logger = require("firebase-functions/logger");

// Sendgrid
const sgMail = require('@sendgrid/mail');

// Mendable
const { default: FirecrawlApp } = require('@mendable/firecrawl-js');

// Vapi
const { VapiClient } = require("@vapi-ai/server-sdk");

// Dotenv
require('dotenv').config();

// Stripe
// const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);

// Sendgrid
const emailTemplates = {
  VerificationEmail: "d-09327200b499416890073f44427a544f",
};

// Allowed origins
const allowedOrigins = ['https://voicebridge-app.web.app', 'https://app.voicebridgeai.com']; // , 'http://localhost:3000'

// Timezones
const TIMEZONE_OFFSETS = [
  { value: -10, label: 'Honolulu, Hawaii (HST) -10:00', timezone: 'Pacific/Honolulu' },
  { value: -9, label: 'Anchorage, Alaska (AKST) -9:00', timezone: 'America/Anchorage' },
  { value: -8, label: 'Los Angeles, USA (PST) -8:00', timezone: 'America/Los_Angeles' },
  { value: -7, label: 'Denver, USA (MST) -7:00', timezone: 'America/Denver' },
  { value: -6, label: 'Chicago, USA (CST) -6:00', timezone: 'America/Chicago' },
  { value: -5, label: 'New York, USA (EST) -5:00', timezone: 'America/New_York' },
  { value: -4, label: 'Santiago, Chile (CLT) -4:00', timezone: 'America/Santiago' },
  { value: -3, label: 'São Paulo, Brazil (BRT) -3:00', timezone: 'America/Sao_Paulo' },
  { value: -2, label: 'Fernando de Noronha, Brazil (FNT) -2:00', timezone: 'America/Noronha' },
  { value: -1, label: 'Azores (AZOT) -1:00', timezone: 'Atlantic/Azores' },
  { value: 0, label: 'London, United Kingdom (GMT) 0:00', timezone: 'Europe/London' },
  { value: 1, label: 'Paris, France (CET) +1:00', timezone: 'Europe/Paris' },
  { value: 2, label: 'Cairo, Egypt (EET) +2:00', timezone: 'Africa/Cairo' },
  { value: 3, label: 'Moscow, Russia (MSK) +3:00', timezone: 'Europe/Moscow' },
  { value: 3.5, label: 'Tehran, Iran (IRST) +3:30', timezone: 'Asia/Tehran' },
  { value: 4, label: 'Dubai, UAE (GST) +4:00', timezone: 'Asia/Dubai' },
  { value: 5, label: 'Karachi, Pakistan (PKT) +5:00', timezone: 'Asia/Karachi' },
  { value: 5.5, label: 'Mumbai, India (IST) +5:30', timezone: 'Asia/Kolkata' },
  { value: 6, label: 'Dhaka, Bangladesh (BST) +6:00', timezone: 'Asia/Dhaka' },
  { value: 7, label: 'Bangkok, Thailand (ICT) +7:00', timezone: 'Asia/Bangkok' },
  { value: 8, label: 'Hong Kong (HKT) +8:00', timezone: 'Asia/Hong_Kong' },
  { value: 9, label: 'Tokyo, Japan (JST) +9:00', timezone: 'Asia/Tokyo' },
  { value: 10, label: 'Sydney, Australia (AEST) +10:00', timezone: 'Australia/Sydney' },
  { value: 11, label: 'Noumea, New Caledonia (NCT) +11:00', timezone: 'Pacific/Noumea' },
  { value: 12, label: 'Auckland, New Zealand (NZST) +12:00', timezone: 'Pacific/Auckland' },
];

// Cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,POST',
  credentials: true,
};

// Cors middleware
const corsMiddleware = cors(corsOptions);

/*
  Function: Verify authorization header
  Parameters:
    req
  Return:
    null
*/

async function verifyAuthorizationHeader(req) {

  // Verify authorization header exists and starts with 'Bearer '
  if (req && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {

    // Get token from authorization header
    const token = req.headers.authorization.split('Bearer ')[1]; 
    
    // Verify token exists
    if (!token) { 
      console.error('No token provided');
      return false;
    }

    // Verify token with Firebase Admin
    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }

  } else {
    console.error('No authorization header');
    return false;
  }

  return true;

}

/* 
  Function: Test valid authorization header
  Parameters:
    req
  Return:
    null
*/

exports.isAuthorized = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    let authorized = await verifyAuthorizationHeader(req);
    if (!authorized) {
      res.status(401).send(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // console.log('Authorization successful');
    res.status(200).send(JSON.stringify({ message: "Authorization successful" }));

  });

});


/*
  On new user creation: Send verification email
  Parameters:
    email
  Return:
    null
*/

exports.sendVerificationEmail = onRequest((req, res) => {
  
  corsMiddleware(req, res, async () => {

    // Verify authorization header
    // if (!verifyAuthorizationHeader(req)) {
    //   console.error('Authorization failed');
    //   res.status(401).send(JSON.stringify({ error: "Unauthorized" }));
    //   return;
    // }

    if (req.body && req.body.email && req.body.code) {

      let email = req.body.email;
      let code = req.body.code;

      sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

      sgMail.send({
        to: email,
        replyTo: "hello@voicebridgeai.com",
        from: "Voicebridge <hello@voicebridgeai.com>",
        templateId: emailTemplates["VerificationEmail"],
        dynamic_template_data: {
          code: code,
        }
      })

      res.status(200).send(JSON.stringify({ message: "Verification email sent" }));

    } else {
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
    }

  })
});

/*
  Function: Vapi - Check Cal.com availability
  Parameters:
    null
  Return:
    null
*/

exports.vapiCheckCalendarAvailabilityCalCom = onRequest({
  enforceAppCheck: false,
  cors: true,
  invoker: 'public'
}, async (req, res) => {

  console.log('Vapi - Check Cal.com availability');

  // Verify Vapi secret
  const secret = req.headers['x-vapi-secret'];
  
  if (!secret || secret !== process.env.REACT_APP_VAPI_SECRET) {
    console.error('Invalid or missing Vapi secret header');
    res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  const toolCallId = req.body.message.toolCalls[0].id;
  const assistantId = req.body.message.assistant && req.body.message.assistant.id ? req.body.message.assistant.id : null;
  const arguments = req.body.message?.toolCalls[0]?.function?.arguments || null;
  const timeRequested = arguments && arguments.date_time ? arguments.date_time : null;

  console.log('Assistant ID', assistantId);
  console.log('Arguments', arguments);
  console.log('Time requested', timeRequested);

  try {

    // Get assistant
    const assistants = await db.collection('agents').where('vapiAssistantId', '==', assistantId).limit(1).get();

    if (assistants.docs.length === 0) {
      console.error('Assistant not found');
      res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: "Sorry, the time is not available." }] }));
      return;
    }

    // If assistant is found, extract cal.com api key and event ID
    const assistant = assistants.docs[0].data();

    // Extract calComApiKey, calComEventId, and timezone from assistant
    const calComApiKey = assistant.calCom?.apiKey;
    const calComEventId = assistant.calCom?.eventId;
    const timezoneOffset = assistant.businessInfo?.timezone ? assistant.businessInfo.timezone : -8; // Default to PST if timezone is not set
    const timezone = assistant.businessInfo?.timezone ? TIMEZONE_OFFSETS.find(offset => offset.value === timezoneOffset).timezone : 'America/Los_Angeles';

    if (!calComApiKey || !calComEventId || !timezone) {
      console.error('Cal.com API key, event ID, or timezone not found');
      res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: "Sorry, the time is not available." }] }));
      return;
    }

    // Use Chrono to convert start time, along with timezone, into ISO string
    let dateInstant = new Date();
    const localTime = chrono.parseDate(timeRequested, dateInstant, {
      forwardDate: true
    });
    
    const startTime = new Date(localTime.getTime() + ((timezoneOffset * -1) * 60 * 60 * 1000));
    const endTime = new Date(new Date(startTime).getTime() + 24 * 60 * 60 * 1000);


    // Call Cal.com API to check availability
    const options = {
      method: 'GET',
      headers: { Authorization: `Bearer ${calComApiKey}` }
    };

    const calComResponse = await fetch(`https://api.cal.com/v2/slots/available?eventTypeId=${calComEventId}&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&timezone=${timezone}`, options);

    const calComData = await calComResponse.json();

    // Extract all slots from the nested structure
    let allSlots = [];
    if (calComData.data && calComData.data.slots) {
      allSlots = Object.values(calComData.data.slots)
        .flat()
        .map(slot => ({
            startTime: new Date(slot.time).toISOString(),
        }));
    }

    // Check if the requested time is available
    const isSlotAvailable = allSlots.some(slot => slot.startTime === startTime.toISOString());

    let availability = ""

    if (isSlotAvailable) {
      availability = "The requested time is available";
    } else if (allSlots.length === 0) {
      availability = "The requested time is not available. Choose a different day and time";
    } else {
      availability = "The requested time is not available, but here are the available slots:";
      allSlots.slice(0, 3).forEach(slot => {
        availability += new Date(slot.startTime).toLocaleString('en-US', { timeZone: timezone, weekday: 'long', hour: 'numeric', minute: '2-digit' }) + "\n";
      });
    }

    res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: availability }] }));
    return;

  } catch (error) {
    console.error('Error checking availability', error);
    res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: "Sorry, the time is not available." }] }));
    return;
  }

});

/*
  Function: Vapi - Book event on Cal.com
  Parameters:
    null
  Return:
    null
*/

exports.vapiBookEventOnCalCom = onRequest({
  enforceAppCheck: false,
  cors: true,
  invoker: 'public'
}, async (req, res) => {

  console.log('Vapi - Book event on Cal.com');

  // Verify Vapi secret
  const secret = req.headers['x-vapi-secret'];

  if (!secret || secret !== process.env.REACT_APP_VAPI_SECRET) {
    console.error('Invalid or missing Vapi secret header');
    res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  const toolCallId = req.body.message.toolCalls[0].id;
  const assistantId = req.body.message?.assistant?.id ? req.body.message.assistant.id : null;
  const arguments = req.body.message?.toolCalls[0]?.function?.arguments;
  const timeRequested = arguments && arguments.date_time ? arguments.date_time : null;
  const callerName = arguments && arguments.name_of_caller ? arguments.name_of_caller : 'Anonymous';
  const appointmentReason = arguments && arguments.appointment_reason ? arguments.appointment_reason : 'Unknown';

  console.log('Assistant ID', assistantId);
  console.log('Arguments', arguments);
  console.log('Time requested', timeRequested);
  console.log('Caller name', callerName);
  console.log('Appointment reason', appointmentReason);

  try {

    // Get assistant
    const assistants = await db.collection('agents').where('vapiAssistantId', '==', assistantId).limit(1).get();

    if (assistants.docs.length === 0) {
      console.error('Assistant not found');
      res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: "Sorry, the appointment could not be booked." }] }));
      return;
    }

    // If assistant is found, extract cal.com api key and event ID
    const assistant = assistants.docs[0].data();

    // Extract calComApiKey, calComEventId, and timezone from assistant
    const calComApiKey = assistant.calCom?.apiKey;
    const calComEventId = assistant.calCom?.eventId;
    const timezoneOffset = assistant.businessInfo?.timezone ? assistant.businessInfo.timezone : -8; // Default to PST if timezone is not set
    const timezone = assistant.businessInfo?.timezone ? TIMEZONE_OFFSETS.find(offset => offset.value === timezoneOffset).timezone : 'America/Los_Angeles';

    if (!calComApiKey || !calComEventId || !timezone) {
      console.error('Cal.com API key, event ID, or timezone not found');
      res.status(200).send(JSON.stringify({ results: [{ toolCallId: toolCallId, result: "Sorry, the appointment could not be booked." }] }));
      return;
    }

    // Use Chrono to convert start time, along with timezone, into ISO string
    let dateInstant = new Date();
    const localTime = chrono.parseDate(timeRequested, dateInstant, {
      forwardDate: true
    });
    const startTime = new Date(localTime.getTime() + ((timezoneOffset * -1) * 60 * 60 * 1000));

    // Book event on Cal.com
    const options = {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${calComApiKey}`,
          'cal-api-version': '2024-08-13',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "start": startTime.toISOString(),
          "eventTypeId": parseInt(calComEventId),
          "attendee": {
              name: callerName,
              email: "jane@example.com",
              timeZone: timezone,
              phoneNumber: "+1234567890",
              language: "en"
          },
      })
    };

    let calComResponse = await fetch('https://api.cal.com/v2/bookings', options);

    let calComResponseJson = await calComResponse.json();

    // If the appointment is booked successfully, send a success message
    if (calComResponseJson && calComResponseJson.status === 'success') {
      res.status(200).send(JSON.stringify({ "results": [{ "toolCallId": toolCallId, "result": "Appointment booked successfully." }] }));
    } else {
      res.status(200).send(JSON.stringify({ "results": [{ "toolCallId": toolCallId, "result": "Appointment could not be booked." }] }));
    }

  } catch (error) {
    console.error('Error booking appointment', error);
    res.status(200).send(JSON.stringify({ "results": [{ "toolCallId": toolCallId, "result": "Appointment could not be booked." }] }));
  }

});

/*
  Function: Vapi Webhook
  Parameters:
    null
  Return:
    null
*/

exports.vapiWebhook = onRequest({
  enforceAppCheck: false,
  cors: true,
  invoker: 'public'
}, (req, res) => {

  console.log('Vapi Webhook', req.headers, req.body);

  // TODO: Verify Vapi secret
  // Verify Vapi secret
  // const secret = req.headers['x-vapi-secret'];

  // if (!secret) { // || secret !== process.env.REACT_APP_VAPI_SECRET
  //   console.error('Invalid or missing Vapi secret header');
  //   res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
  //   return;
  // }

  let message = req.body.message;
  let assistant = req.body.assistant;

  switch (message.type) {
    case 'end-of-call-report':
      saveVapiCallToDatabase(message);
      break;
    default:
      console.log('Received an unknown message type:', message.type);
      break;
  }

  res.status(200).send(JSON.stringify({ message: "Vapi Webhook received" }));

});

/*
  Function: Save Vapi call to database
  Parameters:
    message
  Return:
    null
*/

  async function saveVapiCallToDatabase(message) {

  console.log('Saving Vapi call to database', message);

  const assistantId = message.call?.assistantId ? message.call.assistantId : null;

  if (!assistantId) {
    console.error('No assistant ID found for call', message);
    return;
  }

  const agents = await db.collection('agents').where('vapiAssistantId', '==', assistantId).limit(1).get();

  if (agents.docs.length === 0) {
    console.error('No agent found for call', assistantId);
    return;
  }

  const agent = agents.docs[0].data();
  const workspaceId = agent.workspaceId;
  const notifyEmail = agent.notifyEmail ? agent.notifyEmail : null;

  // Save call to database
  const callId = uuidv4();
  await db.collection('calls').doc(callId).set({
    id: callId,
    workspaceId: workspaceId,
    agentId: assistantId,
    callId: message.call?.id ? message.call.id : null,
    cost: message.cost ? message.cost : null,
    callSummary: message.analysis?.summary ? message.analysis.summary : null,
    userSentiment: message.analysis?.structuredData?.sentiment ? message.analysis.structuredData.sentiment : null,
    callerName: message.analysis?.structuredData?.name_of_caller ? message.analysis.structuredData.name_of_caller : null,
    callPurpose: message.analysis?.structuredData?.call_purpose ? message.analysis.structuredData.call_purpose : null,
    fromNumber: message.customer?.number ? message.customer.number : null,
    toNumber: message.phoneNumber?.number ? message.phoneNumber.number : null,
    direction: null,
    callStatus: null,
    startTimestamp: message.startedAt ? message.startedAt : null,
    endTimestamp: message.endedAt ? message.endedAt : null,
    durationMs: message.durationMs ? message.durationMs : null,
    transcript: message.transcript ? message.transcript : null,
    recordingUrl: message.recordingUrl ? message.recordingUrl : null,
    disconnectReason: message.endedReason ? message.endedReason : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('Call saved to database', callId);

  // TODO: Send email notification with call summary to notifyEmail if it exists
  // if (notifyEmail) {
  //   sendEmailNotification(notifyEmail, call);
  // }

  return;

}

/*
  Function: Vapi - Create Assistant
  Parameters:
    assistant
  Return:
    null
*/

exports.vapiCreateAssistant = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    console.log('Vapi - Create Assistant');

    if (req.body && req.body.assistant) {
      
      console.log('Assistant', req.body.assistant);

      try {

        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });

        // Create assistant
        const assistant = await client.assistants.create(req.body.assistant);

        if (assistant) {
          console.log('Assistant created');
          res.status(200).send(JSON.stringify({ id: assistant.id }));
        } else {
          console.error('Error creating assistant', assistant);
          res.status(500).send(JSON.stringify({ error: "Error creating assistant" }));
          return;
        }

      } catch (error) {
        console.error('Error creating assistant', error);
        res.status(500).send(JSON.stringify({ error: "Error creating assistant" }));
        return;
      }

    } else {
      console.error('Missing assistant');
      res.status(400).send(JSON.stringify({ error: "Missing assistant" }));
      return;
    }

  });

});

/*
  Function: Vapi - Update Assistant
  Parameters:
    assistant
  Return:
    null
*/

exports.vapiUpdateAssistant = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    console.log('Vapi - Update Assistant');

    if (req.body && req.body.assistant_id && req.body.assistant) {
      console.log('Assistant ID', req.body.assistant_id);

      try {

        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });

        // Update assistant
        const updatedAssistant = await client.assistants.update(req.body.assistant_id, req.body.assistant);

        if (updatedAssistant) {
          res.status(200).send(JSON.stringify({ message: "Assistant updated" }));
        } else {
          console.error('Error updating assistant', updatedAssistant);
          res.status(500).send(JSON.stringify({ error: "Error updating assistant" }));
          return;
        }

      } catch (error) {
        console.error('Error updating assistant', error);
        res.status(500).send(JSON.stringify({ error: "Error updating assistant" }));
        return;
      }

    } else {
      console.error('Missing assistant_id or assistant');
    }

  }); 

});

/*
  Function: Vapi - Delete Assistant
  Parameters:
    assistantId
  Return:
    null
*/

exports.vapiDeleteAssistant = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    console.log('Vapi - Delete Assistant');

    if (req.body && req.body.assistant_id) {
      console.log('Assistant ID', req.body.assistant_id);

      try {
        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });

        // Delete assistant
        await client.assistants.delete(req.body.assistant_id);

        res.status(200).send(JSON.stringify({ message: "Assistant deleted" }));

      } catch (error) {
        console.error('Error deleting assistant', error);
        res.status(500).send(JSON.stringify({ error: "Error deleting assistant" }));
        return;
        

      }
    } else {
      console.error('Missing assistant_id');
    }

  });

});

/*
  Function: Vapi - Buy Number
  Parameters:
    areaCode
  Return:
    null
*/

exports.vapiBuyNumber = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    if (req.body && req.body.nickname && req.body.areaCode) {

      try {

        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });

        // Buy number
        const number = await client.phoneNumbers.create({
          provider: 'vapi',
          name: req.body.nickname,
          numberDesiredAreaCode: req.body.areaCode,
        });

        if (number) {
          console.log('Number bought', number);
          res.status(200).send(JSON.stringify(number));
        } else {
          console.error('New number format error', number);
          res.status(500).send(JSON.stringify({ error: "New number format error" }));
          return;
        }
        
      } catch (error) {
        console.error('Error buying number', error);
        res.status(500).send(JSON.stringify({ error: "Error buying number", details: error }));
        return;
      }

    } else {
      console.error('Missing parameters');
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      return;
    }

  });

});

/*
  Function: Vapi - Delete Number
  Parameters:
    numberId
  Return:
    null
*/

exports.vapiDeleteNumber = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    if (req.body && req.body.numberId) {

      console.log('Deleting number', req.body.numberId);

      try {

        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });

        // Delete number
        await client.phoneNumbers.delete(req.body.numberId);

        res.status(200).send(JSON.stringify({ message: "Number deleted" }));
        return;
        

      } catch (error) {
        console.error('Error deleting number', error);
        res.status(500).send(JSON.stringify({ error: "Error deleting number" }));
        return;
      }

    } else {
      console.error('Missing parameters');
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      return;
    }

  });

});

/*
  Function: Vapi - Link Phone Number to Assistant
  Parameters:
    assistantId
    phoneNumber
  Return:
    null
*/

exports.vapiLinkPhoneNumberToAssistant = onRequest((req, res) => {

  
  corsMiddleware(req, res, async () => {

    if (req.body && req.body.assistantId && req.body.phoneNumberId) {

      const assistantId = req.body.assistantId;
      const phoneNumberId = req.body.phoneNumberId;

      try {
        // Create client
        const client = new VapiClient({
          token: process.env.REACT_APP_VAPI_API_KEY,
        });
      
        // Link phone number to assistant
        await client.phoneNumbers.update(phoneNumberId.toString(), {
          assistantId: assistantId.toString()
        });

        res.status(200).send(JSON.stringify({ message: "Phone number linked to assistant" }));

      } catch (error) {
        console.error('Error linking phone number to assistant', error);
        res.status(500).send(JSON.stringify({ error: "Error linking phone number to assistant" }));
        return;
      }

    } else {
      console.error('Missing parameters');
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      return;
    }
  });

});

/*
  Function: Firecrawl Extract
  Parameters:
    url
  Return:
    null
*/

exports.firecrawlExtract = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {

    if (req.body && req.body.url) {

      // console.log('Firecrawl Extract', req.body);

      const url = req.body.url;

      // Validate URL format
      const urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
      if (!url.match(urlRegex)) {
        console.error('Invalid URL format', url);
        res.status(400).send(JSON.stringify({ error: "Invalid URL format" }));
        return;
      }

      try {

        const app = new FirecrawlApp({ apiKey: process.env.REACT_APP_FIRECRAWL_API_KEY });

        const schema = z.object({
          business_location: z.string(),
          phone_number: z.string(),
          email: z.string(),
          services_offered: z.array(z.string()),
          insurance_accepted: z.array(z.string()),
          business_summary: z.string()
        });

        const extractResult = await app.extract([
          url
        ], {
          prompt: "Extract the business location, phone number, email, services offered, insurance accepted, and a summary of the business from the page.",
          schema,
        });

        // console.log('Firecrawl response', extractResult);

        res.status(200).send(JSON.stringify(extractResult));
        return;

      } catch (error) {
        console.error('Error extracting data', error);
        res.status(500).send(JSON.stringify({ error: "Error extracting data" }));
        return;
      }

    } else {
      console.error('Missing parameters', req.body);
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      return;
    }

  });

});


/*
  Function: Stripe API: Create customer
  Parameters:
    customer_email
    user_id
  Return:
    null
*/

exports.stripeCreateCustomer = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {

    if (req.body && req.body.customer_email) {

      let customerEmail = req.body.customer_email;
      let userId = req.body.user_id;

      stripe.customers.create({
        email: customerEmail,
        metadata: {
          user_id: userId
        }
      }).then((customer) => {
        if (customer) {
          res.status(200).send(customer);
        } else {
          res.status(400).send(JSON.stringify({ error: "Stripe error" }));
        }
      }).catch((error) => {
        res.status(400).send(JSON.stringify({ error: "Stripe error" }));
      })

    } else {
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
    }

  })
});

/*
  Function: Stripe API: Create checkout session
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

exports.stripeCreateCheckoutSession = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.body && req.body.price_id && req.body.stripe_customer_id) {
      let priceId = req.body.price_id;
      let customerId = req.body.stripe_customer_id;

      stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/canceled`,
        customer: customerId,
      }).then((session) => {
        res.status(200).send({ url: session.url });
      }).catch((error) => {
        return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
      })

    } else {
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
    }
  })
});


/*
  Function: Stripe API: Create customer billing portal
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

exports.stripeCreateCustomerPortalSession = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.body && req.body.stripe_customer_id) {
      let customerId = req.body.stripe_customer_id;
      stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.REACT_APP_STRIPE_PORTAL_URL}`,
      }).then((session) => {
        res.status(200).send({ url: session.url });
      }).catch((error) => {
        return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
      })
    } else {
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
    }
  })
});

/*
  Function: Stripe API: Get subscription status
  Parameters:
    subscription_id: Stripe subscription id
  Return:
    subscription object
*/

exports.stripeGetSubscription = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.body && req.body.subscription_id) {
      let subscriptionId = req.body.subscription_id;
      stripe.subscriptions.retrieve(
        subscriptionId
      ).then((subscription) => {
        res.status(200).send({ subscription: subscription });
      }).catch((error) => {
        return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
      })
    } else {
      res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
    }
  })
});


/*
  Function: Stripe Webhooks
  Parameters:
  Return:
*/

exports.stripeWebhooks = onRequest(
  { cors: true },
  (req, res) => {
    let event = req.body;

    const endpointSecret = process.env.REACT_APP_STRIPE_ENDPOINT_SECRET;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }

    let subscription;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        console.log('customer.subscription.trial_will_end', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        console.log('customer.subscription.deleted', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        console.log('customer.subscription.created', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        console.log('customer.subscription.updated', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'customer.subscription.paused':
        subscription = event.data.object;
        console.log('customer.subscription.paused', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'customer.subscription.resumed':
        subscription = event.data.object;
        console.log('customer.subscription.resumed', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      case 'entitlements.active_entitlement_summary.updated':
        subscription = event.data.object;
        console.log('entitlements.active_entitlement_summary.updated', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateWorkspace(subscription);
        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);


/*
  Function: Update user with Stripe details
  Parameters:
    customer_id
    plan_id
    status
  Return:
    null
*/

async function stripeUpdateWorkspace(subscription) {

  console.log('stripeUpdateWorkspace', subscription);

  try {

    let workspace = await db.collection('workspaces').where('stripe_customer_id', '==', subscription.customer).limit(1).get();

    if (workspace.docs.length > 0) {

      let workspaceData = workspace.docs[0].data();
      let workspaceId = workspace.docs[0].id;

      workspaceData.stripe_subscription_id = subscription.id;
      workspaceData.stripe_plan_id = subscription.plan.id;
      workspaceData.stripe_status = subscription.status;
      workspaceData.stripe_current_period_start = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null;
      workspaceData.stripe_current_period_end = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

      await db.collection('workspaces').doc(workspaceId).update(workspaceData);

      console.log('workspace updated', workspaceData);

    }

    return true;

  } catch (error) {
    console.log('stripeUpdateWorkspace error', error);
    return false;
  }

}

/*
  Webhook: Calls from Retell
*/

// exports.retellCallWebhook = onRequest((req, res) => {
//   console.log('Retell call webhook');
  
//   // TODO: Add signature verification
//   // if (
//   //   !Retell.verify(
//   //     req.rawBody,
//   //     process.env.REACT_APP_RETELL_API_KEY,
//   //     req.headers["x-retell-signature"],
//   //   )
//   // ) {
//   //   console.error("Invalid signature");
//   //   res.status(401).send('Invalid signature');
//   //   return;
//   // }

//   const {event, call} = req.body;
//   switch (event) {
//     case "call_started":
//       break;
//     case "call_ended":
//       break;
//     case "call_analyzed":
//       console.log("Call analyzed event received", call.call_id);
//       saveRetellCallToDatabase(call).then(() => {
//         console.log('Call saved to database', call.call_id);
//       }).catch((error) => {
//         console.error('Error saving call to database', error);
//       });
//       break;
//     default:
//       console.log("Received an unknown event:", event);
//   }
  
//   // Send response only once at the end
//   res.status(204).send();
// });

/*
  Function: Save Retell call to database
  Parameters:
    call
  Return:
    null
*/

// async function saveRetellCallToDatabase(call) {

//   console.log('Saving Retell call to database', call);

//   // Get workspaceId from based on call.agent_id
//   if (!call.agent_id) {
//     console.error('No agent_id found for call', call.call_id);
//     return;
//   }

//   const agents = await db.collection('agents').where('retellAgentId', '==', call.agent_id).limit(1).get();
  
//   if (agents.docs.length === 0) {
//     console.error('No agent found for call', call.agent_id);
//     return;
//   }

//   const agent = agents.docs[0].data();
//   const workspaceId = agent.workspaceId;
//   const notifyEmail = agent.notifyEmail ? agent.notifyEmail : null;

//   // Save call to database
//   const callId = uuidv4();
//   await db.collection('calls').doc(callId).set({
//     id: callId,
//     workspaceId: workspaceId,
//     agentId: call.agent_id,
//     callId: call.call_id,
//     cost: call.call_cost || null,
//     callSummary: call.call_analysis && call.call_analysis.call_summary ? call.call_analysis.call_summary : null,
//     userSentiment: call.call_analysis && call.call_analysis.user_sentiment ? call.call_analysis.user_sentiment : null,
//     callerName: call.call_analysis && call.call_analysis.custom_analysis_data && call.call_analysis.custom_analysis_data.caller_name ? call.call_analysis.custom_analysis_data.caller_name : 'Anonymous',
//     callPurpose: call.call_analysis && call.call_analysis.custom_analysis_data && call.call_analysis.custom_analysis_data.purpose_of_call ? call.call_analysis.custom_analysis_data.purpose_of_call : 'Unknown',
//     fromNumber: call.from_number ? call.from_number : null,
//     toNumber: call.to_number ? call.to_number : null,
//     direction: call.direction || null,
//     callStatus: call.call_status || null,
//     startTimestamp: call.start_timestamp || null,
//     endTimestamp: call.end_timestamp || null,
//     durationMs: call.duration_ms || null,
//     transcript: call.transcript || null,
//     recordingUrl: call.recording_url || null,
//     disconnectReason: call.disconnect_reason || null,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   });

//   // TODO: Send email notification with call summary to notifyEmail if it exists
//   // if (notifyEmail) {
//   //   sendEmailNotification(notifyEmail, call);
//   // }

//   return;

// }

/*
  Function: Create Retell LLM and Agent for Receptionist
  Parameters:
    agent
  Return:
    null
*/

// exports.createRetellLlmAndAgentForReceptionist = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {

//       console.log('Creating Retell LLM and Agent for Receptionist');

//       if (req.body && req.body.workspaceId && req.body.agentId && req.body.llm && req.body.agent) {

//         const workspaceId = req.body.workspaceId;
//         const agentId = req.body.agentId;
//         const llm = req.body.llm;
//         const agent = req.body.agent;

//         // Create client  
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Create LLM
//         const retellLlm = await client.llm.create(llm);

//         if (!retellLlm) {
//           console.error('Error creating Retell LLM', retellLlm);
//           res.status(500).send(JSON.stringify({ error: "Error creating Retell LLM" }));
//           return;
//         }
        
//         // Create Agent
//         agent.response_engine.llm_id = retellLlm.llm_id;
//         const retellAgent = await client.agent.create(agent);

//         if (!retellAgent) {
//           console.error('Error creating Retell Agent', retellAgent);
//           res.status(500).send(JSON.stringify({ error: "Error creating Retell Agent" }));
//           return;
//         }

//         // Save agent to database
//         const dbAgents = await db.collection('agents').where('id', '==', agentId).where('workspaceId', '==', workspaceId).limit(1).get();

//         if (dbAgents.docs.length > 0) {
//           await dbAgents.docs[0].ref.update({
//             retellLlmId: retellLlm.llm_id,
//             retellAgentId: retellAgent.agent_id,
//             updatedAt: new Date().toISOString(),
//           });
//           res.status(200).send(JSON.stringify({ retell_llm_id: retellLlm.llm_id, retell_agent_id: retellAgent.agent_id }));
//           return;

//         } else {
//           console.error('No agent found in database', req.body.agentId);
//           res.status(400).send(JSON.stringify({ error: "No agent found in database" }));
//           return;
//         }
        
//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }

//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });
  
// });


/*
  Function: Update Retell LLM for Receptionist
  Parameters:
    llm
  Return:
    null
*/

// exports.updateRetellLlmForReceptionist = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {

//       // Verify authorization header
//       // let authorized = await verifyAuthorizationHeader(req);
//       // if (!authorized) {
//       //   res.status(401).send(JSON.stringify({ error: "Unauthorized" }));
//       //   return;
//       // }

//       console.log('Updating Retell LLM for Receptionist');

//       if (req.body && req.body.llm_id && req.body.llm) {

//         const llm_id = req.body.llm_id;
//         const llm = req.body.llm;

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Update LLM
//         const retellLlm = await client.llm.update(llm_id, llm);

//         console.log('Retell LLM updated', llm_id);

//         res.status(200).send(JSON.stringify({ message: "Retell LLM updated" }));
//         return;

//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }

//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });

// });

/*
  Function: Update Retell Agent for Receptionist
  Parameters:
    agent_id
    agent
  Return:
    null
*/

// exports.updateRetellAgentForReceptionist = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {

//       console.log('Updating Retell Agent for Receptionist');

//       if (req.body && req.body.agent_id && req.body.agent) {

//         const agent_id = req.body.agent_id;
//         const agent = req.body.agent;

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Update Agent
//         const retellAgent = await client.agent.update(agent_id, agent);

//         res.status(200).send(JSON.stringify({ message: "Retell Agent updated" }));
//         return;

//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }

//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }
//   });

// });

/*
  Function: Create Retell Agent
  Parameters:
    agentName
  Return:
    null
*/

// exports.deleteRetellAgent = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {
//       if (req.body && req.body.retellLlmId && req.body.retellAgentId) {
//         console.log('Deleting Retell Agent');

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Delete LLM
//         await client.llm.delete(req.body.retellLlmId);

//         // Delete Agent
//         await client.agent.delete(req.body.retellAgentId);

//         res.status(200).send(JSON.stringify({ message: "Retell Agent deleted" }));
//         return;

//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });

// });

/*
  Function: Import Retell Phone Number
  Parameters:
    phonenumber
    terminationuri
    nickname
  Return:
    null
*/

// exports.importRetellPhoneNumber = onRequest((req, res) => {

//   console.log('Importing Retell Phone Number', req.body);
  
//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {
//       if (req.body && req.body.phoneNumber && req.body.terminationUri && req.body.nickname) {
//         console.log('Importing Retell Phone Number');

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Import Phone Number
//         let phoneNumber = await client.phoneNumber.import({
//           phone_number: req.body.phoneNumber,
//           termination_uri: req.body.terminationUri,
//           nickname: req.body.nickname,
//         });

//         console.log('Retell Phone Number imported', phoneNumber);
//         res.status(200).send(JSON.stringify({ message: "Retell Phone Number imported" }));
//         return;

//       } else {
//         console.error('Missing parameters');
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });

// });

/*
  Function: Buy Retell Phone Number
  Parameters:
    areaCode
    nickname
  Return:
    null
*/

// exports.buyRetellPhoneNumber = onRequest((req, res) => {

//   console.log('Buying Retell Phone Number', req.body);
  
//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {
//       if (req.body && req.body.areaCode && req.body.nickname) {
        
//         console.log('Buying Retell Phone Number');

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Buy Phone Number
//         try {
//           let phoneNumber = await client.phoneNumber.create({
//             area_code: parseInt(req.body.areaCode),
//             nickname: req.body.nickname,
//           });

//           console.log('Retell Phone Number bought', phoneNumber);
//           res.status(200).send(JSON.stringify(phoneNumber));
//           return;

//         } catch (error) {
//           console.error('Error buying phone number', error);
//           res.status(500).send(JSON.stringify({ error: "Error buying phone number" }));
//           return;
//         }

//         // res.status(200).send(JSON.stringify({ phone_number: '1234567890', last_modification_timestamp: '2021-01-01T00:00:00.000Z' }));
//         // return;

//       } else {
//         console.error('Missing parameters');
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });
  
// });

/*
  Function: Delete Retell Phone Number
  Parameters:
    phoneNumber
  Return:
    null
*/

// exports.deleteRetellPhoneNumber = onRequest((req, res) => {

//   console.log('Deleting Retell Phone Number', req.body);

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {
//       if (req.body && req.body.phoneNumber) {

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Delete Phone Number
//         try {
//           await client.phoneNumber.delete(req.body.phoneNumber);
//         } catch (error) {
//           console.error('Error deleting phone number', error);
//           res.status(500).send(JSON.stringify({ error: "Error deleting phone number" }));
//           return;
//         }

//         console.log('Retell Phone Number deleted', req.body.phoneNumber);
//         res.status(200).send(JSON.stringify({ message: "Retell Phone Number deleted" }));
//         return;
        
//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });

// });

/*
  Function: Connect Retell Phone Number to Agent
  Parameters:
    retellAgentId
    phoneNumber
  Return:
    null
*/

// exports.connectRetellPhoneNumberToAgent = onRequest((req, res) => {

//   console.log('Connecting Retell Phone Number to Agent');

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {
//       if (req.body && req.body.retellAgentId && req.body.phoneNumber) {
//         console.log('Connecting Retell Phone Number to Agent', req.body);

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Connect Phone Number to Agent
//         await client.phoneNumber.update( req.body.phoneNumber, {
//           inbound_agent_id: req.body.retellAgentId,
//         });

//         console.log('Retell Phone Number connected to Agent', req.body.retellAgentId, req.body.phoneNumber);
//         res.status(200).send(JSON.stringify({ message: "Retell Phone Number connected to Agent" }));
//         return;
        
//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }

//   });

// });


/*
  Function: Create Retell Agent
  Parameters:
    agentName
  Return:
    null
*/

// exports.createRetellAgent = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {
//     if (req && req.headers) {

//       if (req.body && req.body.template && req.body.agentId && req.body.agentName && req.body.businessName && req.body.businessInfo && req.body.faq && req.body.model && req.body.voiceId && req.body.language && req.body.includeDisclaimer && req.body.retellAgentCode) {
        
//         console.log('Creating Retell Agent', req.body);

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Create LLM
//         let llm = null;
//         switch (req.body.template) {
//           case 'basic-phone-receptionist':
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_LLM));
//             break;
//           case 'phone-receptionist-with-cal-com':
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_WITH_CAL_COM_LLM));
//             break;
//           default:
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_LLM));
//         }

//         // Replace llm model
//         llm.model = req.body.model;
        
//         // Replace variables in begin_message
//         llm.begin_message = llm.begin_message.replaceAll('[[AGENT_NAME]]', req.body.agentName);
//         llm.begin_message = llm.begin_message.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//         llm.begin_message = llm.begin_message.replaceAll('[[INCLUDE_DISCLAIMER]]', req.body.includeDisclaimer ? 'If this is an emergency, please hang up and dial Nine-One-One.' : '');
        
//         // Replace variables in general_prompt
//         llm.general_prompt = llm.general_prompt.replaceAll('[[AGENT_NAME]]', req.body.agentName);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_INFO]]', req.body.businessInfo);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[FAQ]]', req.body.faq);

//         // Replace variables in general_tools
//         llm.general_tools = llm.general_tools.map(tool => {
//           if (tool.cal_api_key) {
//             tool.cal_api_key = tool.cal_api_key.replaceAll('[[CAL_API_KEY]]', req.body.calApiKey);
//           }
//           if (tool.event_type_id) {
//             tool.event_type_id = parseInt(tool.event_type_id.replaceAll('[[CAL_EVENT_TYPE_ID]]', req.body.calEventTypeId));
//           }
//           if (tool.description) {
//             tool.description = tool.description.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//           }
//           if (tool.timezone) {
//             tool.timezone = tool.timezone.replaceAll('[[TIMEZONE]]', req.body.timezone);
//           }
//           return tool;
//         });

//         // console.log('LLM', llm);

//         // Create LLM
//         const retellLlm = await client.llm.create(llm);

//         if (!retellLlm) {
//           console.error('Error creating Retell LLM', retellLlm);
//           res.status(500).send(JSON.stringify({ error: "Error creating Retell LLM" }));
//           return;
//         }

//         // Create Agent
//         let agent = null;
//         switch (req.body.template) {
//           case 'basic-phone-receptionist':
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_AGENT));
//             break;
//           case 'phone-receptionist-with-cal-com':
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_WITH_CAL_COM_AGENT));
//             break;
//           default:
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_AGENT));
//         }

//         agent.response_engine.llm_id = retellLlm.llm_id;
//         agent.agent_name = req.body.retellAgentCode;
//         agent.voice_id = req.body.voiceId;
//         agent.language = req.body.language;

//         // Create Agent
//         const retellAgent = await client.agent.create(agent);

//         if (!retellAgent) {
//           console.error('Error creating Retell Agent', retellAgent);
//           res.status(500).send(JSON.stringify({ error: "Error creating Retell Agent" }));
//           return;
//         }

//         // Save agent to database
//         const dbAgents = await db.collection('agents').where('id', '==', req.body.agentId).limit(1).get();

//         if (dbAgents.docs.length > 0) {
//           await dbAgents.docs[0].ref.update({
//             retellLlmId: retellLlm.llm_id,
//             retellAgentId: retellAgent.agent_id,
//             updatedAt: new Date().toISOString(),
//           });
//           res.status(200).send(JSON.stringify({ retell_llm_id: retellLlm.llm_id, retell_agent_id: retellAgent.agent_id }));
//           return;

//         } else {
//           console.error('No agent found in database', req.body.agentId);
//           res.status(400).send(JSON.stringify({ error: "No agent found in database" }));
//           return;
//         }

//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }
//   });
  
// });

/*
  Function: Update Retell Agent
  Parameters:
    retellAgentId
    agent
  Return:
    null
*/

// exports.updateRetellLlmAndAgent = onRequest((req, res) => {

//   corsMiddleware(req, res, async () => {

//     if (req && req.headers) {

//       console.log('Updating Retell LLM and Agent');

//       if (req.body && req.body.template && req.body.agentId && req.body.agentName && req.body.businessName && req.body.businessInfo && req.body.faq && req.body.model && req.body.voiceId && req.body.language && req.body.includeDisclaimer && req.body.retellAgentCode && req.body.retellLlmId && req.body.retellAgentId) {

//         // Create client
//         const client = new Retell({
//           apiKey: process.env.REACT_APP_RETELL_API_KEY,
//         });

//         // Create LLM - TODO: Add more templates
//         let llm = null;
//         switch (req.body.template) {
//           case 'basic-phone-receptionist':
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_LLM));
//             break;
//           case 'phone-receptionist-with-cal-com':
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_WITH_CAL_COM_LLM));
//             break;
//           default:
//             llm = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_LLM));
//         }

//         // Replace variables in model
//         llm.model = req.body.model;
        
//         // Replace variables in begin_message
//         llm.begin_message = llm.begin_message.replaceAll('[[AGENT_NAME]]', req.body.agentName);
//         llm.begin_message = llm.begin_message.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//         llm.begin_message = llm.begin_message.replaceAll('[[INCLUDE_DISCLAIMER]]', req.body.includeDisclaimer ? 'If this is an emergency, please hang up and dial Nine-One-One.' : '');
        
//         // Replace variables in general_prompt
//         llm.general_prompt = llm.general_prompt.replaceAll('[[AGENT_NAME]]', req.body.agentName);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[BUSINESS_INFO]]', req.body.businessInfo);
//         llm.general_prompt = llm.general_prompt.replaceAll('[[FAQ]]', req.body.faq);

//         // Replace variables in general_tools
//         llm.general_tools = llm.general_tools.map(tool => {
//           if (tool.cal_api_key) {
//             tool.cal_api_key = tool.cal_api_key.replaceAll('[[CAL_API_KEY]]', req.body.calApiKey);
//           }
//           if (tool.event_type_id) {
//             tool.event_type_id = parseInt(tool.event_type_id.replaceAll('[[CAL_EVENT_TYPE_ID]]', req.body.calEventTypeId));
//           }
//           if (tool.description) {
//             tool.description = tool.description.replaceAll('[[BUSINESS_NAME]]', req.body.businessName);
//           }
//           if (tool.timezone) {
//             tool.timezone = tool.timezone.replaceAll('[[TIMEZONE]]', req.body.timezone);
//           }
//           return tool;
//         });

//         console.log('LLM', llm);

//         // Update LLM
//         const retellLlm = await client.llm.update(req.body.retellLlmId, llm);

//         console.log('Retell LLM updated');

//         if (!retellLlm) {
//           console.error('Error updating Retell LLM', retellLlm);
//           res.status(500).send(JSON.stringify({ error: "Error updating Retell LLM" }));
//           return;
//         }

//         // Update Agent
//         let agent = null;
//         switch (req.body.template) {
//           case 'basic-phone-receptionist':
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_AGENT));
//             break;
//           case 'phone-receptionist-with-cal-com':
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_PHONE_RECEPTIONIST_WITH_CAL_COM_AGENT));
//             break;
//           default:
//             agent = JSON.parse(JSON.stringify(RETELL_TEMPLATE_BASIC_PHONE_RECEPTIONIST_AGENT));
//         }

//         // Update agent's dynamic properties
//         agent.agent_name = req.body.retellAgentCode;
//         agent.voice_id = req.body.voiceId;
//         agent.language = req.body.language;
//         agent.response_engine.llm_id = req.body.retellLlmId;

//         // Create Agent
//         const retellAgent = await client.agent.update(req.body.retellAgentId, agent);

//         if (!retellAgent) {
//           console.error('Error updating Retell Agent', retellAgent);
//           res.status(500).send(JSON.stringify({ error: "Error updating Retell Agent" }));
//           return;
//         }
        
//         res.status(200).send(JSON.stringify({ message: "Retell Agent updated" }));
//         return;

//       } else {
//         console.error('Missing parameters', req.body);
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//         return;
//       }
//     } else {
//       console.error('Authorization failed', req.headers);
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//       return;
//     }
//   });

// });


/*
  Function: Get access token from Epic
  Parameters:
    code
  Return:
    accessToken
    refreshToken
*/

// exports.getAccessTokenFromEpic = onRequest((req, res) => {
//   console.log('Getting access token from Epic', req.body);
//   console.log('Epic client ID:', process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD);
//   console.log('Epic client secret:', process.env.REACT_APP_EPIC_CLIENT_SECRET);
//   console.log('Epic redirect URI:', process.env.REACT_APP_EPIC_REDIRECT_URI);
//   corsMiddleware(req, res, async () => {
    
//     const code = req.body.code;
    
//     try {

//       const response = await fetch('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           grant_type: "authorization_code",
//           client_id: process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD,
//           client_secret: process.env.REACT_APP_EPIC_CLIENT_SECRET,
//           redirect_uri: process.env.REACT_APP_EPIC_REDIRECT_URI,
//           code: code,
//         }),
//       });

//       if (!response.ok) {
//         // Get the error response body
//         const errorBody = await response.text();
//         console.error('Epic API Error:', {
//           status: response.status,
//           statusText: response.statusText,
//           body: errorBody,
//           headers: Object.fromEntries(response.headers.entries())
//         });
        
//         return res.status(response.status).json({
//           error: "Failed to fetch access token",
//           details: errorBody,
//           status: response.status
//         });
//       }

//       const data = await response.json();
//       console.log('Successfully retrieved access token');
//       res.status(200).send(data);

//     } catch (error) {
//       console.error("Error fetching access token:", error);
//       res.status(500).json({ 
//         error: "Error fetching access token",
//         message: error.message 
//       });
//     }
//   });
// });

/*
  Function: Get access token from DrChrono
  Parameters:
    code
  Return:
    appointments
*/

// exports.getAccessTokenFromDrChrono = onRequest((req, res) => {
//   console.log('Getting access token from DrChrono', req.body);
//   corsMiddleware(req, res, async () => {
//     const code = req.body.code;
//     try {
//       const response = await fetch('https://drchrono.com/o/token/', {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           grant_type: "authorization_code",
//           client_id: process.env.REACT_APP_DRCHRONO_CLIENT_ID,
//           client_secret: process.env.REACT_APP_DRCHRONO_CLIENT_SECRET,
//           redirect_uri: process.env.REACT_APP_DRCHRONO_REDIRECT_URI,
//           code: code,
//         }),
//       });

//       if (!response.ok) {
//         // Get the error response body
//         const errorBody = await response.text();
//         console.error('DrChrono API Error:', {
//           status: response.status,
//           statusText: response.statusText,
//           body: errorBody,
//           headers: Object.fromEntries(response.headers.entries())
//         });
        
//         return res.status(response.status).json({
//           error: "Failed to fetch access token",
//           details: errorBody,
//           status: response.status
//         });
//       }

//       const data = await response.json();
//       console.log('Successfully retrieved access token');
//       res.status(200).send(data);

//     } catch (error) {
//       console.error("Error fetching access token:", error);
//       res.status(500).json({ 
//         error: "Error fetching access token",
//         message: error.message 
//       });
//     }
//   });
// });

/*
  Scheduled: Pull in events from Google Calendar
*/

// exports.getEventsFromCalendar = onSchedule('every 5 minutes', async () => { // 0 * * * *

//   const currentHour = new Date().getHours();
//   console.log('Pulling in events from Google Calendar at', currentHour + ':00');
  
//   try {

//       // Get calendars
//       let querySnapshot = await db.collection('calendars').where('provider', '==', 'google').get();

//       // Get the appointments from the calendar
//       console.log('Found', querySnapshot.docs.length, 'calendars');
      
//       let appointments = [];

//       if (querySnapshot.docs.length > 0) {
//         for (let calendar of querySnapshot.docs) {
//           const calendarRef = calendar.ref;
//           // console.log('callling getGoogleCalendarEvents for', calendar.data());
//           let events = await getGoogleCalendarEvents(
//             calendar.data().accessToken,
//             calendar.data().refreshToken,
//             calendarRef
//           );
          
//           console.log('Found', events.length, 'events');

//           for (let event of events) {
//             // Update appointment in database if it exists, otherwise create it
//             let appointment = await db.collection('appointments').where('id', '==', event.id).limit(1).get();
//             if (appointment.docs.length > 0) {
//               console.log('Appointment found:', event.id);
//               await appointment.docs[0].ref.update({
//                 startTime: event.start.dateTime,
//                 endTime: event.end.dateTime,
//                 summary: event.summary || 'Summary',
//                 location: event.location || 'No location provided',
//                 description: event.description || 'No description provided',
//                 updatedAt: new Date().toISOString(),
//               });
//             } else {
//               console.log('Appointment not found:', event.id);
//               await db.collection('appointments').add({
//                 id: event.id,
//                 startTime: event.start.dateTime,
//                 endTime: event.end.dateTime,
//                 summary: event.summary || 'Summary',
//                 location: event.location || 'No location provided',
//                 description: event.description || 'No description provided',
//                 calendarId: calendar.data().id,
//                 workspaceId: calendar.data().workspaceId,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString(),
//               });
//             }
//           }
//         }
//       }

//       console.log('Found', appointments.length, 'appointments');

//     return;

//   } catch (error) {
//     console.error("Error fetching active campaigns:", error);
//     return;
//   }

// });



/*
  Scheduled: Run campaigns every hour
*/

// exports.runCampaigns = onSchedule('0 * * * *', async () => {

//   const currentHour = new Date().getHours();
//   console.log('Running campaigns at', currentHour + ':00');
  
//   try {

//     let activeCampaigns = [];
//     let querySnapshot = await db.collection('campaigns').where('enabled', '==', true).get();

//     // console.log('Found', querySnapshot.docs.length, 'campaigns');
    
//     querySnapshot.forEach((doc) => {
//       activeCampaigns.push(doc.data());
//     });

//     // console.log('Active campaigns:', activeCampaigns.length);

//     // For each campaign, get the appointments from the calendar
//     for (let campaign of activeCampaigns) {

//       if (campaign.agentId === 1) { // Appointment reminder agent
        
//         // console.log('Campaign:', campaign.name);
        
//         if (campaign.calendarId) {

//           // Get calendar
//           let calendar = await db.collection('calendars').where('id', '==', campaign.calendarId).limit(1).get();
//           let calendarData = calendar.docs[0].data();
//           // console.log('\tCalendar:', calendarData.name);

//           let appointments = [];

//           // Get the appointments from the calendar
//           if (calendarData.provider === 'google') {
//             const calendarRef = calendar.docs[0].ref;  // Get reference to the calendar document
//             appointments = await getGoogleCalendarEvents(
//               calendarData.accessToken,
//               calendarData.refreshToken,
//               calendarRef
//             );
//             // console.log('\tNumber of appointments:', appointments.length);
//           }
            
//           // For each appointment, check if the apppointment is within calendar.hoursInAdvance
//           if (appointments.length > 0) {
//             for (let appointment of appointments) {

//               // console.log('\t\tAppointment:', appointment);

//               // Get appointment start time
//               const appointmentStartTime = new Date(appointment.start.dateTime);
//               const now = new Date();

//               // console.log('\t\tNow:', now);
//               // console.log('\t\tAppointment start time:', appointmentStartTime);
              
//               // Calculate hours until appointment
//               const hoursUntilAppointment = Math.round((appointmentStartTime - now) / (1000 * 60 * 60));

//               // console.log('\t\tHours until appointment:', hoursUntilAppointment);
//               // console.log('\t\tHours in advance:', campaign.hoursInAdvance);
              
//               // Check if the appointment is between hoursInAdvance and hoursInAdvance + 1
//               if (hoursUntilAppointment >= campaign.hoursInAdvance && hoursUntilAppointment < campaign.hoursInAdvance + 1) {
//                 console.log('Schedule call for:', appointment.summary, 'in', hoursUntilAppointment, 'hours');
//                 // Add call to logs
//                 const logId = uuidv4();
//                 db.collection('logs').doc(logId).set({
//                   id: logId,
//                   type: 'phone',
//                   campaignId: campaign.id,
//                   agentId: campaign.agentId,
//                   appointment: appointment,
//                   appointmentStartTime: appointmentStartTime,
//                   hoursInAdvance: campaign.hoursInAdvance,
//                   hoursUntilAppointment: hoursUntilAppointment,
//                   calendarId: campaign.calendarId,
//                   fromPhoneNumber: campaign.phoneNumber,
//                   toPhoneNumber: appointment.location || 'Unknown',
//                   status: 'scheduled',
//                   workspaceId: campaign.workspaceId,
//                   createdAt: new Date().toISOString(),
//                   updatedAt: new Date().toISOString(),
//                 });
//                 // TODO: Make call with Retell AI, pass in logId in metadata
//               }
//             }
//           }
//         }
//       }
//     }

//     return;

//   } catch (error) {
//     console.error("Error fetching active campaigns:", error);
//     return;
//   }

// });

/*
  Function: Get appointments from Google Calendar
  Parameters:
    accessToken
    refreshToken
    calendarDocRef
  Return:
    appointments
*/

// async function getGoogleCalendarEvents(accessToken, refreshToken, calendarDocRef) {
  
//   const calendarId = 'primary';
//   const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  
//   const params = new URLSearchParams({
//     timeMin: new Date().toISOString(),
//     singleEvents: 'true',
//     orderBy: 'startTime',
//     maxResults: '10' // TODO: Remove this
//   });

//   async function fetchWithToken(token) {
//     return fetch(`${url}?${params}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Accept': 'application/json'
//       }
//     });
//   }

//   try {
//     let response = await fetchWithToken(accessToken);

//     // If token expired, refresh it
//     if (response.status === 401 && refreshToken) {

//       console.log("Access token expired, refreshing...");
      
//       const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
//           client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
//           refresh_token: refreshToken,
//           grant_type: 'refresh_token',
//         }),
//       });

//       if (!tokenResponse.ok) {
//         throw new Error('Failed to refresh token');
//       }

//       const newTokens = await tokenResponse.json();
      
//       // Update the calendar document with new access token
//       await calendarDocRef.update({
//         accessToken: newTokens.access_token,
//         refreshToken: newTokens.refresh_token,
//         updatedAt: new Date().toISOString(),
//       });

//       console.log('Updated calendar with new tokens:', newTokens);

//       // Retry the calendar request with new token
//       response = await fetchWithToken(newTokens.access_token);
//     }

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.items;
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     return [];
//   }
// }


/*
  Function: MixPanel Track Event
  Parameters:
    user_id
    event_name
    event
  Return:
    200 or 400
*/

// exports.mixpanelTrackEvent = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.user_id && req.body.event_name && req.body.event) {

//         let user_id = req.body.user_id;
//         let event_name = req.body.event_name;
//         let event_object = req.body.event;

//         try {
          
//           // Create an instance of the mixpanel client
//           const mixpanel = Mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);

//           // Track event
//           mixpanel.track(event_name, event_object);
          
//           // Increment document created
//           if (event_name === 'Document Created') {
//             mixpanel.people.increment(user_id, 'documents_created');
//           }
          
//           // Increment file created
//           if (event_name === 'File Created') {
//             mixpanel.people.increment(user_id, 'files_created');
//           }

//           res.status(200).send();

//         } catch(err) {
//           res.status(400).send(JSON.stringify({ error: "Mixpanel error" }));
//         }
//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });



