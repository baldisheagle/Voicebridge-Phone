Vapi Webhook {
    host: 'us-central1-voicebridge-app.cloudfunctions.net',
    accept: 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'x-vapi-secret': '',
    'user-agent': 'axios/1.7.7',
    'content-length': '78275',
    'sentry-trace': '5668d6112d6c4270b62134ffdd1a4c43-b48f8b2f35424a9c',
    baggage: 'sentry-environment=production,sentry-public_key=a0021577936aec367b16615ad816c078,sentry-trace_id=5668d6112d6c4270b62134ffdd1a4c43',
    'x-datadog-trace-id': '5291248755436699688',
    'x-datadog-parent-id': '5291248755436699688',
    'x-datadog-sampling-priority': '0',
    'x-datadog-tags': '_dd.p.tid=67a940a700000000',
    traceparent: '00-67a940a700000000496e4ab576084028-351f765a63e41bcc-01',
    tracestate: 'dd=t.tid:67a940a700000000;t.dm:-1;s:0;p:496e4ab576084028',
    'x-cloud-trace-context': '67a940a700000000496e4ab576084028/3827908338883238860;o=1',
    cookie: 'callId=c5a368c5-54aa-41e7-97c4-fd0a578eedce',
    'x-forwarded-for': '34.217.215.104',
    'x-forwarded-proto': 'https',
    forwarded: 'for="34.217.215.104";proto=https',
    'accept-encoding': 'gzip, compress, deflate, br'
  } {
    message: {
      timestamp: 1739145383710,
      type: 'end-of-call-report',
      analysis: {
        summary: 'Summary:\n' +
          '\n' +
          'John Doe called to book a routine checkup appointment. He requested an appointment for Tuesday at 1 PM, which was successfully scheduled. The caller provided his email address (john@example.com) for the calendar invite. No follow-up is required as the appointment was successfully booked and the caller had no additional questions or needs.',
        structuredData: [Object],
        successEvaluation: 'true'
      },
      artifact: {
        messages: [Array],
        messagesOpenAIFormatted: [Array],
        transcript: 'AI: Hello. This is Mila. The Ai phone receptionist for California Chi. The team is unavailable right now. Can I assist you with booking an appointment or answering questions?\n' +
          'User: Sure. Can you help me book an appointment or used it? 1 of them.\n' +
          "AI: Uh of course, I can help you with booking an appointment. Let's start with your full name. Could you please provide your first and last name?\n" +
          'User: John doe,\n' +
          'AI: Nice to speak to you, John. Can I have your email address, please?\n' +
          'User: john at example dot com,\n' +
          'AI: I think I might have misunderstood.\n' +
          'User: john at example dot com,\n' +
          'AI: Thank you, John. Just to confirm, your email is john at example dot com. Is that correct? Your\n' +
          "User: That's correct.\n" +
          'AI: Great. Now. Can you tell me the reason for your appointment?\n' +
          'User: Routine checkout.\n' +
          "AI: Got it. A routine checkup. Just to get a clear picture, are you experiencing any discomfort? Or is it just a regular visit? Great. Let's go ahead and book your appointment. Can you let me know your preferred day and time for the appointment?\n" +
          'User: Tuesday at 1 Am,\n' +
          'AI: Just to clarify, Did you mean Tuesday at 1 Pm? We are open from 9 Am to 5 Pm on Tuesdays.\n' +
          'User: Yes. 1 Pm.\n' +
          'AI: Just a sack.\n' +
          'AI: Great. Should I book Tuesday at 1 Pm for you then?\n' +
          'User: Yes, please.\n' +
          'AI: Give me a moment.\n' +
          "AI: Perfect. I've got you down for Tuesday at 1 Pm. You'll receive a calendar invite in your email shortly. Is there anything else I can assist you with today?\n" +
          'User: No. That was it. Thank you.\n' +
          "AI: You're all set. Look forward to seeing you on Tuesday at 1 Pm. Have a great day. Thank you for contacting us. Have a great day.\n",
        recordingUrl: 'https://storage.vapi.ai/c5a368c5-54aa-41e7-97c4-fd0a578eedce-1739145380315-ad3d58f9-947f-49a7-8299-69a29774cfc8-mono.wav',
        stereoRecordingUrl: 'https://storage.vapi.ai/c5a368c5-54aa-41e7-97c4-fd0a578eedce-1739145380316-f6025b8b-0937-41c6-a398-c70f242178f2-stereo.wav'
      },
      startedAt: '2025-02-09T23:54:22.133Z',
      endedAt: '2025-02-09T23:56:17.809Z',
      endedReason: 'assistant-ended-call',
      cost: 0.4052,
      costBreakdown: {
        stt: 0.0198,
        llm: 0.2389,
        tts: 0.0367,
        vapi: 0.0964,
        total: 0.4052,
        llmPromptTokens: 57767,
        llmCompletionTokens: 285,
        ttsCharacters: 1223,
        analysisCostBreakdown: [Object]
      },
      costs: [
        [Object], [Object],
        [Object], [Object],
        [Object], [Object],
        [Object]
      ],
      durationMs: 115676,
      durationSeconds: 115.676,
      durationMinutes: 1.9279,
      summary: 'Summary:\n' +
        '\n' +
        'John Doe called to book a routine checkup appointment. He requested an appointment for Tuesday at 1 PM, which was successfully scheduled. The caller provided his email address (john@example.com) for the calendar invite. No follow-up is required as the appointment was successfully booked and the caller had no additional questions or needs.',
      transcript: 'AI: Hello. This is Mila. The Ai phone receptionist for California Chi. The team is unavailable right now. Can I assist you with booking an appointment or answering questions?\n' +
        'User: Sure. Can you help me book an appointment or used it? 1 of them.\n' +
        "AI: Uh of course, I can help you with booking an appointment. Let's start with your full name. Could you please provide your first and last name?\n" +
        'User: John doe,\n' +
        'AI: Nice to speak to you, John. Can I have your email address, please?\n' +
        'User: john at example dot com,\n' +
        'AI: I think I might have misunderstood.\n' +
        'User: john at example dot com,\n' +
        'AI: Thank you, John. Just to confirm, your email is john at example dot com. Is that correct? Your\n' +
        "User: That's correct.\n" +
        'AI: Great. Now. Can you tell me the reason for your appointment?\n' +
        'User: Routine checkout.\n' +
        "AI: Got it. A routine checkup. Just to get a clear picture, are you experiencing any discomfort? Or is it just a regular visit? Great. Let's go ahead and book your appointment. Can you let me know your preferred day and time for the appointment?\n" +
        'User: Tuesday at 1 Am,\n' +
        'AI: Just to clarify, Did you mean Tuesday at 1 Pm? We are open from 9 Am to 5 Pm on Tuesdays.\n' +
        'User: Yes. 1 Pm.\n' +
        'AI: Just a sack.\n' +
        'AI: Great. Should I book Tuesday at 1 Pm for you then?\n' +
        'User: Yes, please.\n' +
        'AI: Give me a moment.\n' +
        "AI: Perfect. I've got you down for Tuesday at 1 Pm. You'll receive a calendar invite in your email shortly. Is there anything else I can assist you with today?\n" +
        'User: No. That was it. Thank you.\n' +
        "AI: You're all set. Look forward to seeing you on Tuesday at 1 Pm. Have a great day. Thank you for contacting us. Have a great day.\n",
      messages: [
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object],
        [Object], [Object], [Object]
      ],
      recordingUrl: 'https://storage.vapi.ai/c5a368c5-54aa-41e7-97c4-fd0a578eedce-1739145380315-ad3d58f9-947f-49a7-8299-69a29774cfc8-mono.wav',
      stereoRecordingUrl: 'https://storage.vapi.ai/c5a368c5-54aa-41e7-97c4-fd0a578eedce-1739145380316-f6025b8b-0937-41c6-a398-c70f242178f2-stereo.wav',
      call: {
        id: 'c5a368c5-54aa-41e7-97c4-fd0a578eedce',
        orgId: 'c1268ed2-1c95-41bb-b461-e214ad7f9afa',
        createdAt: '2025-02-09T23:54:20.869Z',
        updatedAt: '2025-02-09T23:54:20.869Z',
        type: 'webCall',
        monitor: [Object],
        transport: [Object],
        webCallUrl: 'https://vapi.daily.co/Obb6PuzpYZa7xk4FKOYk',
        status: 'queued',
        assistant: [Object],
        assistantOverrides: [Object]
      },
      assistant: {
        name: 'b417c96a-de2c-4aa2-940e-7d5f780ae705',
        transcriber: [Object],
        model: [Object],
        voice: [Object],
        firstMessage: 'Hello, this is Mila, the AI phone receptionist for California Chiropractic. The team is unavailable right now. Can i assist you with booking an appointment or answering questions?',
        voicemailMessage: 'Hey, can you please call me back?',
        endCallMessage: 'Thank you for contacting us. Have a great day!',
        endCallPhrases: [Array],
        recordingEnabled: true,
        endCallFunctionEnabled: true,
        clientMessages: [Array],
        serverMessages: [Array],
        serverUrl: 'https://us-central1-voicebridge-app.cloudfunctions.net/vapiWebhook',
        backgroundSound: 'office',
        backchannelingEnabled: true,
        backgroundDenoisingEnabled: false,
        analysisPlan: [Object],
        messagePlan: [Object]
      }
    }
  }
  