import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { Col, Row } from 'react-bootstrap';
import { Button, Spinner, Text, Dialog, TextArea, Card, IconButton, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbUpdateAgent } from '../../utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Plus, Trash } from '@phosphor-icons/react';
import { updateRetellLlmAndAgent } from '../../utilities/retell.js';

export default function FAQ({ agent }) {

  const auth = useRequireAuth();

  const navigate = useNavigate();

  const [faq, setFAQ] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    setFAQ(agent.faq);
    setLoading(false);
  }

  // Save skills
  const saveFAQ = async (newFAQ) => {
    let _agent = {
      ...agent,
      faq: newFAQ,
    }
    let res = await dbUpdateAgent(_agent);
    if (res) {
      // Update Retell LLM and Agent
      await updateRetellLlmAndAgent(_agent);
      toast.success('FAQ updated');
    } else {
      toast.error('Error updating FAQ');
    }
  }

  // Add FAQ
  const addFAQ = async () => {
    if (newQuestion && newAnswer) {
      let newFAQ = { id: uuidv4(), question: newQuestion, answer: newAnswer };
      setFAQ([...faq, newFAQ]);
      setNewQuestion('');
      setNewAnswer('');
      saveFAQ([...faq, newFAQ]);
    }
  }

  // Update FAQ
  const updateFAQ = async (faqId, question, answer) => {
    let newFAQ = faq.map((faq) => {
      if (faq.id === faqId) {
        return { id: faqId, question: question, answer: answer };
      }
      return faq;
    });
    setFAQ(newFAQ);
    saveFAQ(newFAQ);
  }

  // Delete FAQ
  const deleteFAQ = async (faqId) => {
    let newFAQ = faq.filter((faq) => faq.id !== faqId);
    setFAQ(newFAQ);
    saveFAQ(newFAQ);
  }

  // FAQ component
  const FAQ = ({ faq }) => {

    const [question, setQuestion] = useState(faq.question);
    const [answer, setAnswer] = useState(faq.answer);

    if (!faq) {
      return null;
    }
    
    return (
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <Text size="3" as='div' weight="bold">{faq.question}</Text>
        <Text size="2" as='div' style={{ marginTop: 5 }}>{faq.answer}</Text>
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Dialog.Root>
            <Dialog.Trigger>
              <IconButton variant="ghost" size="2" color="gray" style={{ marginRight: 5 }}>
                <Pencil weight="bold" size={16} />
              </IconButton>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title style={{ marginBottom: 0 }}>Edit FAQ</Dialog.Title>
              <Dialog.Description size="1" color="gray">
                Edit this frequently asked question and answer.
              </Dialog.Description>

              <Text as="div" size="2" mb="1" weight="bold">Question</Text>
              <TextArea 
                placeholder="Enter question..."
                defaultValue={question}
                rows={5}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Text as="div" size="2" mb="1" weight="bold" style={{ marginTop: 10 }}>Answer</Text>
              <TextArea
                placeholder="Enter answer..."
                defaultValue={answer}
                rows={5}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                <Dialog.Close>
                  <Button onClick={() => updateFAQ(faq.id, question, answer)}>Save</Button>
                </Dialog.Close>
              </Row>
            </Dialog.Content>
          </Dialog.Root>

          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <IconButton variant="ghost" size="1" color="gray">
                <Trash weight="bold" size={16} />
              </IconButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Title>Delete FAQ</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete this FAQ? This action cannot be undone.
              </AlertDialog.Description>
              <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="red" onClick={() => deleteFAQ(faq.id)}>Delete</Button>
                </AlertDialog.Action>
              </Row>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Row>
      </Card>
    )
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

      {/* FAQ */}    
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
        <Col xs={12} sm={12} md={6} lg={4} xl={4} style={{ padding: 10 }}>
          <Text size="2" as='div' color='gray'>{faq.length} questions</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 10, textAlign: 'right' }}>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="outline">Add <Plus weight="bold" size={16} /></Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title style={{ marginBottom: 0 }}>Add FAQ</Dialog.Title>
              <Dialog.Description size="1" color="gray">
                Add a frequently asked question and answer.
              </Dialog.Description>

              <Text as="div" size="2" mb="1" weight="bold">Question</Text>
              <TextArea placeholder="Enter question..." 
                value={newQuestion}
                rows={5}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <Text as="div" size="2" mb="1" weight="bold" style={{ marginTop: 10 }}>Answer</Text>
              <TextArea
                placeholder="Enter answer..."
                value={newAnswer} 
                rows={5}
                onChange={(e) => setNewAnswer(e.target.value)}
              />

              <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10, marginBottom: 0 }}>
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={addFAQ}>
                    Add FAQ
                  </Button>
                </Dialog.Close>
              </Row>
            </Dialog.Content>
          </Dialog.Root>
        </Col>
      </Row>

      {/* FAQ */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
        <Col xs={12} sm={12} md={12} lg={9} xl={7} style={{ padding: 10 }}>
          {faq.length > 0 && (
            <div style={{ marginTop: 20, width: '100%' }}>
              {faq.map((faq, index) => (
                <FAQ key={index} faq={faq} />
              ))}
            </div>
          )}
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )


}

