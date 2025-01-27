import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, TabNav, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import BusinessProfile from './components/agent/BusinessProfile.js';
import CallSettings from './components/agent/CallSettings.js';
import Skills from './components/agent/Skills.js';
import FAQ from './components/agent/FAQ.js';
import Questions from './components/agent/Questions.js';
export default function Agent() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [activeTab, setActiveTab] = useState('callSettings');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user) {
      initialize();

    }
  }, [auth]);

  // Initialize
  const initialize = async () => {

  }

  if (!auth || !auth.user || loading) {
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

      <Heading size='4'>Agent</Heading>

      <div style={{ width: '100%', marginTop: 10 }}>
          <TabNav.Root>
            <TabNav.Link href="#" active={activeTab === 'callSettings'} onClick={() => setActiveTab('callSettings')}>
              Call Settings
            </TabNav.Link>
            <TabNav.Link href="#" active={activeTab === 'businessProfile'} onClick={() => setActiveTab('businessProfile')}>
              Business Profile
            </TabNav.Link>
            <TabNav.Link href="#" active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
              FAQ
            </TabNav.Link>
            <TabNav.Link href="#" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>
              Questions
            </TabNav.Link>
            <TabNav.Link href="#" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>
              Skills
            </TabNav.Link>
          </TabNav.Root>
        </div>


      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {/* Business Profile */}
        {activeTab === 'businessProfile' && (
          <BusinessProfile />
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <FAQ />
        )}

        {/* Call Settings */}
        {activeTab === 'callSettings' && (
          <CallSettings />
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <Skills />
        )}

        {/* Questions */}
        {activeTab === 'questions' && (
          <Questions />
        )}

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

