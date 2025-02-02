import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { Row, Col, Image } from 'react-bootstrap';
import { Button, Heading, Spinner, TabNav, TextField } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import BusinessInfo from './components/agent/BusinessInfo.js';
import Settings from './components/agent/Settings.js';
import FAQ from './components/agent/FAQ.js';
import CalCom from './components/agent/CalCom.js';
import { dbGetAgent, dbUpdateAgent } from './utilities/database.js';
import { ArrowLeft, Pencil, UserCircleCheck } from '@phosphor-icons/react';

export default function Agent() {

  const auth = useRequireAuth();
  const navigate = useNavigate();

  const { agentId } = useParams();

  const [agent, setAgent] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    let agent = await dbGetAgent(auth.workspace.id, agentId);
    if (agent) {
      setAgent(agent);
      setEditedName(agent.name);
    } else {
      toast.error('Agent not found');
      navigate('/agents');
    }

    setLoading(false);  
  }

  const saveAgentName = async () => {
    let _agent = {
      ...agent,
      name: editedName
    }
    await dbUpdateAgent(_agent);
    setEditingName(false);
  }

  if (!auth || !auth.user || !auth.workspace || !agentId || !agent || loading) {
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

      <Button size="1" variant="ghost" color="gray" onClick={() => navigate('/agents')} style={{ marginTop: 0 }}>
        <ArrowLeft size={12} weight="bold" color='gray' style={{ marginRight: 5 }} /> Back to all agents
      </Button>

      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 5 }}>
        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 0 }}>
          <div style={{ marginTop: 10 }}>
            { agent.icon ? (
              <Image src={agent.icon} alt="Agent icon" style={{ width: 36, height: 36 }} roundedCircle />
            ) : (
              <UserCircleCheck size={36} color='gray' />
            )}
          </div>
          {editingName ? (
            <TextField.Root 
              variant="surface" 
              placeholder="Jane Doe" 
              style={{ marginTop: 10, marginBottom: 20 }}
              value={editedName} 
              onFocus={(e) => e.target.select()}
              onBlur={() => saveAgentName()}
              maxLength={60}
              onChange={(e) => e.target.value.length > 0 ? setEditedName(e.target.value) : setEditedName('Untitled')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveAgentName();
                }
              }}
            />
          ) : (
            <Heading
              size='5'
              as="div"
              style={{ marginTop: 10, marginBottom: 10, cursor: 'pointer' }}
              onClick={() => {
                setEditingName(true);
                setEditedName(agent.name);
              }}
            >
              {editedName} <Pencil size={16} color='gray' style={{ marginLeft: 5 }} />
            </Heading>
          )}
        </Col>
      </Row>

      <div style={{ width: '100%', marginTop: 0 }}>
          <TabNav.Root>
            <TabNav.Link href="#" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              Settings
            </TabNav.Link>

            {agent.template === 'phone-receptionist-with-cal-com' && (
              <TabNav.Link href="#" active={activeTab === 'calcom'} onClick={() => setActiveTab('calcom')}>
                Cal.com
              </TabNav.Link>
            )}

            <TabNav.Link href="#" active={activeTab === 'businessInfo'} onClick={() => setActiveTab('businessInfo')}>
              Business Info
            </TabNav.Link>

            {/* <TabNav.Link href="#" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>
              Questions
            </TabNav.Link> */}

            {/* <TabNav.Link href="#" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>
              Skills
            </TabNav.Link> */}

            <TabNav.Link href="#" active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
              FAQ
            </TabNav.Link>

          </TabNav.Root>
        </div>


      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 300, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {activeTab === 'settings' && (    
          <Settings agent={agent} />
        )}

        {activeTab === 'businessInfo' && (
          <BusinessInfo agent={agent} />
        )}

        {activeTab === 'faq' && (
          <FAQ agent={agent} />
        )}

        {activeTab === 'calcom' && (
          <CalCom agent={agent} />
        )}

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

