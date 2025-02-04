import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Select, Spinner, Text, TextField, Button, Switch } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { LANGUAGES, VOICES } from '../../config/retelltemplates.js';
import { formatPhoneNumber } from '../../helpers/string.js';
import { dbUpdateAgent, dbGetPhoneNumbers, dbGetAgents } from '../../utilities/database.js';
import { connectRetellPhoneNumberToAgent, updateRetellLlmAndAgent } from '../../utilities/retell.js';

export default function CallSettings({ agent }) {

  const auth = useRequireAuth();

  const [language, setLanguage] = useState(agent.language);
  const [agentName, setAgentName] = useState(agent.agentName);
  const [voiceId, setVoiceId] = useState(agent.voiceId);
  const [includeDisclaimer, setIncludeDisclaimer] = useState(agent.includeDisclaimer);
  const [agentPhoneNumber, setAgentPhoneNumber] = useState(agent.phoneNumber);
  const [calEventTypeId, setCalEventTypeId] = useState(agent.calCom ? agent.calCom.eventId : null);
  const [calApiKey, setCalApiKey] = useState(agent.calCom ? agent.calCom.apiKey : null);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    await dbGetPhoneNumbers(auth.workspace.id).then((p) => {
      setPhoneNumbers(p);
    });
    await dbGetAgents(auth.workspace.id).then((a) => {
      setAgents(a);
    });
    setLoading(false);
  }

  const saveCallSettings = async () => {

    // If the number if not null, make sure the phone number is not connected to another agent that is not this one
    if (agentPhoneNumber) {
      let a = agents.find(a => a.phoneNumber === agentPhoneNumber && a.id !== agent.id);
      if (a) {
        toast.error('This phone number is already connected to another agent');
        return;
      }
    }

    let _agent = {
      ...agent,
      language: language,
      agentName: agentName,
      voiceId: voiceId,
      phoneNumber: agentPhoneNumber,
      includeDisclaimer: includeDisclaimer,
      calCom: {
        eventId: calEventTypeId ? parseInt(calEventTypeId) : null,
        apiKey: calApiKey ? calApiKey : null
      }
    }

    try {

      // console.log('Updating agent', _agent);

      let res = await dbUpdateAgent(_agent);

      if (res) {
        // Link phone number to agent, if not null
        if (agentPhoneNumber) {
          let phoneNumber = phoneNumbers.find(p => p.id === agentPhoneNumber);
          if (phoneNumber) {
            // Connect phone number to agent
            // console.log('Connecting phone number to agent', phoneNumber.number, agent.retellAgentId);
            await connectRetellPhoneNumberToAgent(agent.retellAgentId, phoneNumber.number);
          }
        }
        // Update Retell LLM and Agent
        await updateRetellLlmAndAgent(_agent);
        toast.success('Call settings updated');

      } else {
        toast.error('Error updating call settings');
      }

    } catch (error) {
      toast.error('Error updating call settings');
    }
  }

  if (!auth || !auth.user || !auth.workspace || loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh' }}>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
          <Spinner size="2" />
        </Row>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>

      {/* Phone number */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Phone number</Text>
          <Text size="1" as='div' color='gray'>The phone number of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Text size="4" weight="medium">{}</Text>
          <Select.Root value={agentPhoneNumber} onValueChange={(value) => setAgentPhoneNumber(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a phone number" />
            <Select.Content>
              <Select.Item value={null}>No number</Select.Item>
              {phoneNumbers.map((phoneNumber) => (
                <Select.Item key={phoneNumber.id} value={phoneNumber.id}>{formatPhoneNumber(phoneNumber.number, 'US')}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Agent's name */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Name</Text>
          <Text size="1" as='div' color='gray'>The name of your agent.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="John Doe" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
        </Col>
      </Row>

      {/* Agent's voice */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Voice</Text>
          <Text size="1" as='div' color='gray'>The voice of your agent.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={voiceId} onValueChange={(value) => setVoiceId(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
            <Select.Content>
              {VOICES.map((option, index) => (
                <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Language */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Language</Text>
          <Text size="1" as='div' color='gray'>The language of your agent.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={language} onValueChange={(value) => setLanguage(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
            <Select.Content>
              {LANGUAGES.map((option, index) => (
                <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Include emergency disclaimer */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Make emergency disclaimer</Text>
          <Text size="1" as='div' color='gray'>At the start of every call, the receptionist announces an emergency disclaimer to hangup and call 911 if the caller is in an emergency.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Switch variant="outline" size="2" checked={includeDisclaimer} onCheckedChange={(checked) => setIncludeDisclaimer(checked)} />
        </Col>
      </Row>

      {/* Save button */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveCallSettings}>Save changes</Button>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

