import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { Heading, Spinner, Text, Button, Card, AlertDialog, Dialog, VisuallyHidden, TextField, Callout } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowDown, Info, Plus, Trash } from '@phosphor-icons/react';
import { dbGetPhoneNumbers, dbGetAgents, dbDeletePhoneNumber, dbAddPhoneNumber } from './utilities/database.js';
import { deleteVapiNumber, buyVapiNumber } from './utilities/vapi.js';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneNumber } from './helpers/string.js';

export default function PhoneNumbers() {

    const auth = useRequireAuth();
    let isPageWide = useMediaQuery('(min-width: 960px)');

    const [loading, setLoading] = useState(true);
    const [buyNumberLoading, setBuyNumberLoading] = useState(false);
    const [deleteNumberLoading, setDeleteNumberLoading] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [buyNumberDialogOpen, setBuyNumberDialogOpen] = useState(false);
    const [buyNumberAreaCode, setBuyNumberAreaCode] = useState('760');
    const [buyNumberNickname, setBuyNumberNickname] = useState('Main');

    useEffect(() => {
        if (auth && auth.user && auth.workspace) {
            initialize();
        }
    }, [auth]);

    // Initialize
    const initialize = async () => {
        setLoading(true);
        await dbGetPhoneNumbers(auth.workspace.id).then((p) => {
            setPhoneNumbers(p);
        });
        setLoading(false);
    }

    // Buy new number
    const buyNumber = async () => {

        try {

            setBuyNumberLoading(true);

            let newNumber = await buyVapiNumber(buyNumberNickname, buyNumberAreaCode);

            if (newNumber) {
                // Add phone number to phone numbers database
                // console.log('new number', newNumber);

                let id = uuidv4();
                let phoneNumber = {
                    id: id,
                    name: buyNumberNickname || 'Main',
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
                    setPhoneNumbers([...phoneNumbers, phoneNumber]);
                    setBuyNumberDialogOpen(false);
                    setBuyNumberLoading(false);
                } else {
                    setBuyNumberLoading(false);
                    toast.error('Error buying phone number. Try a different area code.');
                }

            } else {
                setBuyNumberLoading(false);
                // console.log('error buying number');
                toast.error('Error buying phone number. Hint: Try area codes 908, 760, 857.');
            }

        } catch (error) {
            setBuyNumberLoading(false);
            toast.error('Error buying phone number. Hint: Try area codes 908, 760, 857.');
        }

    }

    // Delete phone number
    const deleteNumber = async (number) => {

        try {

            setDeleteNumberLoading(true);

            // Check if number if associated with an agent
            let agents = await dbGetAgents(auth.workspace.id);
            let agent = agents.find(a => a.phoneNumber === number.id);
            
            if (agent) {
                toast.error('Cannot delete a phone number associated with a receptionist');
                setDeleteNumberLoading(false);
                return;
            }

            // Delete phone number from database
            let res = await deleteVapiNumber(number.vapiId);

            if (res) {
                // Delete phone number from database
                let dbRes = await dbDeletePhoneNumber(number.id, auth.workspace.id);
                if (dbRes) {
                    toast.success('Phone number deleted');
                    setPhoneNumbers(phoneNumbers.filter(n => n.id !== number.id));
                    setDeleteNumberLoading(false);
                } else {
                    setDeleteNumberLoading(false);
                    toast.error('Error deleting phone number from database');
                }
            } else {
                setDeleteNumberLoading(false);
                toast.error('Error deleting phone number');
            }

        } catch (error) {
            setDeleteNumberLoading(false);
            toast.error('Error deleting phone number');
        }

    }

    // Import number
    const importNumber = async () => {

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

            <Heading size='4'>Phone Numbers</Heading>

            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                <Col xs={4} sm={4} md={4} lg={4} xl={4} style={{ padding: 10 }}>
                    <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginTop: 0 }}>{phoneNumbers.length} numbers</Text>
                </Col>
                <Col xs={8} sm={8} md={8} lg={8} xl={8} style={{ padding: 10, textAlign: 'right' }}>
                    {/* TODO: Workspace can import as many numbers as they want */}
                    <Button variant="solid" style={{ marginRight: 10 }} disabled><ArrowDown size={16} /> Import { isPageWide ? 'number' : ''}</Button>
                    {/* Workspace gets one free number */}
                    {/* <Button variant="solid" onClick={() => buyNumber()} disabled={phoneNumbers.length >= 1} loading={buyNumberLoading}><Plus /> Buy { isPageWide ? 'number' : ''}</Button> */}
                    <Button variant="solid" onClick={() => setBuyNumberDialogOpen(true)} disabled={phoneNumbers.length > 0} loading={buyNumberLoading}><Plus /> Buy { isPageWide ? 'number' : ''}</Button>
                </Col>
            </Row>

            <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)', paddingBottom: 100 }}>

                {phoneNumbers.length > 0 && (
                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 20 }}>
                        {phoneNumbers.map((phoneNumber, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={4}>
                                <Card>
                                    <Text size="1" weight="bold" as='div' color="gray" style={{ marginTop: 0 }}>{phoneNumber.name}</Text>
                                    <Text size="4" as='div' style={{ marginTop: 5 }}>{formatPhoneNumber(phoneNumber.number ? phoneNumber.number : 'No number')}</Text>
                                    <AlertDialog.Root>
                                        <AlertDialog.Trigger>
                                        <Button variant="ghost" color="gray" size="1" style={{ marginTop: 40 }}><Trash size={16} /> Delete</Button>
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
                                            <Button variant="solid" color="red" onClick={() => deleteNumber(phoneNumber)} loading={deleteNumberLoading}>Delete</Button>
                                            </AlertDialog.Action>
                                        </Row>
                                        </AlertDialog.Content>
                                    </AlertDialog.Root>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

            </div>

            {/* Buy number dialog */}
            <Dialog.Root open={buyNumberDialogOpen} onOpenChange={setBuyNumberDialogOpen}>
                <Dialog.Content>
                <Dialog.Title>Buy number</Dialog.Title>
                <VisuallyHidden>
                    <Dialog.Description>Buy a new phone number. Enter the preferred 3-digit area code (US only), and choose a nickname for the number.</Dialog.Description>
                </VisuallyHidden>

                <Text size="1" as="div" style={{ marginTop: 10, marginBottom: 10 }}>Buy a new phone number. Enter the preferred 3-digit area code (US only), and choose a nickname for the number.</Text>

                <Callout.Root>
                    <Callout.Icon>
                    <Info weight="bold" />
                    </Callout.Icon>
                    <Callout.Text as="div">
                        Try area codes 908, 760, 857.
                    </Callout.Text>
                </Callout.Root>

                <Text size="2" as="div" style={{ marginTop: 10 }}>Area code</Text>
                <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter the 3-digit area code you want to buy a number in (US only).</Text>
                <TextField.Root variant="outline" placeholder="415" maxLength={3} type="number" value={buyNumberAreaCode} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberAreaCode(e.target.value)} />

                <Text size="2" as="div" style={{ marginTop: 20 }}>Nickname</Text>
                <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter a nickname for the phone number you want to import. This will be used to identify the phone number in the dashboard.</Text>
                <TextField.Root variant="outline" placeholder="My new number" value={buyNumberNickname} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberNickname(e.target.value)} />

                <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40, marginBottom: 0 }}>
                    <Dialog.Close>
                    <Button variant="soft" color="gray" style={{ marginRight: 10 }}>
                        Cancel
                    </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                    <Button variant="solid" onClick={() => buyNumber()} disabled={buyNumberAreaCode.length !== 3 || buyNumberNickname.length === 0 || loading}>
                        Buy number
                    </Button>
                    </Dialog.Close>
                </Row>
                
                </Dialog.Content>

            </Dialog.Root>

            <Toaster position='top-center' toastOptions={{ className: 'toast' }} />
        </div>
    )



}

