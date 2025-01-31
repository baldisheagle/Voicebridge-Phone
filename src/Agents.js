import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Row, Col } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Text, Button, DropdownMenu, Card, AlertDialog, Dialog, TextField, Select } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { UserCircleCheck, Plus, Pencil, Trash } from '@phosphor-icons/react';
import { dbGetAgents, dbGetPhoneNumbers, dbCreateAgent } from './utilities/database.js';
import { formatPhoneNumber } from './helpers/string.js';
import { DEFAULT_AGENT_NAME, DEFAULT_INCLUDE_DISCLAIMER, DEFAULT_VOICE_ID, DEFAULT_LANGUAGE, DEFAULT_MODEL, DEFAULT_BUSINESS_NAME, VOICES, LANGUAGES, MODELS, DEFAULT_TIMEZONE, BUSINESS_HOURS } from './config/retellagents.js';
import { v4 as uuidv4 } from 'uuid';

export default function Agents() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  // New inbound receptionist dialog
  const [newInboundReceptionistName, setNewInboundReceptionistName] = useState('Phone Receptionist');
  const [newInboundReceptionistAgentName, setNewInboundReceptionistAgentName] = useState(DEFAULT_AGENT_NAME);
  const [newInboundReceptionistBusinessInfo, setNewInboundReceptionistBusinessInfo] = useState({});
  const [newInboundReceptionistIncludeDisclaimer, setNewInboundReceptionistIncludeDisclaimer] = useState(DEFAULT_INCLUDE_DISCLAIMER);
  const [newInboundReceptionistVoiceId, setNewInboundReceptionistVoiceId] = useState(DEFAULT_VOICE_ID);
  const [newInboundReceptionistLanguage, setNewInboundReceptionistLanguage] = useState(DEFAULT_LANGUAGE);
  const [newInboundReceptionistModel, setNewInboundReceptionistModel] = useState(DEFAULT_MODEL);
  const [newInboundReceptionistPhoneNumber, setNewInboundReceptionistPhoneNumber] = useState(null);
  const [newInboundReceptionistBusinessName, setNewInboundReceptionistBusinessName] = useState(DEFAULT_BUSINESS_NAME);
  const [openNewInboundReceptionist, setOpenNewInboundReceptionist] = useState(false);
  
  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();

    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    dbGetAgents(auth.workspace.id).then((agents) => {
      setAgents(agents);
    });
    dbGetPhoneNumbers(auth.workspace.id).then((phoneNumbers) => {
      setPhoneNumbers(phoneNumbers);
    });
    setLoading(false);
  }

  const createInboundReceptionist = async (newInboundReceptionist) => {

    // If a phone number is selected, make sure it is not already in use by another agent
    if (newInboundReceptionist.phoneNumber) {
      if (agents.some(agent => agent.phoneNumber === newInboundReceptionist.phoneNumber)) {
        toast.error('Phone number already in use by another agent');
        return;
      }
    }

    setLoading(true);

    // Create an agent in database
    let agentId = uuidv4();
    let _agent = {
      id: agentId,
      name: newInboundReceptionistName,
      agentName: newInboundReceptionistAgentName,
      voiceId: newInboundReceptionistVoiceId,
      language: newInboundReceptionistLanguage,
      model: newInboundReceptionistModel,
      businessInfo: {
        name: newInboundReceptionistBusinessName,
        timezone: parseInt(DEFAULT_TIMEZONE),
        businessHours: BUSINESS_HOURS,
        description: '',
        website: '',
        location: '',
        phoneNumber: '',
      },
      phoneNumber: newInboundReceptionistPhoneNumber,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let res = await dbCreateAgent(_agent);
    if (res) {
      // Create an agent on Retell
      // await createRetellAgent(_agent);
      toast.success('Agent created');
      navigate(`/agent/${agentId}`);
    } else {
      toast.error('Error creating agent');
    }

    setLoading(false);

  }

  const createRetellAgent = async(agent) => {
    console.log('Creating Retell Agent');
    let res = await fetch('http://127.0.0.1:5001/voicebridge-app/us-central1/createRetellAgent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        agentId: agent.id,
        agentName: agent.agentName, 
        businessName: agent.businessName, 
        businessInfo: agent.businessInfo, 
        model: agent.model,
        voiceId: agent.voiceId,
        language: agent.language
      })
    });
    let data = await res.json();
    console.log('Retell Agent created', data);
    return data;
  }

  const deleteAgent = async (agentId) => {
    // dbDeleteAgent(auth.workspace.id, agentId);
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>

      <Heading size='4'>Agents</Heading>

      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10 }}>
          <Text size="1" color='gray'>{agents.length} agents</Text>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10, textAlign: 'right' }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid"><Plus /> Create new</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => setOpenNewInboundReceptionist(true)}><UserCircleCheck /> Phone Receptionist</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Col>
      </Row>


      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {/* Agents */}
        {agents.length > 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
            {agents.map((agent, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4}>
                <Card>
                  <Row style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: 160 }}>
                    <div style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/agent/${agent.id}`)}>
                      <UserCircleCheck size={26} color='gray' />
                      <Text size="3" as="div" weight="bold" style={{ marginTop: 10 }}>{agent.name}</Text>
                      <Text size="2" as="div" color='gray' style={{ marginTop: 0 }}>{agent.agentName ? agent.agentName : 'No agent name'}</Text>
                      <Text size="2" as="div" color='gray' style={{ marginTop: 0 }}>{agent.phoneNumber && phoneNumbers.find(p => p.id === agent.phoneNumber) ? formatPhoneNumber(phoneNumbers.find(p => p.id === agent.phoneNumber).number) : 'No phone number'}</Text>
                    </div>
                    <div style={{ width: '100%' }}>
                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, width: '100%' }}>
                        {/* Edit agent */}
                        <Button variant="ghost" size="3" color="gray" onClick={() => navigate(`/agent/${agent.id}`)}><Pencil /></Button>

                        {/* Delete agent */}
                        <AlertDialog.Root>
                          <AlertDialog.Trigger>
                            <Button variant="ghost" size="3" color="red"><Trash /></Button>
                          </AlertDialog.Trigger>
                          <AlertDialog.Content maxWidth="450px">
                            <AlertDialog.Title>Delete "{agent.name}"?</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              Are you sure you want to delete this agent?
                            </AlertDialog.Description>

                            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                              <AlertDialog.Cancel>
                                <Button variant="solid" color="gray">
                                  Cancel
                                </Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action>
                                <Button variant="solid" color="red" onClick={() => deleteAgent(agent.id)}>
                                  Delete
                                </Button>
                              </AlertDialog.Action>
                            </Row>
                          </AlertDialog.Content>
                        </AlertDialog.Root>
                      </Row>
                    </div>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* New agent dialog modal */}
        <Dialog.Root open={openNewInboundReceptionist} onOpenChange={setOpenNewInboundReceptionist}>
          <Dialog.Content>
            <Dialog.Title style={{ marginTop: 0 }}>Create new phone receptionist</Dialog.Title>
            <Dialog.Description size="2" color="gray" style={{ marginTop: 0 }}>
              Create a new phone receptionist to start receiving calls.
            </Dialog.Description>
            
            <Text size="1" as="div" color="gray" style={{ marginTop: 0 }}>Name</Text>
            <TextField.Root variant="surface" placeholder="John Doe" value={newInboundReceptionistName} onChange={(e) => setNewInboundReceptionistName(e.target.value)} />

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Receptionist name</Text>
            <TextField.Root variant="surface" placeholder="John Doe" value={newInboundReceptionistAgentName} onChange={(e) => setNewInboundReceptionistAgentName(e.target.value)} />

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Voice</Text>
            <Select.Root value={newInboundReceptionistVoiceId} onValueChange={(value) => setNewInboundReceptionistVoiceId(value)}>
              <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
              <Select.Content>
                {VOICES.map((option) => (
                  <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Language</Text>
            <Select.Root value={newInboundReceptionistLanguage} onValueChange={(value) => setNewInboundReceptionistLanguage(value)}>
              <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
              <Select.Content>
                {LANGUAGES.map((option) => (
                  <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Model</Text>
            <Select.Root value={newInboundReceptionistModel} onValueChange={(value) => setNewInboundReceptionistModel(value)}>
              <Select.Trigger variant="surface" color="gray" placeholder="Select a model" />
              <Select.Content>
                {MODELS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Business name</Text>
            <TextField.Root variant="surface" placeholder="Doctor Smith's Clinic" value={newInboundReceptionistBusinessName} onChange={(e) => setNewInboundReceptionistBusinessName(e.target.value)} />

            <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Phone number</Text>
            <Select.Root value={newInboundReceptionistPhoneNumber} onValueChange={(value) => setNewInboundReceptionistPhoneNumber(value)}>
              <Select.Trigger variant="surface" color="gray" placeholder="Select a number" />
              <Select.Content>
                {phoneNumbers.map((option) => (
                  <Select.Item key={option.id} value={option.id}>{formatPhoneNumber(option.number)}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* TODO: Add form for creating a new inbound receptionist */}
            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
              <Button variant="solid" color="gray" onClick={() => setOpenNewInboundReceptionist(false)}>Cancel</Button>
              <Button variant="solid" onClick={() => {
                createInboundReceptionist(auth.workspace.id);
                setOpenNewInboundReceptionist(false);
              }} disabled={!newInboundReceptionistName || !newInboundReceptionistAgentName || !newInboundReceptionistVoiceId || !newInboundReceptionistLanguage || !newInboundReceptionistModel || !newInboundReceptionistBusinessName}>Create</Button>
            </Row>
          </Dialog.Content>
        </Dialog.Root>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

