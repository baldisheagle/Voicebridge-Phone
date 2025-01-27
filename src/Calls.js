import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Table, IconButton, Button, Badge } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Moment from 'react-moment';
import { Plus, CaretUp, CaretDown, Play, Download, ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react';
import { dbGetCalls } from './utilities/database.js';
import { formatPhoneNumber } from './helpers/string.js';

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
      setCalls(calls);
    }

    setLoading(false);

  }

  // Group calls by day
  const groupCallsByDay = (calls) => {
    return calls.reduce((groups, call) => {
      const date = new Date(call.startTs).toLocaleDateString();
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

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {calls.length === 0 ? "No calls" : `${calls.length} calls`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>

          </Col>
        </Row>

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10 }}>

            {calls.length > 0 && (
              <div>
                {Object.entries(groupCallsByDay(calls)).map(([date, dayCalls]) => (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginBottom: 10, marginTop: 20 }}>
                      <Moment format="dddd, MMMM D, YYYY">{new Date(date)}</Moment>
                    </Text>

                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {calls.map((call, index) => (
                          <React.Fragment key={call.id}>
                            <Table.Row
                              onClick={() => toggleRow(call.id)}
                              style={{ cursor: 'pointer', backgroundColor: expandedRows.has(index) ? 'var(--gray-2)' : 'transparent' }}
                            >
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>
                                  <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0, marginRight: 5 }}>
                                    {expandedRows.has(index) ?
                                      <CaretUp weight="bold" size={12} />
                                      :
                                      <CaretDown weight="bold" size={12} />
                                    }
                                  </IconButton>
                                  <Moment format="hh:mm A">{call.startTs}</Moment>
                                </Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{ call.direction === 'inbound' ? <ArrowDownRight weight="bold" size={12} /> : <ArrowUpRight weight="bold" size={12} /> } {call.fromNumber ? formatPhoneNumber(call.fromNumber) : 'Unknown'}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{Math.floor(call.duration/60000)}:{String(Math.floor((call.duration%60000)/1000)).padStart(2,'0')}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>{call.reason ? call.reason : 'Unknown'}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div' color="gray">
                                  {call.disconnectionReason ? call.disconnectionReason.toUpperCase() : 'Unknown'}
                                </Text>
                              </Table.Cell>
                            </Table.Row>
                            {/* Expandable section */}
                            {expandedRows.has(call.id) && (
                              <Table.Row>
                                <Table.Cell colSpan="3" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                  <Text size="1" color="gray" as='div' style={{ position: 'sticky', top: 0, paddingBottom: '5px' }}>Summary</Text>
                                  <Text size="2" as='div' style={{ marginTop: 10 }}>
                                    {call.summary ? call.summary : 'No summary available'}
                                  </Text>
                                </Table.Cell>
                                <Table.Cell colSpan="2" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                  <Text size="1" as='div' style={{ position: 'sticky', top: 0, paddingBottom: '5px' }}>Transcript</Text>
                                  { call.transcript ? <Text size="2" as='div' color="gray" style={{ marginTop: 10 }}>{call.transcript}</Text> : <Text size="2" as='div' color="gray" style={{ marginTop: 10 }}>No transcript available</Text> }
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </React.Fragment>
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

