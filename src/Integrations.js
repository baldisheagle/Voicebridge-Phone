import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, TabNav } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Calendars from './components/integrations/Calendars.js';
import PhoneNumbers from './components/integrations/PhoneNumbers.js';

export default function Integrations() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('phoneNumbers');
  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);

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

      <Heading size='4'>Integrations</Heading>

      <div style={{ width: '100%', marginTop: 10 }}>
        <TabNav.Root>
          {/* <TabNav.Link href='#' active={activeTab === 'calendars'} onClick={() => setActiveTab('calendars')}>
            Calendars
          </TabNav.Link> */}
          <TabNav.Link href='#' active={activeTab === 'phoneNumbers'} onClick={() => setActiveTab('phoneNumbers')}>
            Phone Numbers
          </TabNav.Link>
        </TabNav.Root>
      </div>


      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

        {activeTab === 'calendars' && (
          <Calendars />
        )}

        {activeTab === 'phoneNumbers' && (
          <PhoneNumbers />
        )} 

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

