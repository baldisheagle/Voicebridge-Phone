import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Text, Button, Dialog, VisuallyHidden, TextField, Select, TextArea, Spinner } from '@radix-ui/themes';
import { PHONE_RECEPTIONIST_TEMPLATE } from '../../config/agents.js';
import { dbCreateAgent } from '../../utilities/database.js';
import { createReceptionist } from '../../utilities/receptionist.js';   
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useRequireAuth } from '../../use-require-auth.js';
import { LANGUAGES, VOICES, TIMEZONE_OFFSETS, AMBIENT_SOUNDS } from '../../config/lists.js';

export default function NewReceptionist({ onInitReceptionist }) {

    const auth = useRequireAuth();

    const [step, setStep] = useState(1);
    const [agentName, setAgentName] = useState(PHONE_RECEPTIONIST_TEMPLATE.name);
    const [voiceId, setVoiceId] = useState(PHONE_RECEPTIONIST_TEMPLATE.voiceId);
    const [language, setLanguage] = useState(PHONE_RECEPTIONIST_TEMPLATE.language);
    const [model, setModel] = useState(PHONE_RECEPTIONIST_TEMPLATE.model);
    const [calendar, setCalendar] = useState(PHONE_RECEPTIONIST_TEMPLATE.calendar);
    const [calendarApiKey, setCalendarApiKey] = useState(PHONE_RECEPTIONIST_TEMPLATE.calCom.apiKey);
    const [eventId, setEventId] = useState(PHONE_RECEPTIONIST_TEMPLATE.calCom.eventId);
    const [businessName, setBusinessName] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.name);
    const [timezone, setTimezone] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.timezone);
    const [businessHours, setBusinessHours] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.businessHours);
    const [description, setDescription] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.description);
    const [website, setWebsite] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.website);
    const [location, setLocation] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.location);
    const [phoneNumber, setPhoneNumber] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.phoneNumber);
    const [services, setServices] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.services);
    const [insuranceAccepted, setInsuranceAccepted] = useState(PHONE_RECEPTIONIST_TEMPLATE.businessInfo.insuranceAccepted);
    const [ambientSound, setAmbientSound] = useState(PHONE_RECEPTIONIST_TEMPLATE.ambientSound);
    const [boostedKeywords, setBoostedKeywords] = useState(PHONE_RECEPTIONIST_TEMPLATE.boostedKeywords);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth && auth.user && auth.workspace) {
            setLoading(false);
        }
    }, [auth]);

    const initReceptionist = async () => {

        let agentId = uuidv4();

        // Update business info
        let businessInfo = PHONE_RECEPTIONIST_TEMPLATE.businessInfo;
        businessInfo.name = businessName || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.name;
        businessInfo.timezone = timezone || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.timezone;
        businessInfo.location = location || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.location;
        businessInfo.phoneNumber = phoneNumber || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.phoneNumber;
        businessInfo.services = services || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.services;
        businessInfo.insuranceAccepted = insuranceAccepted || PHONE_RECEPTIONIST_TEMPLATE.businessInfo.insuranceAccepted;

        // Update cal.com info
        let calCom = PHONE_RECEPTIONIST_TEMPLATE.calCom;
        calCom.apiKey = calendarApiKey;
        calCom.eventId = eventId;

        let _agent = {
            id: agentId,
            retellAgentCode: agentId,
            template: 'phone-receptionist',
            name: agentName,
            agentName: agentName,
            voiceId: voiceId,
            language: language,
            model: model,
            includeDisclaimer: PHONE_RECEPTIONIST_TEMPLATE.includeDisclaimer,
            businessInfo: businessInfo,
            ambientSound: ambientSound,
            boostedKeywords: boostedKeywords,
            calendar: calendar,
            calCom: {
                apiKey: calendarApiKey ? calendarApiKey : PHONE_RECEPTIONIST_TEMPLATE.calCom.apiKey,
                eventId: eventId ? eventId : PHONE_RECEPTIONIST_TEMPLATE.calCom.eventId,
            },
            faq: [],
            phoneNumber: phoneNumber || null,
            workspaceId: auth.workspace.id,
            createdBy: auth.user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        // console.log(_agent);

        let res = await dbCreateAgent(_agent);

        if (res) {
            let retellRes = await createReceptionist(_agent);
            if (retellRes) {
                toast.success('Receptionist created');
                onInitReceptionist(_agent);
            } else {
                toast.error('Error creating receptionist');
            }
        } else {
            toast.error('Error creating agent');
        }
    }

    return (
       <div>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button>Build your receptionist</Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Title>Build your receptionist</Dialog.Title>
                    <VisuallyHidden>
                        <Dialog.Description>
                            Create a new AI receptionist to handle your phone calls.
                        </Dialog.Description>
                    </VisuallyHidden>

                    {/* Progress indicator */}
                    <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
                        <Text size="2" color={step >= 1 ? 'blue' : 'gray'} weight={step === 1 ? 'bold' : 'regular'}>1. Name & Voice</Text>
                        <Text size="2" color="gray" style={{margin: '0 10px'}}>→</Text>
                        <Text size="2" color={step >= 2 ? 'blue' : 'gray'} weight={step === 2 ? 'bold' : 'regular'}>2. Business Info</Text>
                        <Text size="2" color="gray" style={{margin: '0 10px'}}>→</Text>
                        <Text size="2" color={step >= 3 ? 'blue' : 'gray'} weight={step === 3 ? 'bold' : 'regular'}>3. Calendar Key</Text>
                    </Row>

                    {loading && (
                        <div style={{ height: '400px', overflowY: 'auto', marginBottom: '20px', padding: '10px' }}>
                            <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '100%' }}>
                                <Spinner size="2" />
                            </Row>
                        </div>
                    )}

                    {!loading && (
                    <div style={{ height: '400px', overflowY: 'auto', marginBottom: '20px', padding: '10px' }}>

                    {/* Step 1: Name and Voice */}
                    {step === 1 && (
                        <>
                            <Text size="3" weight="bold" as="div">Step 1: Name & Voice</Text>
                            <Text size="2" as="div" color="gray">Set up how your receptionist will sound and communicate.</Text>
                            
                            {/* Name */}
                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Name</Text>
                            <Text size="1" as='div' color='gray'>The name of your receptionist.</Text>
                            <TextField.Root variant="surface" placeholder="John Doe" value={agentName} onChange={(e) => setAgentName(e.target.value)} />

                            {/* Voice */}
                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Voice</Text>
                            <Text size="1" as='div' color='gray'>The voice of your receptionist.</Text>
                            <Select.Root value={voiceId} onValueChange={(value) => setVoiceId(value)}>
                                <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
                                <Select.Content>
                                    {VOICES.map((option, index) => (
                                        <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            {/* Language */}
                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Language</Text>
                            <Text size="1" as='div' color='gray'>The language of your receptionist.</Text>
                            <Select.Root value={language} onValueChange={(value) => setLanguage(value)}>
                                <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
                                <Select.Content>
                                    {LANGUAGES.map((option, index) => (
                                        <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                            
                        </>
                    )}

                    {/* Step 2: Business Info */}
                    {step === 2 && (
                        <>
                            <Text size="3" weight="bold" as="div">Step 2: Business Information</Text>
                            <Text size="2" as="div" color="gray">Tell us about your business.</Text>

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Clinic Name</Text>
                            <TextField.Root variant="surface" placeholder="My Great Clinic" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Website</Text>
                            <TextField.Root variant="surface" type="url" placeholder="https://www.yourclinic.com" value={website} onChange={(e) => setWebsite(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Timezone</Text>
                            <Select.Root value={timezone} onValueChange={(value) => setTimezone(value)}>
                                <Select.Trigger variant="surface" color="gray" placeholder="Select timezone" />
                                <Select.Content>
                                    {TIMEZONE_OFFSETS.map((option, index) => (
                                        <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Location</Text>
                            <TextField.Root variant="surface" placeholder="123 Main St, Anytown, USA" value={location} onChange={(e) => setLocation(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Phone Number</Text>
                            <TextField.Root variant="surface" type="tel" placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Description</Text>
                            <Text size="1" as='div' color='gray'>A short description of your business.</Text>
                            <TextArea variant="surface" placeholder="My Great Clinic is a great clinic that provides great services to great people." rows={4} value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Services</Text>
                            <Text size="1" as='div' color='gray'>A list of services your business offers.</Text>
                            <TextArea variant="surface" placeholder="I offer great services to great people." rows={4} value={services} maxLength={1000} onChange={(e) => setServices(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Insurance Accepted</Text>
                            <Text size="1" as='div' color='gray'>A list of insurance plans your business accepts.</Text>
                            <TextArea variant="surface" placeholder="I accept all insurance plans." rows={4} value={insuranceAccepted} maxLength={1000} onChange={(e) => setInsuranceAccepted(e.target.value)} />

                        </>
                    )}

                    {/* Step 3: Calendar */}
                    {step === 3 && (
                        <>
                            <Text size="3" weight="bold" as="div">Step 3: Cal.com Integration</Text>
                            <Text size="2" as="div" color="gray">Enter your API key and event ID.</Text>

                            <Text size="2" as='div' color='gray' style={{marginTop: 10}}>1. Go to your Cal.com dashboard and click on "Settings" → "API Keys"</Text>
                            <Text size="2" as='div' color='gray'>2. Click "Create new API key" and copy the generated key</Text>
                            <Text size="2" as='div' color='gray'>3. To find your Event Type ID, go to "Event Types" and click on the event you want to use</Text>
                            <Text size="2" as='div' color='gray'>4. The ID is the number at the end of the URL (e.g. cal.com/event-types/123)</Text>

                            {/* <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Calendar Platform</Text>
                            <Select.Root value={calendar} onValueChange={(value) => setCalendar(value)}>
                                <Select.Trigger variant="surface" color="gray" placeholder="Select a calendar" />
                                <Select.Content>
                                    {CALENDARS.map((option, index) => (
                                        <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root> */}

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>API Key</Text>
                            <TextField.Root variant="surface" placeholder="Enter your cal.com API key" value={calendarApiKey} onChange={(e) => setCalendarApiKey(e.target.value)} />

                            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Event ID</Text>
                            <TextField.Root variant="surface" type="number" placeholder="Enter your cal.com event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
                        </>
                    )}

                    </div>
                    )}

                    {/* Navigation buttons */}
                    <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40, marginBottom: 0 }}>
                        <Button variant="soft" color="gray" onClick={() => step > 1 ? setStep(step - 1) : null} disabled={step === 1}>
                            Back
                        </Button>
                        {loading ? (
                            <div></div>
                        ) : (
                            <Button variant="solid" onClick={() => step < 3 ? setStep(step + 1) : initReceptionist()}>
                                {step === 3 ? 'Create Receptionist' : 'Next'}
                            </Button>
                        )}
                    </Row>
                </Dialog.Content>
            </Dialog.Root>
       </div>
    );
}
