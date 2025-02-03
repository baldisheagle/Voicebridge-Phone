import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Table, IconButton, Button, Badge, ScrollArea, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Moment from 'react-moment';
import { CaretUp, CaretDown, ArrowDownRight, ArrowUpRight, Trash } from '@phosphor-icons/react';
import { dbDeleteCall, dbGetCalls } from './utilities/database.js';
import { formatPhoneNumber } from './helpers/string.js';
import { CALL_PURPOSES } from './config/lists.js';  

export default function Calls() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {

    setLoading(true);

    // Get calls
    const calls = await dbGetCalls(auth.workspace.id);
    if (calls) {
      setCalls(calls.sort((a, b) => new Date(b.startTimestamp) - new Date(a.startTimestamp)));
    }

    setLoading(false);

  }

  // Group calls by day
  const groupCallsByDay = (calls) => {
    return calls.reduce((groups, call) => {
      const date = new Date(call.startTimestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(call);
      return groups;
    }, {});
  };

  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const deleteCall = (id) => {
    console.log('Deleting call', id);
    dbDeleteCall(auth.workspace.id, id).then(() => {
      toast.success('Call deleted');
      setCalls(calls.filter(call => call.id !== id));
    }).catch((error) => {
      toast.error('Error deleting call');
      console.error(error);
    });
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

      <Heading size='4'>Calls</Heading>

      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10 }}>
            {calls.length > 0 && (
              <div>
                {Object.entries(groupCallsByDay(calls)).map(([date]) => (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginBottom: 10, marginTop: 20 }}>
                      <Moment format="dddd, MMMM D, YYYY">{new Date(date)}</Moment>
                    </Text>

                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>To</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Caller</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Purpose</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Sentiment</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {calls.map((call, index) => (
                          new Date(call.startTimestamp).toLocaleDateString() === date && (
                            <React.Fragment key={call.id}>
                              <Table.Row
                                onClick={() => toggleRow(call.id)}
                                style={{ cursor: 'pointer', backgroundColor: expandedRows.has(index) ? 'var(--gray-2)' : 'transparent' }}
                            >
                              <Table.Cell minWidth="140px">
                                <Text size="2" weight="medium" as='div'>
                                  <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0, marginRight: 5 }}>
                                    {expandedRows.has(index) ?
                                      <CaretUp weight="bold" size={12} />
                                      :
                                      <CaretDown weight="bold" size={12} />
                                    }
                                  </IconButton>
                                  <Moment format="hh:mm A">{call.startTimestamp}</Moment>
                                </Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{ call.direction === 'inbound' ? <ArrowDownRight weight="bold" size={12} /> : call.direction === 'outbound' ? <ArrowUpRight weight="bold" size={12} /> : null } {call.fromNumber ? formatPhoneNumber(call.fromNumber) : 'Unknown'}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{call.toNumber ? formatPhoneNumber(call.toNumber) : 'Unknown'}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{call.callerName ? call.callerName : 'Anonymous'}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Badge size="2" weight="medium" as='div'>{call.callPurpose ? CALL_PURPOSES.find(purpose => purpose.value === call.callPurpose)?.label : 'Unknown'}</Badge>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Badge size="2" weight="medium" as='div' color={call.userSentiment === 'Positive' ? 'green' : call.userSentiment === 'Negative' ? 'red' : 'gray'}>
                                  {call.userSentiment ? call.userSentiment.toUpperCase() : 'Unknown'}
                                </Badge>
                              </Table.Cell>
                            </Table.Row>
                            {expandedRows.has(call.id) && (
                              <Table.Row>
                                <Table.Cell colSpan="2" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                  
                                  <Text size="1" color="gray" as='div'>Duration</Text>
                                  <Text size="2" as='div' style={{ marginTop: 0 }}>{Math.floor(call.durationMs/60000)} min {String(Math.floor((call.durationMs%60000)/1000))} sec</Text>

                                  <Text size="1" color="gray" as='div' style={{ marginTop: 10 }}>Status</Text>
                                  <Badge size="2" as='div' style={{ marginTop: 0 }} color={call.callStatus === 'Completed' ? 'green' : call.callStatus === 'Missed' ? 'red' : 'gray'}>{call.callStatus ? call.callStatus : 'Unknown'}</Badge>
                                
                                </Table.Cell>
                                <Table.Cell colSpan="3" style={{ padding: '16px', backgroundColor: 'var(--gray-1)', maxWidth: 300 }}>
                                  <Text size="1" color="gray" as='div'>Summary</Text>
                                  <Text size="2" as='div' style={{ marginTop: 0 }}>
                                    {call.callSummary ? call.callSummary : 'No summary available'}
                                  </Text>

                                  <Text size="1" color="gray" as='div' style={{ marginTop: 20 }}>Transcript</Text>
                                  <ScrollArea style={{ height: 100, paddingRight: 10 }}>
                                    <Text size="2" as='div' style={{ marginTop: 0 }}>
                                      {call.transcript ? call.transcript : 'No transcript available'}
                                    </Text>
                                  </ScrollArea>

                                  <Text size="1" color="gray" as='div' style={{ marginTop: 20 }}>Recording</Text>
                                  <audio controls style={{ width: '100%', marginTop: 10, maxHeight: 40, maxWidth: 300 }}>
                                    <source src={call.recordingUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>

                                  <Text size="1" color="gray" as='div' style={{ marginTop: 20 }}>Actions</Text>
                                  <AlertDialog.Root>
                                    <AlertDialog.Trigger>
                                      <Button size="1" variant="soft" color="gray" style={{ marginTop: 10 }}>
                                        <Trash weight="bold" size={12} /> Delete
                                      </Button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content>
                                      <AlertDialog.Title>Delete call from {call.fromNumber ? formatPhoneNumber(call.fromNumber) : 'Unknown'}</AlertDialog.Title>
                                      <AlertDialog.Description>Are you sure?</AlertDialog.Description>
                                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, width: '100%', marginTop: 10 }}>
                                      <AlertDialog.Cancel>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                          </AlertDialog.Cancel>
                                          <AlertDialog.Action>
                                            <Button variant="solid" color="red" onClick={() => deleteCall(call.id)}>Delete</Button>
                                          </AlertDialog.Action>
                                      </Row>
                                    </AlertDialog.Content>
                                  </AlertDialog.Root>
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </React.Fragment>
                          )
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </div>
                ))}
              </div>
            )}

          </Col>
        </Row>

      </div>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

