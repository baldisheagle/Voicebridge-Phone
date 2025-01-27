import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Select, Spinner, Text, TextField, Button, Switch, DropdownMenu } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { LANGUAGES, VOICES } from '../../config/lists.js';
import { formatPhoneNumber } from '../../helpers/string.js';
import { dbUpdateAgent, dbGetAgent } from '../../utilities/database.js';

export default function CallSettings() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [agent, setAgent] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [greeting, setGreeting] = useState('Hello, how can I help you?');
  const [agentName, setAgentName] = useState('Alex');
  const [agentVoice, setAgentVoice] = useState('female-american');
  const [disclaimers, setDisclaimers] = useState('If this is an emergency, hang up and dial 911.');
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState('alex@example.com');
  const [smsNotifications, setSmsNotifications] = useState('+14151234567');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    let _agent = await dbGetAgent(auth.workspace.id);
    if (_agent) {
      setAgent(_agent);
      setLanguage(_agent.language || LANGUAGES[0].id);
      setGreeting(_agent.greeting || 'Hello, how can I help you?');
      setAgentName(_agent.agentName || 'Alex');
      setAgentVoice(_agent.agentVoice || 'female-american');
      setDisclaimers(_agent.disclaimers || 'If this is an emergency, hang up and dial 911.');
      setBlockedNumbers(_agent.blockedNumbers || []);
      setEmailNotifications(_agent.emailNotifications || 'alex@example.com');
      setSmsNotifications(_agent.smsNotifications || '+14151234567');
    } else {
      setAgent(null);
      navigate('/calls');
    }
    setLoading(false);
  }

  const buyNewNumber = () => {
    // TODO: Connect new number using Twilio or Retell API
  }

  const connectExistingNumber = () => {
    // TODO: Connect existing number using Twilio or Retell API
  }

  const saveCallSettings = async () => {
    let _agent = {
      ...agent,
      language: language,
      greeting: greeting,
      agentName: agentName,
      agentVoice: agentVoice,
      disclaimers: disclaimers,
      blockedNumbers: blockedNumbers,
      emailNotifications: emailNotifications,
      smsNotifications: smsNotifications
    }

    let res = await dbUpdateAgent(_agent);
    if (res) {
      toast.success('Call settings updated');
    } else {
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
          <Text size="4" weight="medium">{auth.workspace.phoneNumber ? formatPhoneNumber(auth.workspace.phoneNumber, 'US') : 'No number connected'}</Text>
        </Col>
      </Row>

      {/* Agent's name */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Agent's name</Text>
          <Text size="1" as='div' color='gray'>The name of your agent.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="John Doe" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
        </Col>
      </Row>

      {/* Agent's voice */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Agent's voice</Text>
          <Text size="1" as='div' color='gray'>The voice of your agent.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={agentVoice} onValueChange={(value) => setAgentVoice(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
            <Select.Content>
              {VOICES.map((option) => (
                <Select.Item key={option.id} value={option.id}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Language */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Language</Text>
          <Text size="1" as='div' color='gray'>The language of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={language} onValueChange={(value) => setLanguage(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
            <Select.Content>
              {LANGUAGES.map((option) => (
                <Select.Item key={option.id} value={option.id}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Greeting */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Greeting</Text>
          <Text size="1" as='div' color='gray'>The greeting of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="Hello, how can I help you?" value={greeting} onChange={(e) => setGreeting(e.target.value)} />
        </Col>
      </Row>

      {/* Disclaimers */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Disclaimers</Text>
          <Text size="1" as='div' color='gray'>The disclaimers of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="If this is an emergency, hang up and dial 911." value={disclaimers} onChange={(e) => setDisclaimers(e.target.value)} />
        </Col>
      </Row>

      {/* Blocked numbers */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Blocked numbers</Text>
          <Text size="1" as='div' color='gray'>Enter a comma-separated list of numbers to block.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="123-456-7890" value={blockedNumbers} onChange={(e) => setBlockedNumbers(e.target.value)} />
        </Col>
      </Row>

      {/* Email notifications */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Email notifications</Text>
          <Text size="1" as='div' color='gray'>The email address to send notifications to.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="john@example.com" value={emailNotifications} onChange={(e) => setEmailNotifications(e.target.value)} />
        </Col>
      </Row>

      {/* SMS notifications */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">SMS notifications</Text>
          <Text size="1" as='div' color='gray'>The phone number to send SMS notifications to.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="+1 415-456-7890" value={smsNotifications} onChange={(e) => setSmsNotifications(e.target.value)} />
        </Col>
      </Row>

      {/* TODO: Buy or connect new number */}
      {/* <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col>
          <Text size="2" weight="medium">
            {phoneNumbers.length === 0 ? "No phone numbers" : `${phoneNumbers.length} phone numbers`}
          </Text>
        </Col>
        <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid" size="2"><Plus /> New number</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => buyNewNumber()}>Buy new number</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => connectExistingNumber()}>Connect existing number</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Col>
      </Row> */}

      {/* <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        {phoneNumbers.map((phoneNumber, index) => (
          <Col key={index} xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 10 }}>
            <Card variant="surface" style={{ height: 200 }}>
              <Row style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: '100%' }}>
                <div>
                  <Text size='2' weight='medium'>{phoneNumber.name}</Text>
                  <Text size="4" color="var(--accent-9)" as='div' style={{ marginTop: 5 }}>{formatPhoneNumber(phoneNumber.phoneNumber, 'US')}</Text>
                </div>
                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
                { phoneNumber.type === 'default' ? null : (
                  <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button variant="ghost" size="3" color="red"><Trash /></Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Delete {phoneNumber.name}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Are you sure you want to delete this phone number?
                      </AlertDialog.Description>
                    </AlertDialog.Content>
                    </AlertDialog.Root>
                  )}
                </div>
              </Row>
            </Card>
          </Col>
        ))}
      </Row> */}

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

