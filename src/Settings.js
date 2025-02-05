import React, { useContext, useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Heading, Spinner, Text, TextField, Button, Separator, TextArea, Card } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbUpdateWorkspace } from './utilities/database.js';
import { ArrowDown, Trash, Hourglass, ArrowClockwise } from '@phosphor-icons/react';
import { BILLING_PLANS, BILLING_PLAN_STARTER_STRIPE_PRICE_ID, BILLING_PLAN_PRO_STRIPE_PRICE_ID, BILLING_PLAN_GROWTH_STRIPE_PRICE_ID } from './config/billing.js';
import { stripeCreateCustomer, stripeGetCheckoutSession, stripeGetCustomerPortalSession, stripeGetSubscription } from './utilities/stripe.js';
// import Billing from './components/settings/Billing.js';
// import Workspace from './components/settings/Workspace.js';
export default function Settings() {

  const auth = useRequireAuth();

  // Workspace settings
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceWebsite, setWorkspaceWebsite] = useState('');
  const [workspacePhoneNumber, setWorkspacePhoneNumber] = useState('');
  const [workspaceEmail, setWorkspaceEmail] = useState('');
  const [workspaceAddress, setWorkspaceAddress] = useState('');
  const [workspaceAbout, setWorkspaceAbout] = useState('');
  // Stripe
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState(BILLING_PLANS);
  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setWorkspaceName(auth.workspace.name);
    setWorkspaceWebsite(auth.workspace.website);
    setWorkspacePhoneNumber(auth.workspace.phoneNumber);
    setWorkspaceEmail(auth.workspace.email);
    setWorkspaceAddress(auth.workspace.address);
    setWorkspaceAbout(auth.workspace.about);

    // Get current plan
    if (!auth.workspace.stripe_customer_id || // If no customer id, set to free
      (auth.workspace.stripe_customer_id && !auth.workspace.stripe_plan_id) || // If no plan id, set to free
      (auth.workspace.stripe_customer_id && auth.workspace.stripe_plan_id && auth.workspace.stripe_status !== 'active') // If plan id and status is not active, set to free
    ) {
      setCurrentPlan('Free');
    } else if (auth.workspace.stripe_plan_id === BILLING_PLAN_PRO_STRIPE_PRICE_ID) {
      setCurrentPlan('Pro');
    } else if (auth.workspace.stripe_plan_id === BILLING_PLAN_GROWTH_STRIPE_PRICE_ID) {
      setCurrentPlan('Growth');
    } else if (auth.workspace.stripe_plan_id === BILLING_PLAN_STARTER_STRIPE_PRICE_ID) {  
      setCurrentPlan('Starter');  
    }

    setLoading(false);
  }

  const saveWorkspace = async () => {
    let _workspace = {
      ...auth.workspace,
      name: workspaceName ? workspaceName.slice(0, 100).trim() : '',
      website: workspaceWebsite ? workspaceWebsite.slice(0, 1000).trim() : '',
      phoneNumber: workspacePhoneNumber ? workspacePhoneNumber.slice(0, 1000).trim() : '',
      email: workspaceEmail ? workspaceEmail.slice(0, 1000).trim() : '',
      address: workspaceAddress ? workspaceAddress.slice(0, 1000).trim() : '',
      about: workspaceAbout ? workspaceAbout.slice(0, 1000).trim() : ''
    }
    
    let res = await dbUpdateWorkspace(auth.workspace.id, _workspace);

    if (res) {
      toast.success('Workspace updated');
      auth.updateWorkspace(_workspace);
    } else {
      toast.error('Error updating workspace');
    }
  
  }

  const handleUpgrade = async(price_id) => {
    // let url = await getStripeCheckoutSession(price_id);
    // if (url) {
    //   window.location.href = url;
    // }
  }

  const getStripeCheckoutSession = async(price_id) => {

    setLoading(true);

    // Check if Stripe Customer Id is not null
    let stripeCustomerId = auth.workspace.stripe_customer_id;
    // console.log('auth.workspace.stripe_customer_id', auth.workspace.stripe_customer_id)
    if (stripeCustomerId === null) {
      // If null, create a new Stripe Customer Id
      stripeCustomerId = await stripeCreateCustomer(auth.user.email, auth.workspace.id);
      // console.log('received stripeCustomerId', stripeCustomerId);
      if (stripeCustomerId) {
        // Update workspace with Stripe Customer Id
        let _workspace = {
          ...auth.workspace,
          stripe_customer_id: stripeCustomerId
        }
        let res = await dbUpdateWorkspace(auth.workspace.id, _workspace);
        // console.log('dbUpdateWorkspace', res);
        if (!res) {
          toast.error('Something did not work. Try again.');
          return null;
        }
      } else {
        toast.error('Something did not work. Try again.');
        return null;
      }
    }

    let url = await stripeGetCheckoutSession(price_id, stripeCustomerId);
    // console.log('url', url);
    if (url) {
      window.location.href = url;
    } else {
      toast.error('Could not process billing request.');
    }

    setLoading(false);

    return null;

  }

  const getStripePortalSession = async() => {

    setLoading(true);

    if (auth.workspace.stripe_customer_id) {
      const toastId = toast.loading('Redirecting to billing portal...', { icon: <Hourglass /> });
      let url = await stripeGetCustomerPortalSession(auth.workspace.stripe_customer_id);
      if (url) {
        toast.dismiss(toastId);
        window.location.href = url;
      } else {
        toast.dismiss(toastId);
        toast.error('Could not process portal session request.');
      }
    } else {
      toast.error('Could not process portal session request.');
    }

    setLoading(false);

    return null;

  }

  const refreshSubscriptionStatus = async() => {
    setLoading(true);
    let subscription = await stripeGetSubscription(auth.workspace.stripe_subscription_id);
    console.log('subscription', subscription);
    if (subscription) {
      let res = await auth.updateWorkspaceStripeDetails(subscription);
      if (res) {
        toast.success('Updated billing status!');
        // window.location.reload();
      } else {
        toast.error('Failed to update status.')
      }
    } else {
      toast.error('Failed to update status.')
    }
    setLoading(false);
  }

  const deleteAccount = async () => {
    // let res = await dbDeleteUser(auth.user.id);
    // if (res) {
    //   toast.success('Account deleted');
    //   auth.logout();
    // } else {
    //   toast.error('Error deleting account');
    // }
  }

  const downloadData = async () => {
    // let res = await dbDownloadData(auth.user.id);
    // if (res) {
    //   toast.success('Data downloaded');
    // } else {
    //   toast.error('Error downloading data');
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
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>
      
      <Heading size='4'>Settings</Heading>
      
      {/* Tabs */}
      {/* <div style={{ width: '100%', marginTop: 10 }}>
        <TabNav.Root>
          <TabNav.Link href='#' active={activeTab === 'workspace'} onClick={() => setActiveTab('workspace')}>
            Workspace
          </TabNav.Link>
          <TabNav.Link href='#' active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
            Account
          </TabNav.Link>
          <TabNav.Link href='#' active={activeTab === 'billing'} onClick={() => setActiveTab('billing')}>
            Billing
          </TabNav.Link>
        </TabNav.Root>
      </div> */}

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100, paddingBottom: 100 }}>  

        {/* {activeTab === 'billing' && (
          <Billing />
        )}

        {activeTab === 'workspace' && (
          <Workspace />
        )} */}

        {/* Workspace */}

        <Heading size='3' as='div' style={{ color: 'var(--gray-11)' }}>Workspace</Heading>
        <Separator style={{ width: '100%' }} />

        {/* Name */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Name</Text>
            <Text size="1" as='div' color='gray'>The name of your workspace.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="surface" placeholder="John Doe" value={workspaceName} maxLength={100} onChange={(e) => setWorkspaceName(e.target.value)} />
          </Col>
        </Row>

        {/* Website */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Website</Text>
            <Text size="1" as='div' color='gray'>Your website URL.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="surface" placeholder="https://www.example.com" type="url" maxLength={1000} value={workspaceWebsite} onChange={(e) => setWorkspaceWebsite(e.target.value)} />
          </Col>
        </Row>

        {/* Phone number */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Phone number</Text>
            <Text size="1" as='div' color='gray'>Your business phone number.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="surface" placeholder="+1234567890" type="tel" value={workspacePhoneNumber} onChange={(e) => setWorkspacePhoneNumber(e.target.value)} />
          </Col>
        </Row>

        {/* Email */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Email</Text>
            <Text size="1" as='div' color='gray'>Your business email.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="surface" placeholder="john@example.com" type="email" maxLength={1000} value={workspaceEmail} onChange={(e) => setWorkspaceEmail(e.target.value)} />
          </Col>
        </Row>

        {/* Address */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Address</Text>
            <Text size="1" as='div' color='gray'>Your business address.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="surface" placeholder="123 Main St, Anytown, USA" maxLength={1000} value={workspaceAddress} onChange={(e) => setWorkspaceAddress(e.target.value)} />
          </Col>
        </Row>

        {/* About your business */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">About your business</Text>
            <Text size="1" as='div' color='gray'>A short description of your business.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextArea variant="surface" placeholder="We are a small business that sells widgets." rows={4} maxLength={1000} value={workspaceAbout} onChange={(e) => setWorkspaceAbout(e.target.value)} />
          </Col>
        </Row>

        {/* Save workspace button */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Button variant="solid" onClick={saveWorkspace}>Save changes</Button>
          </Col>
        </Row>


        <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Billing</Heading>
        <Separator style={{ width: '100%' }} />

        {/* Current plan */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="1" weight="bold" as='div' color='gray'>Current plan</Text>
            <Text size="2" weight="bold" as='div'>{currentPlan}</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Button variant="ghost" onClick={refreshSubscriptionStatus}><ArrowClockwise size={16} /> Refresh</Button>
          </Col>
        </Row>

        {/* Plans */}
        {/* <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="1" weight="bold" as='div' color='gray'>Plans</Text>
          </Col>
        </Row> */}

        {/* Insert stripe widget here */}

        {/* <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0 }}>
          {BILLING_PLANS.map((plan) => (
            <Col key={plan.id} xs={12} sm={12} md={6} lg={4} xl={4} style={{ padding: 10 }}>
              <Card>
                <Text size="3" weight="bold">{plan.name}</Text>
                <Text size="2" as='div' color='gray'>{plan.description}</Text>
                <Text size="6" as='div' color='gray' style={{ marginTop: 10 }}>${plan.price}</Text>
                <Button variant="solid" style={{ marginTop: 10 }} onClick={() => handleUpgrade(plan.id)}>Upgrade</Button>
              </Card>
            </Col>
          ))}
        </Row> */}

        {/* Account */}

        <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Account</Heading>
        <Separator style={{ width: '100%' }} />

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Download data</Text>
            <Text size="1" as='div' color='gray'>Download your data.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Button variant="ghost" onClick={downloadData}><ArrowDown size={16} /> Download data</Button>
          </Col>
        </Row>

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Delete account</Text>
            <Text size="1" as='div' color='gray'>Permanently delete your account.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Button variant="ghost" color="red" onClick={deleteAccount}><Trash size={16} /> Delete account</Button>
          </Col>
        </Row>

        <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />

      </div>

    </div>
  )

  

}

