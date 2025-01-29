import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Text, Card } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCalls } from './utilities/database.js';

export default function Dashboard() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');
    
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(true);
    const calls = await dbGetCalls(auth.workspace.id);
    if (calls) {
      setCalls(calls);
    }
    setLoading(false);
  }

  const inviteNewMember = () => {
    // TODO: Invite new member
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
      
      <Heading size='4'>Dashboard</Heading>
      
      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>  

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }}>
          <Col xs={6} sm={6} md={4} lg={4} style={{ padding: 10 }}>
            <Card>
              <Text size="2" weight="bold" as="div" style={{ color: 'var(--gray-11)' }}>Total Calls</Text>
              <Text size="6" weight="bold" as="div" style={{ color: 'var(--gray-12)', marginTop: 5 }}>
                {calls.length}
              </Text>
            </Card>
          </Col>

          <Col xs={6} sm={6} md={4} lg={4} style={{ padding: 10 }}>
            <Card>
              <Text size="2" weight="bold" as="div" style={{ color: 'var(--gray-11)' }}>Total Minutes</Text>
              <Text size="6" weight="bold" as="div" style={{ color: 'var(--gray-12)', marginTop: 5 }}>
                {Math.floor(calls.reduce((total, call) => total + call.duration, 0) / 60000)}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* TODO: Onboarding steps */}

        {/* Recent calls */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }}>
          <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 10 }}>
            <Heading size='2' style={{ color: 'var(--gray-11)' }}>Recent Calls</Heading>
            {/* Inline call list */}
          </Col>
        </Row>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

