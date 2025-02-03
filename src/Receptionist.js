import React, { useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Row } from 'react-bootstrap';
import { Heading, Spinner, TabNav, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import BusinessInfo from './components/receptionist/BusinessInfo.js';
import Settings from './components/receptionist/Settings.js';
import Calendar from './components/receptionist/Calendar.js';
import FAQ from './components/receptionist/FAQ.js';
import { dbGetAgents } from './utilities/database.js';

export default function Receptionist() {

  const auth = useRequireAuth();

  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);

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
      setAgent(agents[0]);
    } else {
      toast.error('Agents not found');
    }
    setLoading(false);
  }

  if (!auth || !auth.user || !auth.workspace || !agent || loading) {
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

      <div style={{ width: '100%', marginTop: 10 }}>
          <TabNav.Root>
            <TabNav.Link href="#" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              Settings
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

            {/* <TabNav.Link href="#" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>
              Questions
            </TabNav.Link> */}

            {/* <TabNav.Link href="#" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>
              Skills
            </TabNav.Link> */}

          </TabNav.Root>
        </div>


      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {activeTab === 'settings' && (    
          <Settings agent={agent} />
        )}

        {activeTab === 'businessInfo' && (
          <BusinessInfo agent={agent} />
        )}

        {activeTab === 'calendar' && (
          <Calendar agent={agent} />
        )}

        {activeTab === 'faq' && (
          <FAQ agent={agent} />
        )}

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

