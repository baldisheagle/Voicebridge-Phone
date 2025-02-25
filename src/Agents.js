import React, { useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Heading, Spinner, Card, Text, Button } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetAgents, dbGetPhoneNumbers } from './utilities/database.js';
import NewAgent from './components/agents/NewAgent.js';
import { User } from '@phosphor-icons/react';
import { formatPhoneNumber } from './helpers/string.js';

export default function Agents() {

  const auth = useRequireAuth();

  const [agents, setAgents] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
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
      setAgents(agents);
    }
    let phoneNumbers = await dbGetPhoneNumbers(auth.workspace.id);
    if (phoneNumbers && phoneNumbers.length > 0) {
      setPhoneNumbers(phoneNumbers);
    }
    setLoading(false);
  }

  const onInitAgent = async (agent) => {
    if (agent) {
      setAgents([...agents, agent]);
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingRight: 0, paddingBottom: 10 }}>

      <Heading size='4'>Agents</Heading>

      {!agents && (
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20, height: '50vh', backgroundColor: 'var(--accent-3)' }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10, textAlign: 'center' }}>
            <NewAgent onInitAgent={onInitAgent} />
          </Col>
        </Row>
      )}

      {agents && agents.length > 0 && (
        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
          <Col xs={4} sm={4} md={4} lg={4} xl={4} style={{ padding: 10 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginTop: 0 }}>{agents.length} agents</Text>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} style={{ padding: 10, textAlign: 'right' }}>
            <NewAgent onInitAgent={onInitAgent} />
          </Col>
        </Row>
      )}

      {agents && (  
        <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
            {agents.map((agent, index) => (
              <Col key={index} xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 10 }}>
                <Card style={{ padding: 20 }}>
                  <User size={16} weight="bold" color="gray" />
                  <Heading size='3' as='div' style={{ marginTop: 10 }}>{agent.agentName}</Heading>
                  <Text size='2' as='div' style={{ marginTop: 0, color: 'var(--gray-11)' }}>{agent.description}</Text>
                  <Text size='4' as='div' color="gray" style={{ marginTop: 5 }}>{agent.phoneNumber ? formatPhoneNumber(phoneNumbers.find(phoneNumber => phoneNumber.id === agent.phoneNumber).number) : 'No phone number'}</Text>
                  <Button variant="solid" color="gray" style={{ marginTop: 40 }}>Edit</Button>
                </Card>
              </Col>
            ))}
          </Row>

        </div>
      )}

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

