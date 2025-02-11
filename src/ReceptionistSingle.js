import React, { useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Heading, Spinner, TabNav, Button, Text, Separator } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import BusinessInfo from './components/receptionist/BusinessInfo.js';
import General from './components/receptionist/General.js';
import Calendar from './components/receptionist/Calendar.js';
import FAQ from './components/receptionist/FAQ.js';
import Notifications from './components/receptionist/Notifications.js';
import Admin from './components/receptionist/Admin.js';
import { dbGetAgents } from './utilities/database.js';
import NewReceptionist from './components/receptionist/NewReceptionist.js';

export default function Receptionist() {

  const auth = useRequireAuth();

  const [activeTab, setActiveTab] = useState('general');
  const [receptionist, setReceptionist] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const onInitReceptionist = async (agent) => {
    if (agent) {
      setReceptionist(agent);
    }
  }

  const onDeleteReceptionist = async () => {
    setReceptionist(null);
  }

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh' }}>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
          <Spinner size="2" />
        </Row>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingRight: 0, paddingBottom: 10 }}>

      <Heading size='4'>Receptionist</Heading>

      {!receptionist && (
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20, height: '50vh', backgroundColor: 'var(--accent-3)' }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10, textAlign: 'center' }}>
            <NewReceptionist onInitReceptionist={onInitReceptionist} />
          </Col>
        </Row>
      )}

      {receptionist && (  
        <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

          <Heading size='3' as='div' style={{ marginTop: 10, color: 'var(--gray-11)' }}>Phone & Voice</Heading>
          <Separator style={{ width: '100%' }} />

          <General agent={receptionist} />

          <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Business Info</Heading>
          <Separator style={{ width: '100%' }} />

          <BusinessInfo agent={receptionist} />

          <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Frequently Asked Questions</Heading>
          <Separator style={{ width: '100%' }} />

          <FAQ agent={receptionist} />

          <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Calendar</Heading>
          <Separator style={{ width: '100%' }} />

          <Calendar agent={receptionist} />

          <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Notifications</Heading>
          <Separator style={{ width: '100%' }} />

          <Notifications agent={receptionist} />

          <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Admin</Heading>
          <Separator style={{ width: '100%' }} />

          <Admin agent={receptionist} onDeleteReceptionist={onDeleteReceptionist} />

        </div>
      )}

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

