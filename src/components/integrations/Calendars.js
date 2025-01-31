import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Spinner, Text, Card, Dialog, VisuallyHidden, AlertDialog, TextField } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, Plus, Pencil, Trash, GoogleLogo } from '@phosphor-icons/react';
import { dbGetCalendars, dbGetAgents, dbUpdateCalendarName, dbDeleteCalendar } from '../../utilities/database.js';


export default function Calendars() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calendars, setCalendars] = useState([]);
  const [calendarName, setCalendarName] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [calendarNameDialogOpen, setCalendarNameDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    await dbGetCalendars(auth.workspace.id).then((c) => {
      setCalendars(c);
    });
    setLoading(false);
  }

  // Delete calendar
  const deleteCalendar = async (calendarId) => {
    // Make sure no agents are using this calendar
    dbGetAgents(auth.workspace.id).then((agents) => {
      if (agents.some(agent => agent.calendarId === calendarId)) {
        toast.error("Calendar is in use by an agent");
        return;
      } else {
        dbDeleteCalendar(calendarId, auth.workspace.id).then((success) => {
          if (success) {
            toast.success("Calendar deleted");
            setCalendars(calendars.filter(calendar => calendar.id !== calendarId));
          } else {
            toast.error("Error deleting calendar, please try again");
          }
        });
      }
    });
  }

  // Update calendar name
  const updateCalendarName = async (calendarId, name) => {
    dbUpdateCalendarName(calendarId, name.trim(), auth.workspace.id).then((success) => {
      if (success) {
        toast.success('Calendar name updated');
        setCalendars(calendars.map(calendar => calendar.id === calendarId ? { ...calendar, name: name.trim() } : calendar));
        setCalendarNameDialogOpen(false);
      } else {
        toast.error('Failed to update calendar name');
      }
    });
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

      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10 }}>
          <Text size="1" color='gray'>{calendars.length} calendars</Text>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10, textAlign: 'right' }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid"><Plus /> Connect new</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item><Calendar /> Cal.com</DropdownMenu.Item>
              <DropdownMenu.Item><Calendar /> Calendly</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Col>
      </Row>

      {/* Calendars */}
      {calendars.length > 0 && (
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
          {calendars.map((calendar, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={4} style={{ padding: 10 }}>
              <Card>
                {calendar.provider === 'google' && <GoogleLogo size={24} />}
                <Text size="3" as="div" weight="bold" style={{ marginTop: 20 }}>{calendar.name}</Text>
                <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
                  {/* Edit calendar */}
                  <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }} onClick={() => { setCalendarId(calendar.id); setCalendarName(calendar.name); setCalendarNameDialogOpen(true); }}><Pencil /></Button>
                  <Dialog.Root open={calendarNameDialogOpen} onOpenChange={setCalendarNameDialogOpen}>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Edit name</Dialog.Title>
                      <VisuallyHidden>
                        <Dialog.Description size="2">
                          Edit the name of the calendar
                        </Dialog.Description>
                      </VisuallyHidden>
                      <TextField.Root variant="outline" value={calendarName} onChange={(e) => setCalendarName(e.target.value.length > 0 ? e.target.value : 'No name')} />
                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                        <Button variant="solid" color="gray" onClick={() => console.log('cancel')}>Cancel</Button>
                        <Button variant="solid" onClick={() => {
                          updateCalendarName(calendarId, calendarName);
                          setCalendarNameDialogOpen(false);
                        }}>Save</Button>
                      </Row>
                    </Dialog.Content>
                  </Dialog.Root>
                  {/* Delete calendar */}
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <Button variant="ghost" size="3" color="red"><Trash /></Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Delete {calendar.name}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Are you sure you want to delete this calendar?
                      </AlertDialog.Description>

                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                        <AlertDialog.Cancel>
                          <Button variant="solid" color="gray">
                            Cancel
                          </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button variant="solid" color="red" onClick={() => deleteCalendar(calendar.id)}>
                            Delete
                          </Button>
                        </AlertDialog.Action>
                      </Row>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

