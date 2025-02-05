import React, { useState, useEffect } from 'react';
import { useAuth } from "./use-firebase.js";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from './shared-functions.js';
import Footer from "./components/common/Footer.js";
import Logo from "./components/common/Logo.js";
import { Row, Col, Image } from "react-bootstrap";
import { TextField, Spinner, Button, Text, Link } from "@radix-ui/themes";
import toast, { Toaster } from 'react-hot-toast';
import { validateEmail } from './helpers/string.js';

export default function Signup(props) {

  const auth = useAuth();
  const navigate = useNavigate();

  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (auth.user) {
      navigate('/dashboard');
    }
    window.scrollTo(0,0);
  }, [auth]);

  const handleGoogleLogin = async () => {
    try {
      const result = await auth.googleLogin();
      if (result) {
        navigate('/dashboard');
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  const handleEmailSignup = async () => {
    try {
      // Input validation
      if (email === '' || password === '') {
        toast.error("Please enter your email and password.");
        return;
      }
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email.");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }

      const result = await auth.emailSignup(email, password);
      
      if (result) {
        navigate('/dashboard');
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      
    } catch (error) {
      console.error("Email signup error:", error);
      toast.error("Something went wrong. Please try again.");
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
        <div style={{ width: '100%', textAlign: 'center', marginTop: 40 }}>
          <Button variant='soft' color='gray' size='3' onClick={() => handleGoogleLogin()}><Image src={"/assets/buttons/google_icon.png"} style={{ width: 20, marginRight: 12 }} />Continue with Google</Button>
        </div>
        <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 40 }}>Or sign up with email</Text>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={10} md={8} lg={8} xl={8} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold" as='div'>Email</Text>
            <TextField.Root size='3' variant="surface" placeholder="Email" type="email" value={email} style={{ marginTop: 5 }} onChange={(e) => setEmail(e.target.value)} />
            <Text size="2" weight="bold" as='div' style={{ marginTop: 20 }}>Password</Text>
            <TextField.Root size='3' variant="surface" placeholder="Password" type="password" value={password} style={{ marginTop: 5 }} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="solid" size="3" style={{ width: '100%', marginTop: 20 }} onClick={() => handleEmailSignup()}>
              Sign up
            </Button>
          </Col>
        </Row>
        <div style={{ width: '100%', textAlign: 'center', marginTop: 40 }}>
          <Text size="2" as='div' color='gray'>Already have an account? <Link style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Login</Link></Text>
        </div>
        <Footer />
      </Col>
      { isPageWide && (
        <Col xs={12} sm={12} md={12} lg={6} xl={6} style={{ padding: 0, height: '100vh' }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg, #e0f7e0, #e0f0ff, #ffe0e8)' }}></div>
        </Col>
      )}
      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </Row>
  );
}
