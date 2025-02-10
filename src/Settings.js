import React, { useContext, useEffect, useState } from 'react';
import { useRequireAuth } from './use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Heading, Spinner, Text, TextField, Button, Separator, TextArea, Dialog, VisuallyHidden, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbDeletePhoneNumber, dbGetAgents, dbGetPhoneNumbers, dbUpdateWorkspace } from './utilities/database.js';
import { ArrowDown, Trash, Hourglass, ArrowClockwise, Phone, Copy } from '@phosphor-icons/react';
import { BILLING_PLANS, BILLING_PLAN_STARTER_STRIPE_PRICE_ID, BILLING_PLAN_PRO_STRIPE_PRICE_ID, BILLING_PLAN_GROWTH_STRIPE_PRICE_ID } from './config/billing.js';
import { stripeCreateCustomer, stripeGetCheckoutSession, stripeGetCustomerPortalSession, stripeGetSubscription } from './utilities/stripe.js';
// import { buyRetellPhoneNumber, deleteRetellPhoneNumber } from './utilities/retell.js';
import { dbAddPhoneNumber } from './utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneNumber } from './helpers/string.js';
import { buyVapiNumber, deleteVapiNumber } from './utilities/vapi.js';

export default function Settings() {

  const auth = useRequireAuth();

  // Workspace settings
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceWebsite, setWorkspaceWebsite] = useState('');
  const [workspacePhoneNumber, setWorkspacePhoneNumber] = useState('');
  const [workspaceEmail, setWorkspaceEmail] = useState('');
  const [workspaceAddress, setWorkspaceAddress] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');

  // Phone number settings
  const [buyNumberAreaCode, setBuyNumberAreaCode] = useState('');
  const [buyNumberNickname, setBuyNumberNickname] = useState('My number');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [buyNumberDialogOpen, setBuyNumberDialogOpen] = useState(false);

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
  const initialize = async () => {

    setWorkspaceName(auth.workspace.name);
    setWorkspaceWebsite(auth.workspace.businessInfo?.website);
    setWorkspacePhoneNumber(auth.workspace.businessInfo?.phone);
    setWorkspaceEmail(auth.workspace.businessInfo?.email);
    setWorkspaceAddress(auth.workspace.businessInfo?.location);
    setWorkspaceDescription(auth.workspace.businessInfo?.description);

    // Get phone numbers
    let phoneNumbers = await dbGetPhoneNumbers(auth.workspace.id);
    if (phoneNumbers) {
      setPhoneNumbers(phoneNumbers);
    }

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
      phone: workspacePhoneNumber ? workspacePhoneNumber.slice(0, 1000).trim() : '',
      email: workspaceEmail ? workspaceEmail.slice(0, 1000).trim() : '',
      location: workspaceAddress ? workspaceAddress.slice(0, 1000).trim() : '',
      description: workspaceDescription ? workspaceDescription.slice(0, 1000).trim() : ''
    }

    let res = await dbUpdateWorkspace(auth.workspace.id, _workspace);

    if (res) {
      toast.success('Workspace updated');
      auth.updateWorkspace(_workspace);
    } else {
      toast.error('Error updating workspace');
    }

  }

  const handleUpgrade = async (price_id) => {
    // let url = await getStripeCheckoutSession(price_id);
    // if (url) {
    //   window.location.href = url;
    // }
  }

  const getStripeCheckoutSession = async (price_id) => {

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

  const getStripePortalSession = async () => {

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

  const refreshSubscriptionStatus = async () => {
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

  // Buy number
  const buyNumber = async () => {

    try {

      setLoading(true);

      let newNumber = await buyVapiNumber(buyNumberNickname);

      if (newNumber) {
        // Add phone number to phone numbers database
        let id = uuidv4();
        let phoneNumber = {
            id: id,
            name: buyNumberNickname,
            number: newNumber.number || null,
            vapiId: newNumber.id || null,
            areaCode: buyNumberAreaCode || null,
            provider: 'vapi',
            type: 'bought',
            workspaceId: auth.workspace.id,
            createdBy: auth.user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        // Add phone number to database
        let res = await dbAddPhoneNumber(phoneNumber);
        
        if (res) {
            toast.success('Phone number bought');
            setBuyNumberAreaCode('');
            setBuyNumberNickname('');
            setPhoneNumbers([...phoneNumbers, phoneNumber]);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error('Error buying phone number. Try a different area code.');
        }
      } else {
        setLoading(false);
        toast.error('Error buying phone number. Try a different area code.');
      }

    } catch (error) {
      setLoading(false);
      toast.error('Error buying phone number. Try a different area code.');
    }

  }

  const deleteNumber = async (number) => {

    try {

      // Check if number if associated with an agent
      let agents = await dbGetAgents(auth.workspace.id);
      let agent = agents.find(a => a.phoneNumber === number.id);
      if (agent) {
        toast.error('Cannot delete a phone number associated with a receptionist');
        return;
      }

      setLoading(true);

      // console.log('delete number', number);

      // Delete phone number from database
      let res = await deleteVapiNumber(number.vapiId);
      if (res) {
        // Delete phone number from database
        let dbRes = await dbDeletePhoneNumber(number.id, auth.workspace.id);
        if (dbRes) {
          toast.success('Phone number deleted');
          setPhoneNumbers(phoneNumbers.filter(n => n.id !== number.id));
          setLoading(false);
        } else {
          setLoading(false);
          toast.error('Error deleting phone number from database');
        }
      } else {
        setLoading(false);
        toast.error('Error deleting phone number');
      }

    } catch (error) {
      setLoading(false);
      toast.error('Error deleting phone number');
    }

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

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100, paddingBottom: 100 }}>

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
            <TextArea variant="surface" placeholder="We are a small business that sells widgets." rows={4} maxLength={1000} value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} />
          </Col>
        </Row>

        {/* Save workspace button */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Button variant="solid" onClick={saveWorkspace}>Save changes</Button>
          </Col>
        </Row>

        {/* Phone number */}

        <Heading size='3' as='div' style={{ marginTop: 40, color: 'var(--gray-11)' }}>Phone number</Heading>
        <Separator style={{ width: '100%' }} />

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold">Phone number</Text>
            <Text size="1" as='div' color='gray'>Your receptionist phone number.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            {/* <Button onClick={() => deleteNumber('testing')}>Delete number</Button> */}
            {phoneNumbers.length === 0 ? (
              <Dialog.Root open={buyNumberDialogOpen} onOpenChange={setBuyNumberDialogOpen}>
                <Dialog.Trigger>
                  <Button variant="surface">
                    <Phone size={16} /> Buy number
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>Buy number</Dialog.Title>
                  <VisuallyHidden>
                    <Dialog.Description>Buy a new phone number</Dialog.Description>
                  </VisuallyHidden>

                  {/* <Text size="2" as="div" style={{ marginTop: 10 }}>Area code</Text>
                  <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter the 3-digit area code you want to buy a number in (US only).</Text>
                  <TextField.Root variant="outline" placeholder="415" maxLength={3} type="number" value={buyNumberAreaCode} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberAreaCode(e.target.value)} /> */}

                  <Text size="2" as="div" style={{ marginTop: 10 }}>Nick name</Text>
                  <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter a nickname for the phone number.</Text>
                  <TextField.Root variant="outline" placeholder="My new number" value={buyNumberNickname} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberNickname(e.target.value)} />

                  <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40, marginBottom: 0 }}>
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button variant="solid" onClick={() => buyNumber()} disabled={buyNumberNickname.length === 0 || loading}>
                        Buy number
                      </Button>
                    </Dialog.Close>
                  </Row>

                </Dialog.Content>

              </Dialog.Root>
            ) : (
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 0, paddingLeft: 10 }}>
                  <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                    <Text size="4" as='div' color='gray' style={{ marginRight: 10 }}>{formatPhoneNumber(phoneNumbers[0].number)}</Text>
                    <Button variant="ghost" color="gray" size="1" onClick={() => {
                      navigator.clipboard.writeText(phoneNumbers[0].number);
                      toast.success('Copied to clipboard');
                    }}>
                      <Copy size={16} />
                    </Button>
                  </Row>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <Button variant="ghost" color="gray" size="1" style={{ marginTop: 5 }}><Trash size={16} /> Delete number</Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                      <AlertDialog.Title>Delete phone number</AlertDialog.Title>
                      <AlertDialog.Description>
                        Are you sure you want to delete this phone number? This action cannot be undone.
                      </AlertDialog.Description>
                      <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <AlertDialog.Cancel>
                          <Button variant="soft" color="gray">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button variant="solid" color="red" onClick={() => deleteNumber(phoneNumbers[0])}>Delete</Button>
                        </AlertDialog.Action>
                      </Row>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Col>
              </Row>
            )}
          </Col>
        </Row>

        {/* Billing */}
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

        <Toaster position='top-center' toastOptions={{ className: 'toast' }} />

      </div>

    </div>
  )



}

