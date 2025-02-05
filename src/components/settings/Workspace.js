import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Select, Spinner, Text, TextField, Button } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbUpdateWorkspace } from '../../utilities/database.js';

export default function Workspace() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [workspace, setWorkspace] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    setWorkspace(auth.workspace || null);
    setWorkspaceName(auth.workspace.name || '');
    setLoading(false);
  }

  const saveWorkspace = async () => {
    let _workspace = {
      ...workspace,
      name: workspaceName
    }
    let res = await dbUpdateWorkspace(workspace.id, _workspace);
    if (res) {
      toast.success('Workspace updated');
      auth.updateWorkspace(_workspace);
    } else {
      toast.error('Error updating workspace');
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

      {/* Workspace name */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Name</Text>
          <Text size="1" as='div' color='gray'>The name of your workspace.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="John Doe" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
        </Col>
      </Row>

      {/* Save button */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveWorkspace}>Save changes</Button>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

