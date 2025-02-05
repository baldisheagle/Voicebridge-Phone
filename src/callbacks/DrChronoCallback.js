import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../use-require-auth.js';
import { dbCreateCalendar } from '../utilities/database.js';
import toast, { Toaster } from 'react-hot-toast';
import { Row, Col } from 'react-bootstrap';
import { Spinner } from '@radix-ui/themes';
import { v4 as uuidv4 } from 'uuid';

export default function DrChronoCallback() {

  const auth = useRequireAuth();
  const navigate = useNavigate();

  // Get code from URL params
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  useEffect(() => {
    if (!code) {
      navigate('/calendars');
    }
    if (auth && auth.user && auth.workspace && code) {
      fetchAccessToken(code);
    }
  }, [code, auth]);

  const fetchAccessToken = async (code) => {
    try {
      const response = await fetch('http://localhost:5001/voicebridge-app/us-central1/getAccessTokenFromDrChrono', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch access token");

      const data = await response.json();

      // Save integration
      saveCalendar(data.access_token, data.refresh_token);
    
    } catch (error) {
      console.error("Error fetchi`ng access token:", error);
    }
  };


  const saveCalendar = async(accessToken, refreshToken) => {
    let calendar = {
      id: uuidv4(),
      name: 'DrChrono',
      provider: 'drchrono',
      accessToken: accessToken,
      refreshToken: refreshToken,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let result = await dbCreateCalendar(calendar);
    if (result) {
      toast.success('Connected to DrChrono');
      navigate('/calendars');
    } else {
      toast.error('Failed to connect to DrChrono');
      navigate('/calendars');
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
        <Spinner size="2" />
      </Row>
      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )

}