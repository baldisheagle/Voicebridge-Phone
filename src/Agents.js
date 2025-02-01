import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Row, Col, Image } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Text, Button, DropdownMenu, Card, Dialog, TextField, Select, VisuallyHidden, IconButton } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { UserCircleCheck, Plus, Trash, DotsThreeVertical } from '@phosphor-icons/react';
import { dbGetAgents, dbGetPhoneNumbers, dbCreateAgent, dbDeleteAgent } from './utilities/database.js';
import { formatPhoneNumber } from './helpers/string.js';
import { BASIC_PHONE_RECEPTIONIST_TEMPLATE } from './config/retellagents.js';
import { v4 as uuidv4 } from 'uuid';
import { createRetellAgent, deleteRetellAgent } from './utilities/retell.js';

export default function Agents() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  // Agent template selection modal
  const [openAgentTemplate, setOpenAgentTemplate] = useState(false);
  const [agentTemplate, setAgentTemplate] = useState(null);
  
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

  const createAgentUsingTemplate = async(template) => {
    // console.log('Creating agent using template', template);
    switch (template) {
      
      case 'basic-phone-receptionist':
        
      setLoading(true);

        // Create an agent in database
        let agentId = uuidv4();
        let retellAgentCode = uuidv4();
        let _agent = {
          id: agentId,
          retellAgentCode: retellAgentCode,
          template: template,
          name: 'Basic Phone Receptionist',
          icon: BASIC_PHONE_RECEPTIONIST_TEMPLATE.icon,
          agentName: BASIC_PHONE_RECEPTIONIST_TEMPLATE.name,
          voiceId: BASIC_PHONE_RECEPTIONIST_TEMPLATE.voiceId,
          language: BASIC_PHONE_RECEPTIONIST_TEMPLATE.language,
          model: BASIC_PHONE_RECEPTIONIST_TEMPLATE.model,
          includeDisclaimer: BASIC_PHONE_RECEPTIONIST_TEMPLATE.includeDisclaimer,
          businessInfo: BASIC_PHONE_RECEPTIONIST_TEMPLATE.businessInfo,
          phoneNumber: null,
          workspaceId: auth.workspace.id,
          createdBy: auth.user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        let res = await dbCreateAgent(_agent);
        if (res) {
          // Create an agent on Retell
          let retellRes = await createRetellAgent(_agent);
          if (retellRes) {
            toast.success('Agent created');
            navigate(`/agent/${agentId}`);
          } else {
            // TODO: Delete the agent from the database
            toast.error('Error creating agent');
          }
        } else {
          toast.error('Error creating agent');
        }
    
        setLoading(false);

        break;
      default:
        console.error('Invalid agent template');
    }

  }

  const deleteAgent = async (agentId, retellLlmId, retellAgentId) => {
    
    setLoading(true);

    // Delete the agent on Retell
    await deleteRetellAgent(retellLlmId, retellAgentId);

    let res = await dbDeleteAgent(auth.workspace.id, agentId);
    if (res) {
      let _agents = agents.filter(agent => agent.id !== agentId);
      setAgents(_agents);
      toast.success('Agent deleted');
    } else {
      toast.error('Error deleting agent');
    }
    setLoading(false);
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
          <Button variant="solid" onClick={() => setOpenAgentTemplate(true)}><Plus /> Create new</Button>
        </Col>
      </Row>


      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {/* Agents */}
        {agents.length > 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
            {agents.map((agent, index) => (
              <Col key={index} xs={12} sm={6} md={6} lg={6}>
                <Card>
                  <Row style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: 180 }}>
                    <div style={{ width: '100%' }}>
                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
                        {agent.icon ? <Image src={agent.icon} alt="Agent icon" style={{ width: 36, height: 36 }} roundedCircle /> : <UserCircleCheck size={36} color='gray' />}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <IconButton variant="ghost" size="2">
                              <DotsThreeVertical />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
                            <DropdownMenu.Item color="red" onClick={() => deleteAgent(agent.id, agent.retellLlmId, agent.retellAgentId)}>
                              <Trash /> Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Row>

                      <Text size="3" as="div" weight="bold" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => navigate(`/agent/${agent.id}`)}>{agent.name}</Text>
                      <Text size="2" as="div" color='gray' style={{ marginTop: 5 }}>{agent.agentName ? agent.agentName : 'No agent name'}</Text>
                      <Text size="2" as="div" color='gray' style={{ marginTop: 5 }}>{agent.phoneNumber && phoneNumbers.find(p => p.id === agent.phoneNumber) ? formatPhoneNumber(phoneNumbers.find(p => p.id === agent.phoneNumber).number) : 'No phone number'}</Text>
                    </div>
                  </Row>
                  <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                    <Text size="1" as="div" color='gray' style={{ marginTop: 0 }}>{ agent.createdAt ? `Created at ${new Date(agent.createdAt).toLocaleString()}` : 'Created at'}</Text>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Agent template selection modal */}
        <Dialog.Root open={openAgentTemplate} onOpenChange={setOpenAgentTemplate}>
          <Dialog.Content>
            <Dialog.Title style={{ marginTop: 0 }}>Select a template</Dialog.Title>
            <VisuallyHidden>
              <Dialog.Description size="2" color="gray" style={{ marginTop: 0 }}>
                Select an agent template to create a new agent.
              </Dialog.Description>
            </VisuallyHidden>
            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
              <Col xs={12} sm={12} md={6} lg={6} xl={6} style={{ padding: 10 }}>
                <Card>
                  <Image src={BASIC_PHONE_RECEPTIONIST_TEMPLATE.icon} alt="Basic Phone Receptionist icon" style={{ width: 36, height: 36 }} roundedCircle />
                  <Text size="3" as="div" weight="bold" style={{ marginTop: 15 }}>Basic Phone Receptionist</Text>
                  <Text size="1" as="div" color="gray" style={{ marginTop: 5 }}>{BASIC_PHONE_RECEPTIONIST_TEMPLATE.description}</Text>
                  <Button variant="solid" style={{ marginTop: 20 }} onClick={() => {
                    createAgentUsingTemplate('basic-phone-receptionist');
                    setOpenAgentTemplate(false);
                  }}>Create</Button>
                </Card>
              </Col>
            </Row>
            <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
              <Button variant="solid" color="gray" onClick={() => setOpenAgentTemplate(false)}>Cancel</Button>

            </Row>
          </Dialog.Content>
        </Dialog.Root>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

// // New inbound receptionist dialog
// const [newInboundReceptionistName, setNewInboundReceptionistName] = useState('Phone Receptionist');
// const [newInboundReceptionistAgentName, setNewInboundReceptionistAgentName] = useState(DEFAULT_AGENT_NAME);
// const [newInboundReceptionistBusinessInfo, setNewInboundReceptionistBusinessInfo] = useState({});
// const [newInboundReceptionistIncludeDisclaimer, setNewInboundReceptionistIncludeDisclaimer] = useState(DEFAULT_INCLUDE_DISCLAIMER);
// const [newInboundReceptionistVoiceId, setNewInboundReceptionistVoiceId] = useState(DEFAULT_VOICE_ID);
// const [newInboundReceptionistLanguage, setNewInboundReceptionistLanguage] = useState(DEFAULT_LANGUAGE);
// const [newInboundReceptionistModel, setNewInboundReceptionistModel] = useState(DEFAULT_MODEL);
// const [newInboundReceptionistPhoneNumber, setNewInboundReceptionistPhoneNumber] = useState(null);
// const [newInboundReceptionistBusinessName, setNewInboundReceptionistBusinessName] = useState(DEFAULT_BUSINESS_NAME);
// const [openNewInboundReceptionist, setOpenNewInboundReceptionist] = useState(false);

// const createInboundReceptionist = async (newInboundReceptionist) => {

//   // If a phone number is selected, make sure it is not already in use by another agent
//   if (newInboundReceptionist.phoneNumber) {
//     if (agents.some(agent => agent.phoneNumber === newInboundReceptionist.phoneNumber)) {
//       toast.error('Phone number already in use by another agent');
//       return;
//     }
//   }

//   setLoading(true);

//   // Create an agent in database
//   let agentId = uuidv4();
//   let _agent = {
//     id: agentId,
//     name: newInboundReceptionistName,
//     agentName: newInboundReceptionistAgentName,
//     voiceId: newInboundReceptionistVoiceId,
//     language: newInboundReceptionistLanguage,
//     model: newInboundReceptionistModel,
//     businessInfo: {
//       name: newInboundReceptionistBusinessName,
//       timezone: parseInt(DEFAULT_TIMEZONE),
//       businessHours: BUSINESS_HOURS,
//       description: '',
//       website: '',
//       location: '',
//       phoneNumber: '',
//     },
//     phoneNumber: newInboundReceptionistPhoneNumber,
//     workspaceId: auth.workspace.id,
//     createdBy: auth.user.uid,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   }
//   let res = await dbCreateAgent(_agent);
//   if (res) {
//     // Create an agent on Retell
//     // await createRetellAgent(_agent);
//     toast.success('Agent created');
//     navigate(`/agent/${agentId}`);
//   } else {
//     toast.error('Error creating agent');
//   }

//   setLoading(false);

// }

// {/* New agent dialog modal */}
// <Dialog.Root open={openNewInboundReceptionist} onOpenChange={setOpenNewInboundReceptionist}>
//   <Dialog.Content>
//     <Dialog.Title style={{ marginTop: 0 }}>Create new phone receptionist</Dialog.Title>
//     <Dialog.Description size="2" color="gray" style={{ marginTop: 0 }}>
//       Create a new phone receptionist to start receiving calls.
//     </Dialog.Description>
    
//     <Text size="1" as="div" color="gray" style={{ marginTop: 0 }}>Name</Text>
//     <TextField.Root variant="surface" placeholder="John Doe" value={newInboundReceptionistName} onChange={(e) => setNewInboundReceptionistName(e.target.value)} />

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Receptionist name</Text>
//     <TextField.Root variant="surface" placeholder="John Doe" value={newInboundReceptionistAgentName} onChange={(e) => setNewInboundReceptionistAgentName(e.target.value)} />

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Voice</Text>
//     <Select.Root value={newInboundReceptionistVoiceId} onValueChange={(value) => setNewInboundReceptionistVoiceId(value)}>
//       <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
//       <Select.Content>
//         {VOICES.map((option) => (
//           <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//         ))}
//       </Select.Content>
//     </Select.Root>

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Language</Text>
//     <Select.Root value={newInboundReceptionistLanguage} onValueChange={(value) => setNewInboundReceptionistLanguage(value)}>
//       <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
//       <Select.Content>
//         {LANGUAGES.map((option) => (
//           <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//         ))}
//       </Select.Content>
//     </Select.Root>

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Model</Text>
//     <Select.Root value={newInboundReceptionistModel} onValueChange={(value) => setNewInboundReceptionistModel(value)}>
//       <Select.Trigger variant="surface" color="gray" placeholder="Select a model" />
//       <Select.Content>
//         {MODELS.map((option) => (
//           <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//         ))}
//       </Select.Content>
//     </Select.Root>

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Business name</Text>
//     <TextField.Root variant="surface" placeholder="Doctor Smith's Clinic" value={newInboundReceptionistBusinessName} onChange={(e) => setNewInboundReceptionistBusinessName(e.target.value)} />

//     <Text size="1" as="div" color="gray" style={{ marginTop: 20 }}>Phone number</Text>
//     <Select.Root value={newInboundReceptionistPhoneNumber} onValueChange={(value) => setNewInboundReceptionistPhoneNumber(value)}>
//       <Select.Trigger variant="surface" color="gray" placeholder="Select a number" />
//       <Select.Content>
//         {phoneNumbers.map((option) => (
//           <Select.Item key={option.id} value={option.id}>{formatPhoneNumber(option.number)}</Select.Item>
//         ))}
//       </Select.Content>
//     </Select.Root>

//     {/* TODO: Add form for creating a new inbound receptionist */}
//     <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
//       <Button variant="solid" color="gray" onClick={() => setOpenNewInboundReceptionist(false)}>Cancel</Button>
//       <Button variant="solid" onClick={() => {
//         createInboundReceptionist(auth.workspace.id);
//         setOpenNewInboundReceptionist(false);
//       }} disabled={!newInboundReceptionistName || !newInboundReceptionistAgentName || !newInboundReceptionistVoiceId || !newInboundReceptionistLanguage || !newInboundReceptionistModel || !newInboundReceptionistBusinessName}>Create</Button>
//     </Row>
//   </Dialog.Content>
// </Dialog.Root>