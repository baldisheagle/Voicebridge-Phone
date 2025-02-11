import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Spinner, Text, Button, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetAgents, dbDeleteAgent } from '../../utilities/database.js';
import { Trash } from '@phosphor-icons/react';
import { deleteVapiAssistant } from '../../utilities/vapi.js';

export default function Admin({ agent, onDeleteReceptionist }) {

  const auth = useRequireAuth();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    await dbGetAgents(auth.workspace.id).then((a) => {
      setAgents(a);
    });
    setLoading(false);
  }

  const deleteReceptionist = async () => {
    setDeleteLoading(true);
    let res = await deleteVapiAssistant(agent.vapiAssistantId);
    if (res) {
      // Delete agent from database
      let dbRes = await dbDeleteAgent(auth.workspace.id, agent.id);
      if (dbRes) {
        // Call onDeleteReceptionist callback
        onDeleteReceptionist();
        toast.success('Receptionist deleted');
        setDeleteLoading(false);
      } else {
        toast.error('Error deleting receptionist');
        setDeleteLoading(false);
      }
    } else {
      toast.error('Error deleting receptionist');
      setDeleteLoading(false);
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
    <div style={{ width: '100%' }}>

      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Delete receptionist</Text>
          <Text size="1" as='div' color='gray'>Permanently delete your receptionist.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, textAlign: 'right' }}>
          <AlertDialog.Root>
              <AlertDialog.Trigger>
                <Button variant="surface" color='red' style={{ marginTop: 10 }} loading={deleteLoading}><Trash size={16} /> {deleteLoading ? 'Deleting...' : 'Delete'}</Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Title>Delete Receptionist</AlertDialog.Title>
                <AlertDialog.Description>
                  Are you sure you want to delete this receptionist? This action cannot be undone.
                </AlertDialog.Description>
                <Row className="mt-4" style={{ justifyContent: 'flex-end', marginLeft: 0, marginRight: 0 }}>
                  <Col xs="auto" style={{ paddingRight: 10 }}>
                    <AlertDialog.Cancel>
                      <Button variant="soft" color="gray">Cancel</Button>
                    </AlertDialog.Cancel>
                  </Col>
                  <Col xs="auto">
                    <AlertDialog.Action>
                      <Button variant="solid" color="red" onClick={deleteReceptionist}>Delete</Button>
                    </AlertDialog.Action>
                  </Col>
                </Row>
              </AlertDialog.Content>
            </AlertDialog.Root>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
      
    </div>
  )



}

