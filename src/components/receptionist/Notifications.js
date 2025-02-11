import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Spinner, Text, TextField, Button } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbUpdateAgent } from '../../utilities/database.js';
import { validateEmail } from '../../helpers/string.js';

export default function Notifications({ agent }) {

  const auth = useRequireAuth();

  const [notifyEmail, setNotifyEmail] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    setNotifyEmail(agent.notifyEmail);
    setLoading(false);
  }

  const saveNotifications = async () => {

    // If email is provided, validate it
    if (notifyEmail && notifyEmail.length > 0 && !validateEmail(notifyEmail)) {
      toast.error('Please enter a valid email address to notify');
      return;
    }

    let _agent = {
      ...agent,
      notifyEmail: notifyEmail.toLowerCase().trim(),
    }
    await dbUpdateAgent(_agent);
    toast.success('Notifications updated');
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
    <div style={{ width: '100%' }}>

      {/* Email notifications */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Email to notify</Text>
          <Text size="1" as='div' color='gray'>Receive email notifications to this email address when a new message is received.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="team@example.com" type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
        </Col>
      </Row>

            {/* Save button */}
            <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveNotifications}>Save changes</Button>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )


}

