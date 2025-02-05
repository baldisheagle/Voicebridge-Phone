import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Button, Spinner, Text, TextField, TextArea, Select, Badge } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { TIMEZONE_OFFSETS, HOURS } from '../../config/lists.js';
import { dbUpdateAgent } from '../../utilities/database.js';
import { updateRetellLlmAndAgent } from '../../utilities/retell.js';
import { validateEmail } from '../../helpers/string.js';

export default function BusinessInfo({ agent }) { 

  const auth = useRequireAuth();

  const navigate = useNavigate();

  const [name, setName] = useState(agent.businessInfo.name || '');
  const [description, setDescription] = useState(agent.businessInfo.description || '');
  const [website, setWebsite] = useState(agent.businessInfo.website || '');
  const [location, setLocation] = useState(agent.businessInfo.location || '');
  const [phoneNumber, setPhoneNumber] = useState(agent.businessInfo.phoneNumber || '');
  const [timezone, setTimezone] = useState(agent.businessInfo.timezone);
  const [businessHours, setBusinessHours] = useState(agent.businessInfo.businessHours);
  const [services, setServices] = useState(agent.businessInfo.services || '');
  const [insuranceAccepted, setInsuranceAccepted] = useState(agent.businessInfo.insuranceAccepted || '');
  const [email, setEmail] = useState(agent.businessInfo.email || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(false);
  }

  // Save business profile
  const saveBusinessInfo = async () => {

    if (name.length === 0) {
      toast.error('Business name is required');
      return;
    }

    // Check if email is valid
    if (email.length > 0 && !validateEmail(email)) {
      toast.error('Invalid email');
      return;
    }

    let _agent = {
      ...agent,
      businessInfo: {
        name: name,
        description: description,
        website: website,
        location: location,
        phoneNumber: phoneNumber,
        timezone: timezone,
        businessHours: businessHours,
        services: services,
        insuranceAccepted: insuranceAccepted,
        email: email
      }
    }

    let res = await dbUpdateAgent(_agent);
    if (res) {
      // Update Retell LLM and Agent
      await updateRetellLlmAndAgent(_agent);
      toast.success('Business profile updated');
    } else {
      toast.error('Error updating business profile');
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

      {/* Name */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Business name</Text>
          <Text size="1" as='div' color='gray'>The name of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="Example" value={name} onChange={(e) => setName(e.target.value)} />
        </Col>
      </Row>

      {/* Description */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Description</Text>
          <Text size="1" as='div' color='gray'>A short description of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextArea variant="surface" rows={8} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Col>
      </Row>

      {/* Website */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Website</Text>
          <Text size="1" as='div' color='gray'>The website of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="https://www.example.com" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Col>
      </Row>

      {/* Location */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Location</Text>
          <Text size="1" as='div' color='gray'>The location of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="123 Main St, New York, NY 10001" value={location} onChange={(e) => setLocation(e.target.value)} />
        </Col>
      </Row>

      {/* Phone number */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Phone number</Text>
          <Text size="1" as='div' color='gray'>The phone number of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="123-456-7890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </Col>
      </Row>

      {/* Email */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Email</Text>
          <Text size="1" as='div' color='gray'>The email of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="example@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Col>
      </Row>

      {/* Timezone */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Timezone</Text>
          <Text size="1" as='div' color='gray'>The timezone of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={timezone} onValueChange={(value) => setTimezone(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a timezone" />
            <Select.Content>
              {TIMEZONE_OFFSETS.map((option) => (
                <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Services */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Services</Text>
          <Text size="1" as='div' color='gray'>The services offered by your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextArea variant="surface" rows={3} maxLength={1000} value={services} onChange={(e) => setServices(e.target.value)} />
        </Col>
      </Row>

      {/* Insurance accepted */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Insurance accepted</Text>
          <Text size="1" as='div' color='gray'>The insurance accepted by your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextArea variant="surface" rows={3} maxLength={1000} value={insuranceAccepted} onChange={(e) => setInsuranceAccepted(e.target.value)} />
        </Col>
      </Row>

      {/* Business hours */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Business hours</Text>
          <Text size="1" as='div' color='gray'>The business hours of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} style={{ marginBottom: 15 }}>
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 5 }}>
                {/* <Switch.Root size="1" checked={businessHours[day].isOpen} onCheckedChange={(checked) => setBusinessHours({ ...businessHours, [day]: { ...businessHours[day], isOpen: checked } })} /> */}
                <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)', marginRight: 10 }}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Badge size="1" weight="medium" as='div' style={{ cursor: 'pointer' }} color={businessHours[day].isOpen ? 'green' : 'gray'} onClick={() => setBusinessHours({ ...businessHours, [day]: { ...businessHours[day], isOpen: !businessHours[day].isOpen } })}>{businessHours[day].isOpen ? 'Open' : 'Closed'}</Badge>
              </Row>

              <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 5 }}>
                <Select.Root size="2" value={businessHours[day].open} onValueChange={(value) => setBusinessHours({ ...businessHours, [day]: { ...businessHours[day], open: value } })} disabled={!businessHours[day].isOpen}>
                  <Select.Trigger variant="surface" color="gray" placeholder="Select" style={{ width: `calc(50% - 20px)` }} />
                  <Select.Content>
                    {HOURS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)', marginLeft: 10, marginRight: 10 }}>to</Text>

                <Select.Root variant="outline" size="2" value={businessHours[day].close} onValueChange={(value) => setBusinessHours({ ...businessHours, [day]: { ...businessHours[day], close: value } })} disabled={!businessHours[day].isOpen}>
                  <Select.Trigger placeholder="Select" style={{ width: `calc(50% - 20px)` }} />
                  <Select.Content>
                    {HOURS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              
              </Row>
            </div>
          ))}
        </Col>
      </Row>

      {/* Save button */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveBusinessInfo}>Save changes</Button>
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )



}

