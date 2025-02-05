import React, { useContext, useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Button, Heading, Spinner, Text, TextField } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Logo from './components/common/Logo.js';
import Footer from './components/common/Footer.js';
import { useMediaQuery } from './helpers/dom.js';
import Profile from './components/common/Profile.js';

export default function Onboarding() {

  const auth = useRequireAuth();
  const isPageWide = useMediaQuery('(min-width: 960px)');

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(false);
  }

  const scrapeWebsite = async () => {
    // Scrape website
    // Save details to variables
  }

  const completeOnboarding = async () => {
    setLoading(true);
    // Save business info to workspace, set onboarding complete to true
    // Update db agent with business info
    // Update Retell LLM

    // Pause for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    setLoading(false);
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10, marginLeft: isPageWide ? -100 : -22 }}>

        <Logo width={140} type="logo" />
        <Profile />

        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: '80vh', marginTop: 20 }}>
            <Col xs={12} sm={10} md={8} lg={7} xl={6} style={{ padding: 10, textAlign: 'center' }}>
            
            <Heading size="5" as='div' style={{ color: 'var(--gray-12)', marginTop: 20 }}>Let's get you set up</Heading>

            <Text size="2" as='div' style={{ color: 'var(--gray-12)', marginTop: 0 }}>
              We'll help you set up your business and get you started.
            </Text>
            
            {/* Step 1: Business name */}
            {step === 1 && (
              <>
                <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginTop: 40 }}>What is the name of your business?</Text>
                <TextField.Root variant="surface" placeholder="John Doe" value={businessName} style={{ marginTop: 5 }} onChange={(e) => setBusinessName(e.target.value)} />
                <Button variant="solid" style={{ marginTop: 20 }} onClick={() => setStep(step + 1)} disabled={businessName.length === 0}>Continue</Button>
              </>
            )}

            {/* Step 2: Business website */}
            {step === 2 && (
              <>
                <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginTop: 40 }}>What is the website of your business?</Text>
                <TextField.Root variant="surface" placeholder="https://www.example.com" value={businessWebsite} style={{ marginTop: 5 }} onChange={(e) => setBusinessWebsite(e.target.value)} />
                <Button variant="solid" style={{ marginTop: 20 }} onClick={() => setStep(step + 1)} disabled={businessWebsite.length === 0}>Continue</Button>
              </>
            )}
          
          </Col>
        </Row>

        <Footer />

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

