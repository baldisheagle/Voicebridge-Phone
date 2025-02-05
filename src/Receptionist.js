import React, { useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Row } from 'react-bootstrap';
import { Heading, Spinner, TabNav, Button } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import BusinessInfo from './components/receptionist/BusinessInfo.js';
import General from './components/receptionist/General.js';
import Calendar from './components/receptionist/Calendar.js';
import FAQ from './components/receptionist/FAQ.js';
import { dbCreateAgent, dbGetAgents } from './utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import { PHONE_RECEPTIONIST_TEMPLATE } from './config/agents.js';
import { createReceptionist } from './utilities/receptionist.js';

export default function Receptionist() {

  const auth = useRequireAuth();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [receptionist, setReceptionist] = useState(null);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();

    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    let agents = await dbGetAgents(auth.workspace.id);
    if (agents && agents.length > 0) {
      setReceptionist(agents[0]);
    }
    setLoading(false);
  }

  const initReceptionist = async () => {

    let agentId = uuidv4();
    let retellAgentCode = uuidv4();
    
    let _agent = {
      id: agentId,
      retellAgentCode: retellAgentCode,
      template: 'phone-receptionist',
      name: 'Testing',
      icon: PHONE_RECEPTIONIST_TEMPLATE.icon,
      agentName: PHONE_RECEPTIONIST_TEMPLATE.name,
      voiceId: PHONE_RECEPTIONIST_TEMPLATE.voiceId,
      language: PHONE_RECEPTIONIST_TEMPLATE.language,
      model: PHONE_RECEPTIONIST_TEMPLATE.model,
      includeDisclaimer: PHONE_RECEPTIONIST_TEMPLATE.includeDisclaimer,
      businessInfo: PHONE_RECEPTIONIST_TEMPLATE.businessInfo,
      calCom: PHONE_RECEPTIONIST_TEMPLATE.calCom,
      faq: [],
      phoneNumber: null,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let res = await dbCreateAgent(_agent);

    if (res) {
      let retellRes = await createReceptionist(_agent);
      if (retellRes) {
        toast.success('Receptionist created');
        setReceptionist(_agent);
      } else {
        toast.error('Error creating receptionist');
      }
    } else {
      toast.error('Error creating agent');
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>

      <Heading size='4'>Receptionist</Heading>

      {!receptionist && (
        <div style={{ width: '100%', marginTop: 10 }}>
          <Button onClick={() => initReceptionist()}>Create your receptionist</Button>
        </div>
      )}

      {receptionist && (
        <div style={{ width: '100%', marginTop: 10 }}>
          <TabNav.Root>
            <TabNav.Link href="#" active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
              General
            </TabNav.Link>

            <TabNav.Link href="#" active={activeTab === 'businessInfo'} onClick={() => setActiveTab('businessInfo')}>
              Business Info
            </TabNav.Link>

            <TabNav.Link href="#" active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
              FAQ
            </TabNav.Link>

            <TabNav.Link href="#" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>
              Calendar
            </TabNav.Link>

            {/* <TabNav.Link href="#" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
              Notifications
            </TabNav.Link> */}

            {/* <TabNav.Link href="#" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>
              Questions
            </TabNav.Link> */}

            {/* <TabNav.Link href="#" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>
              Skills
            </TabNav.Link> */}

          </TabNav.Root>
        </div>
      )}

      {receptionist && (  
        <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

        {activeTab === 'general' && (    
          <General agent={receptionist} />
        )}

        {activeTab === 'businessInfo' && (
          <BusinessInfo agent={receptionist} />
        )}

        {activeTab === 'calendar' && (
          <Calendar agent={receptionist} />
        )}

        {activeTab === 'faq' && (
          <FAQ agent={receptionist} />
        )}

        </div>
      )}

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

