import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, Spinner, Text, Switch, Dialog, TextArea, Card, IconButton, AlertDialog } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbUpdateAgent, dbGetAgent } from '../../utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Plus, Trash } from '@phosphor-icons/react';

export default function Questions() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [agent, setAgent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    dbGetAgent(auth.workspace.id).then((agent) => {
      if (agent) {
        setAgent(agent);
        setQuestions(agent.questions || []);
      } else {
        navigate('/dashboard');
      }
    });
    setLoading(false);
  }

  // Save skills
  const saveQuestions = async (newQuestions) => {
    let _agent = {
      ...agent,
      questions: newQuestions,
    }
    let res = await dbUpdateAgent(_agent);
    if (res) {
      toast.success('Questions updated');
    } else {
      toast.error('Error updating questions');
    }
  }

  // Add Question
  const addQuestion = async () => {
    if (newQuestion) {
      let q = { id: uuidv4(), question: newQuestion };
      setQuestions([...questions, q]);
      setNewQuestion('');
      saveQuestions([...questions, q]);
    }
  }

  // Update Question
  const updateQuestion = async (questionId, question) => {
    let newQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { id: questionId, question: question };
      }
      return q;
    });
    setQuestions(newQuestions);
    saveQuestions(newQuestions);
  }

  // Delete Question
  const deleteQuestion = async (questionId) => {
    let newQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(newQuestions);
    saveQuestions(newQuestions);
  }

  // Question component
  const Question = ({ q }) => {

    const [question, setQuestion] = useState(q);

    if (!q) {
      return null;
    }
    
    return (
      <Card>
        <Text size="2" as='div' weight="bold">{question.question}</Text>
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Dialog.Root>
            <Dialog.Trigger>
              <IconButton variant="ghost" size="2" color="gray" style={{ marginRight: 5 }}>
                <Pencil weight="bold" size={16} />
              </IconButton>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title style={{ marginBottom: 0 }}>Edit Question</Dialog.Title>
              <Dialog.Description size="1" color="gray">
                Edit this question.
              </Dialog.Description>

              <Text as="div" size="2" mb="1" weight="bold">Question</Text>
              <TextArea 
                placeholder="Enter question..."
                defaultValue={question.question}
                rows={5}
                onChange={(e) => setQuestion({ ...question, question: e.target.value })}
              />

              <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                <Dialog.Close>
                  <Button onClick={() => updateQuestion(question.id, question.question)}>Save</Button>
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
              <AlertDialog.Title>Delete Question</AlertDialog.Title>
              <AlertDialog.Description>
                <Text size="2" as='div' weight="bold">Are you sure you want to delete this question? This action cannot be undone.</Text>
              </AlertDialog.Description>
              <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="red" onClick={() => deleteQuestion(question.id)}>Delete</Button>
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

      {/* Questions */}    
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>

        <Col xs={12} sm={12} md={6} lg={4} xl={3} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          <Text size="2" weight="bold">Additional Questions</Text>
        </Col>
        <Col xs={12} sm={12} md={6} lg={5} xl={4} style={{ padding: 0, paddingLeft: 10, textAlign: 'right' }}>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="outline">Add <Plus weight="bold" size={16} /></Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title style={{ marginBottom: 0 }}>Add Question</Dialog.Title>
              <Dialog.Description size="1" color="gray">
                Add a question and response.
              </Dialog.Description>

              <Text as="div" size="2" mb="1" weight="bold">Question</Text>
              <TextArea placeholder="Enter question..." 
                value={newQuestion}
                rows={5}
                onChange={(e) => setNewQuestion(e.target.value)}
              />

              <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10, marginBottom: 0 }}>
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={addQuestion}>
                    Add Question
                  </Button>
                </Dialog.Close>
              </Row>
            </Dialog.Content>
          </Dialog.Root>
        </Col>
      </Row>

      {/* Questions */}
      <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
        <Col xs={12} sm={12} md={12} lg={9} xl={7} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
          {questions.length === 0 && (
            <Text size="2" color="gray">No questions</Text>
          )}
          {questions.length > 0 && (
            <div style={{ marginTop: 20 }}>
              {questions.map((question, index) => (
                <Question key={index} q={question} />
              ))}
            </div>
          )}
        </Col>
      </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
    </div>
  )


}

