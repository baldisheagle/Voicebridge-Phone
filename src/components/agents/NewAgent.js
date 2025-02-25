import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Button, Dialog, VisuallyHidden, Card, Text, Input } from '@radix-ui/themes';
import { Plus, User } from '@phosphor-icons/react';

export default function NewAgent({ onInitAgent }) {

  const [newAgentDialogOpen, setNewAgentDialogOpen] = useState(false);
  
  return (
    <div>
      <Dialog.Root open={newAgentDialogOpen} onOpenChange={setNewAgentDialogOpen}>
        <Dialog.Trigger>
          <Button variant="solid" onClick={() => setNewAgentDialogOpen(true)}><Plus /> New Agent</Button>
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Title style={{ marginTop: 0, color: 'var(--gray-12)' }}>Choose a template</Dialog.Title>
            <VisuallyHidden>
            <Dialog.Description>
              Create a new agent to start using the platform.
            </Dialog.Description>
          </VisuallyHidden>
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}> 
            <Col xs={12} sm={12} md={6} lg={6} xl={6} style={{ padding: 10 }}>
              <Card>
                <User size={16} weight="bold" color="gray" />
                <Text size="4" weight="bold" as='div' style={{ marginTop: 10 }}>Message-taking receptionist</Text>
                <Text size="2" as='div' color="gray" style={{ marginTop: 10 }}>A receptionist that uses natural human-like conversation flow to answer calls, handle customer inquiries and take messages for follow-ups.</Text>
                <Button variant="solid" style={{ marginTop: 40 }}>Create</Button>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6} style={{ padding: 10 }}>
              <Card>
                <User size={16} weight="bold" color="gray" />
                <Text size="4" weight="bold" as='div' style={{ marginTop: 10 }}>Appointment scheduling receptionist</Text>
                <Text size="2" as='div' color="gray" style={{ marginTop: 10 }}>A receptionist that uses natural human-like conversation flow to help callers book appointments, meetings and other events in a calendar.</Text>
                <Button variant="solid" style={{ marginTop: 40 }}>Create</Button>
              </Card>
            </Col>
          </Row>
          <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10, textAlign: 'center' }}>
              <Dialog.Close asChild>
                <Button variant="solid" color="gray" style={{ marginTop: 40 }}>Cancel</Button>
              </Dialog.Close>
            </Col>
          </Row>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}