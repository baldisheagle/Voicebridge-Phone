import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Select, Spinner, Text, TextField, Button, Switch, Separator, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { LANGUAGES, VOICES, AMBIENT_SOUNDS } from '../../config/lists.js';
import { dbUpdateAgent, dbGetPhoneNumbers, dbGetAgents, dbDeleteAgent } from '../../utilities/database.js';
import { connectRetellPhoneNumberToAgent, deleteRetellAgent } from '../../utilities/retell.js';
import { updateReceptionistAgent, updateReceptionistLlm } from '../../utilities/receptionist.js';
import { formatPhoneNumber } from '../../helpers/string.js';
import { Trash } from '@phosphor-icons/react';

export default function General({ agent, onDeleteReceptionist }) {

  const auth = useRequireAuth();

  const [language, setLanguage] = useState(agent.language);
  const [agentName, setAgentName] = useState(agent.agentName);
  const [voiceId, setVoiceId] = useState(agent.voiceId);
  const [includeDisclaimer, setIncludeDisclaimer] = useState(agent.includeDisclaimer);
  const [ambientSound, setAmbientSound] = useState(agent.ambientSound);
  const [boostedKeywords, setBoostedKeywords] = useState(agent.boostedKeywords);
  const [agentPhoneNumber, setAgentPhoneNumber] = useState(agent.phoneNumber);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    await dbGetPhoneNumbers(auth.workspace.id).then((p) => {
      setPhoneNumbers(p);
    });
    await dbGetAgents(auth.workspace.id).then((a) => {
      setAgents(a);
    });
    setLoading(false);
  }

  const saveCallSettings = async () => {

    setLoading(true);

    // If the number if not null, make sure the phone number is not connected to another agent that is not this one
    if (agentPhoneNumber) {
      let a = agents.find(a => a.phoneNumber === agentPhoneNumber && a.id !== agent.id);
      if (a) {
        toast.error('This phone number is already connected to another agent');
        setLoading(false);
        return;
      }
    }

    // Create new agent object
    let _agent = {
      ...agent,
      language: language,
      agentName: agentName,
      voiceId: voiceId,
      phoneNumber: agentPhoneNumber,
      includeDisclaimer: includeDisclaimer,
      ambientSound: ambientSound,
      boostedKeywords: boostedKeywords,
    }

    try {

      // Update agent in database
      let res = await dbUpdateAgent(_agent);

      if (res) {
        // Link phone number to agent, if not null
        if (agentPhoneNumber) {
          let phoneNumber = phoneNumbers.find(p => p.id === agentPhoneNumber);
          if (phoneNumber) {
            // Connect phone number to agent
            await connectRetellPhoneNumberToAgent(agent.retellAgentId, phoneNumber.number);
          }
        }

        // Update Retell LLM
        let retellLlm = await updateReceptionistLlm(_agent);

        // Update Retell Agent
        let retellAgent = await updateReceptionistAgent(_agent);

        if (retellLlm && retellAgent) {
          toast.success('Settings updated');
        } else {
          toast.error('Error updating settings');
        }
        setLoading(false);
      } else {
        toast.error('Error updating settings');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Error updating settings');
      setLoading(false);
    }
  }

  const deleteReceptionist = async () => {
    // Delete agent from database
    setLoading(true);
    let res = await dbDeleteAgent(auth.workspace.id, agent.id);
    if (res) {
      // Delete agent from Retell
      let retellRes = await deleteRetellAgent(agent.retellLlmId, agent.retellAgentId);
      if (retellRes) {
        // Call onDeleteReceptionist callback
        onDeleteReceptionist();
        toast.success('Receptionist deleted');
        setLoading(false);
      } else {
        toast.error('Error deleting receptionist');
        setLoading(false);
      }
    } else {
      toast.error('Error deleting receptionist');
      setLoading(false);
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

      {/* Phone number */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Phone number</Text>
          <Text size="1" as='div' color='gray'>The phone number of your business.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Text size="4" weight="medium">{}</Text>
          <Select.Root value={agentPhoneNumber} onValueChange={(value) => setAgentPhoneNumber(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a phone number" />
            <Select.Content>
              <Select.Item value={null}>No number</Select.Item>
              {phoneNumbers.map((phoneNumber) => (
                <Select.Item key={phoneNumber.id} value={phoneNumber.id}>{formatPhoneNumber(phoneNumber.number, 'US')}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Agent's name */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Name</Text>
          <Text size="1" as='div' color='gray'>The name of your receptionist.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="John Doe" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
        </Col>
      </Row>

      {/* Agent's voice */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Voice</Text>
          <Text size="1" as='div' color='gray'>The voice of your receptionist.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={voiceId} onValueChange={(value) => setVoiceId(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a voice" />
            <Select.Content>
              {VOICES.map((option, index) => (
                <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Language */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Language</Text>
          <Text size="1" as='div' color='gray'>The language of your receptionist.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={language} onValueChange={(value) => setLanguage(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select a language" />
            <Select.Content>
              {LANGUAGES.map((option, index) => (
                <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Col>
      </Row>

      {/* Include emergency disclaimer */}
      {/* <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
        <Text size="2" weight="bold">Emergency disclaimer</Text>
        <Text size="1" as='div' color='gray'>At the start of every call, the receptionist announces an emergency disclaimer to hangup and call 911 if the caller is in an emergency.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Switch variant="outline" size="2" checked={includeDisclaimer} onCheckedChange={(checked) => setIncludeDisclaimer(checked)} />
        </Col>
      </Row> */}

      {/* Ambient sound */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Ambient sound</Text>
          <Text size="1" as='div' color='gray'>Play a background sound during calls.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <Select.Root value={ambientSound} onValueChange={(value) => setAmbientSound(value)}>
            <Select.Trigger variant="surface" color="gray" placeholder="Select an ambient sound" />
            <Select.Content>
              {AMBIENT_SOUNDS.map((option, index) => (
                <Select.Item key={index} value={option.value}>{option.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>  
        </Col>
      </Row>
      
      {/* Boosted keywords */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Boosted keywords</Text>
          <Text size="1" as='div' color='gray'>Enter a comma-separated list of words and terms specific to your business that the receptionist will use in their vocabulary.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <TextField.Root variant="surface" placeholder="e.g. subluxation, spondylolisthesis, sciatica" value={boostedKeywords} onChange={(e) => setBoostedKeywords(e.target.value)} />
        </Col>
      </Row>

      {/* TODO: End call on silence timeout */}
      {/* TODO: Max duration of call */}

      {/* Save button */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Button variant="solid" onClick={saveCallSettings}>Save changes</Button>
        </Col>
      </Row>

      <Separator style={{ marginTop: 40, width: '100%' }} />

      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 30 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Delete receptionist</Text>
          <Text size="1" as='div' color='gray'>Permanently delete your receptionist.</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="surface" color='red'><Trash size={16} /> Delete</Button>
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

