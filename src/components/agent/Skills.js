import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Spinner, Text, Switch } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../../use-firebase.js';
import { dbUpdateAgent, dbGetAgent } from '../../utilities/database.js';
import { CaretDownIcon } from '@radix-ui/react-icons';

export default function Skills() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [agent, setAgent] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [allowCalendarScheduling, setAllowCalendarScheduling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    dbGetAgent(auth.workspace.id).then((agent) => {
      if (agent) {
        setAgent(agent);
        setAllowCalendarScheduling(agent.allowCalendarScheduling || false);
        setCalendar(agent.calendar || null);
      } else {
        navigate('/dashboard');
      }
    });
    setLoading(false);
  }

  // Save skills
  const saveSkills = async () => {

    if (allowCalendarScheduling && !calendar) {
      toast.error('Please connect a calendar');
      return;
    }

    let _agent = {
      ...agent,
      allowCalendarScheduling: allowCalendarScheduling,
      calendar: calendar,
    }
    let res = await dbUpdateAgent(_agent);
    if (res) {
      toast.success('Skills updated');
    } else {
      toast.error('Error updating skills');
    }
  }

  // Delete calendar
  const deleteCalendar = async (calendarId) => {

  }

  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    const provider = new GoogleAuthProvider();
    // Add all required scopes
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');

    // Force consent screen to always appear and request offline access
    provider.setCustomParameters({
      access_type: 'offline',
      prompt: 'consent select_account'
    });

    signInWithPopup(firebaseAuth, provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      // Get refresh token from the user object
      const refreshToken = result.user.refreshToken;

      console.log("Google Calendar connected");
      saveCalendar('Google', 'google', accessToken, refreshToken);
    }).catch((error) => {
      console.error("Error connecting Google Calendar:", error);
      toast.error("Error connecting Google Calendar");
    });
  }

  // Connect Cal.com
  const connectCalcom = () => {
    // TODO: Implement Cal.com integration
  }

  // Save calendar
  const saveCalendar = async (name, provider, accessToken, refreshToken) => {

  }

  // Update calendar name
  const updateCalendarName = async (calendarId, name) => {
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

      {/* Calendar */}    
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Allow calendar scheduling</Text>
          <Text size="1" as='div' color='gray'>Allow customers to schedule appointments through your calendar.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Switch variant="outline" size="2" checked={allowCalendarScheduling} onCheckedChange={(checked) => setAllowCalendarScheduling(checked)} />
          { allowCalendarScheduling && (
            <div style={{ marginTop: 10 }}>
              { !calendar && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="outline">Select Calendar <CaretDownIcon /></Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={connectGoogleCalendar}>Google Calendar</DropdownMenu.Item>
                    <DropdownMenu.Item onClick={connectCalcom}>Cal.com</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )}
              { calendar && (
                <div style={{ marginTop: 10 }}>
                  <Text size="2" weight="medium">{calendar?.name || 'No calendar connected'}</Text>
                  <Button size="1" variant="ghost" color="gray" onClick={() => setCalendar(null)}>Disconnect</Button>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

                  {/* Save button */} 
                  <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveSkills}>Save changes</Button>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )


}

