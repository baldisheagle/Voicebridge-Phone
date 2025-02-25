import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Image, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Card, Text, Button } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';

export default function Integrations() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);

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

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

        {/* <Heading size='2'>Calendars</Heading> */}

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 20 }}>
          {/* Cal.com */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <Card style={{ padding: 20 }}>
              <Row style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: '100%' }}>
                <div>
                  <Image src={theme === 'dark-theme' ? "/assets/logos/calcom-light.svg" : "/assets/logos/calcom-dark.svg"} alt="Cal.com" style={{ height: 20 }} />
                  <Text size="3" weight="bold" as='div' style={{ marginTop: 10 }}>Cal.com</Text>
                  <Text size="2" as='div' style={{ marginTop: 5 }}>Connect your cal.com calendar to automatically schedule appointments</Text>
                </div>
                <div style={{ width: '100%', textAlign: 'right' }}>
                  {/* TODO: Add a dialog to gather the user's cal.com API key and event ID */}
                  <Button variant="solid" style={{ marginTop: 20 }}>Enable</Button>
                </div>
              </Row>
            </Card>
          </Col>

          {/* Calendly */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <Card style={{ padding: 20 }}>
              <Row style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: '100%' }}>
                <div>
                  <Image src={"/assets/logos/calendly.png"} alt="Calendly" style={{ height: 26 }} />
                  <Text size="3" weight="bold" as='div' style={{ marginTop: 10 }}>Calendly</Text>
                  <Text size="2" as='div' style={{ marginTop: 5 }}>Connect your calendly calendar to automatically schedule appointments</Text>
                </div>
                <div style={{ width: '100%', textAlign: 'right' }}>
                  {/* TODO: Add a dialog to gather the user's calendly API key */}
                  <Button variant="solid" style={{ marginTop: 20 }}>Enable</Button>
                </div>
              </Row>
            </Card>
          </Col>

          {/* Google Calendar */}

          {/* Athena Health  */}

        </Row>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

