import React, { useState, useEffect } from 'react';
import { useAuth } from "./use-firebase.js";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from './shared-functions.js';
import Footer from "./components/common/Footer.js";
import Logo from "./components/common/Logo.js";
import { Row, Col, Image } from "react-bootstrap";
import { TextField, Spinner, Button, Text, Link } from "@radix-ui/themes";
import toast, { Toaster } from 'react-hot-toast';
import { sendVerificationEmail } from './utilities/sendgrid.js';
import { dbUpdateUser } from './utilities/database.js';

export default function VerifyEmail(props) {

  const auth = useAuth();
  const navigate = useNavigate();

  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [code, setCode] = useState('');

  useEffect(() => {
    if (auth.user && auth.user.emailVerified) {
      navigate('/dashboard');
    }
    window.scrollTo(0,0);
  }, [auth]);
  
  const handleVerifyEmail = async () => {
    if (code === auth.user.code) {
      toast.success('Email verified');
      try {
        await dbUpdateUser({ ...auth.user, emailVerified: true });
        auth.updateUser({ ...auth.user, emailVerified: true });
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to verify email');
        console.error(error);
      }
    } else {
      toast.error('Invalid verification code');
    }
  }

  const handleResendVerificationEmail = async () => {
    console.log(auth.user.email, auth.user.code);
    let res = await sendVerificationEmail(auth.user.email, auth.user.code);
    if (res) {
      toast.success('Verification email sent');
    } else {
      toast.error('Failed to send verification email');
    }
  }

  if (auth && auth.authenticating) {
    return (
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: isPageWide ? -200 : -55, marginRight: 0, height: '80vh' }}>
        <Col style={{ textAlign: 'center' }}>
          <p className="small muted">Authenticating .. hold on a sec</p>
          <Spinner animation="border" role="status" style={{ marginTop: 20 }} />
        </Col>
      </Row>
    )
  }

  return (
    <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', marginLeft: isPageWide ? -200 : -55 }}>
      <Col xs={12} sm={12} md={8} lg={6} xl={6} style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Logo width={160} />
        </div>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
          <Col xs={12} sm={10} md={8} lg={8} xl={8} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold" as='div'>Enter the code sent to your email</Text>
            <TextField.Root size='3' variant="surface" placeholder="Code" type="number" value={code} style={{ marginTop: 5 }} onChange={(e) => setCode(e.target.value)} />
            <Button variant="solid" size="3" style={{ width: '100%', marginTop: 20 }} onClick={() => handleVerifyEmail()}>
              Verify email
            </Button>
          </Col>
        </Row>
        <div style={{ width: '100%', textAlign: 'center', marginTop: 40 }}>
          <Text size="2" as='div' color='gray'>Didn't receive an email? <Link style={{ cursor: 'pointer' }} onClick={() => handleResendVerificationEmail()}>Resend email</Link></Text>
        </div>
        <Footer />
      </Col>
      { isPageWide && (
        <Col xs={12} sm={12} md={12} lg={6} xl={6} style={{ padding: 0, height: '100vh' }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg, #e0f7e0, #e0f0ff, #ffe0e8)' }}></div>
        </Col>
      )}
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </Row>
  );
}
