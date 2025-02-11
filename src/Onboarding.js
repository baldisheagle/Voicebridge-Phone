import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Button, Heading, Spinner, Text, TextArea, TextField } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Logo from './components/common/Logo.js';
import Footer from './components/common/Footer.js';
import { useMediaQuery } from './helpers/dom.js';
import Profile from './components/common/Profile.js';
import { dbCreateAgent, dbUpdateWorkspace } from './utilities/database.js';
import { firecrawl } from './utilities/firecrawl.js';
import { validateUrl } from './helpers/string.js';
import { VAPI_AGENT_DEFAULTS } from './config/defaults.js';
import { createVapiAssistant } from './utilities/vapi.js';
export default function Onboarding() {

  const auth = useRequireAuth();
  const navigate = useNavigate();
  const isPageWide = useMediaQuery('(min-width: 960px)');

  const [loading, setLoading] = useState(true);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [businessServices, setBusinessServices] = useState('');
  const [businessInsurance, setBusinessInsurance] = useState('');


  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setBusinessName(auth.workspace.name ? auth.workspace.name : 'My business');
    if (auth.workspace.onboarded) {
      navigate('/dashboard');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  const scrapeWebsite = async () => {
    setScrapeLoading(true);
    // Scrape website
    if (validateUrl(businessWebsite)) {
      const srapedData = await firecrawl(businessWebsite);
      if (srapedData && srapedData.success && srapedData.data) {
        console.log(srapedData);
        setBusinessLocation(srapedData.data.business_location ? srapedData.data.business_location : '');
        setBusinessPhone(srapedData.data.phone_number ? srapedData.data.phone_number : '');
        setBusinessEmail(srapedData.data.email ? srapedData.data.email : '');
        setBusinessDescription(srapedData.data.business_summary ? srapedData.data.business_summary : '');
        setBusinessServices(srapedData.data.services_offered ? srapedData.data.services_offered.join(', ') : '');
        setBusinessInsurance(srapedData.data.insurance_accepted ? srapedData.data.insurance_accepted.join(', ') : '');
      }
      // Set step 2
      setStep(2);
    } else {
      toast.error('Invalid website URL');
    }
    setScrapeLoading(false);
    // setStep(2);
  }

  const completeOnboarding = async () => {
    
    setLoading(true);
    
    // Save business info to workspace, set onboarding to true
    let _businessInfo = {
      website: businessWebsite,
      description: businessDescription,
      location: businessLocation,
      phone: businessPhone,
      email: businessEmail,
      services: businessServices,
      insurance: businessInsurance
    }
  
    // Update workspace in database
    await dbUpdateWorkspace(auth.workspace.id, {
      ...auth.workspace,
      name: businessName || 'My business', 
      businessInfo: _businessInfo,
      onboarded: true
    });

    // Update workspace in auth
    auth.updateWorkspace({
      ...auth.workspace,
      name: businessName || 'My business', 
      businessInfo: _businessInfo,
      onboarded: true
    });

    // TODO: Create a receptionist
    
    // Build agent object
    // let agentId = uuidv4();
    // let _agent = {
    //   id: agentId,
    //   vapiAssistantId: null,
    //   template: 'phone-receptionist',
    //   name: VAPI_AGENT_DEFAULTS.name,
    //   agentName: agentId,
    //   voiceId: VAPI_AGENT_DEFAULTS.voiceId,
    //   language: VAPI_AGENT_DEFAULTS.language,
    //   model: VAPI_AGENT_DEFAULTS.model,
    //   includeDisclaimer: VAPI_AGENT_DEFAULTS.includeDisclaimer,
    //   businessInfo: _businessInfo,
    //   ambientSound: VAPI_AGENT_DEFAULTS.ambientSound,
    //   boostedKeywords: VAPI_AGENT_DEFAULTS.boostedKeywords,
    //   calendar: VAPI_AGENT_DEFAULTS.calendar,
    //   calCom: VAPI_AGENT_DEFAULTS.calCom,
    //   faq: [],
    //   phoneNumber: null,
    //   workspaceId: auth.workspace.id,
    //   createdBy: auth.user.uid,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // }

    // // Create Vapi Assistant using agent object
    // let vapiAssistantId = await createVapiAssistant(_agent);

    // // Update agent with Vapi Assistant ID and create agent in database
    // if (vapiAssistantId) {

    //     // Update agent with Vapi Assistant ID
    //     _agent.vapiAssistantId = vapiAssistantId;

    //     // Create agent in database
    //     let res = await dbCreateAgent(_agent);

    //     if (res) {

    //       // Buy a phone number


    //     }

    // }

    // TODO: Buy a phone number with 

    // Pause for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    setLoading(false);
    navigate('/dashboard');
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10, marginLeft: isPageWide ? -100 : -30 }}>

      <Logo width={140} type="logo" />
      <Profile />

      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: '80vh', marginTop: 20, overflowY: 'auto' }}>
        <Col xs={12} sm={12} md={12} lg={11} xl={10} style={{ padding: 0 }}>

          <Heading size="5" as='div' style={{ color: 'var(--gray-12)', marginTop: 20 }}>Let's get you started</Heading>

          {/* Step 1: Business name and website */}
          {step === 1 && (
            <div style={{ width: '100%', marginTop: 30 }}>

              {/* Business name */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business name</Text>
                  <Text size="1" as='div' color='gray'>The name of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextField.Root variant="surface" placeholder="John Doe" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </Col>
              </Row>

              {/* Business website */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business website</Text>
                  <Text size="1" as='div' color='gray'>The website of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextField.Root variant="surface" placeholder="https://www.example.com" value={businessWebsite} onChange={(e) => setBusinessWebsite(e.target.value)} />
                </Col>
              </Row>

              <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
                {scrapeLoading ? <Spinner size="2" /> : <Button variant="solid" onClick={() => scrapeWebsite(businessWebsite)} disabled={businessName.length === 0 || businessWebsite.length === 0}>Continue</Button>}
              </Row>

            </div>
          )}

          {/* Step 2: Business website */}
          {step === 2 && (
            <div style={{ width: '100%', marginTop: 30 }}>

              {/* Business email */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business email</Text>
                  <Text size="1" as='div' color='gray'>The email of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextField.Root variant="surface" placeholder="john@doe.com" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
                </Col>
              </Row>

              {/* Business phone   */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business phone</Text>
                  <Text size="1" as='div' color='gray'>The phone number of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextField.Root variant="surface" placeholder="123-456-7890" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
                </Col>
              </Row>

              {/* Business location */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business location</Text>
                  <Text size="1" as='div' color='gray'>The location of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextField.Root variant="surface" placeholder="123 Main St, Anytown, USA" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} />
                </Col>
              </Row>

              {/* Business description   */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Business description</Text>
                  <Text size="1" as='div' color='gray'>The description of your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextArea variant="surface" placeholder="..." rows={4} maxLength={1000} value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
                </Col>
              </Row>

              {/* Services offered */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Services offered</Text>
                  <Text size="1" as='div' color='gray'>The services offered by your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextArea variant="surface" placeholder="..." rows={4} maxLength={1000} value={businessServices} onChange={(e) => setBusinessServices(e.target.value)} />
                </Col>
              </Row>

              {/* Insurance accepted */}
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
                  <Text size="2" weight="bold">Insurance accepted</Text>
                  <Text size="1" as='div' color='gray'>The insurance accepted by your business.</Text>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={5} style={{ padding: 0, paddingLeft: 10 }}>
                  <TextArea variant="surface" placeholder="..." rows={4} maxLength={1000} value={businessInsurance} onChange={(e) => setBusinessInsurance(e.target.value)} />
                </Col>
              </Row>

              <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
                <Button variant="soft" color="gray" style={{ marginRight: 20 }} onClick={() => setStep(1)}>Back</Button>
                <Button variant="solid" onClick={() => completeOnboarding()} disabled={businessEmail.length === 0}>Complete</Button>
              </Row>

            </div>
          )}

        </Col>
      </Row>

      <Footer />

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

