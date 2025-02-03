import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Text, Button, Dialog, Callout, AlertDialog, VisuallyHidden, TextField, Card } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Info, Pencil, Trash, Phone } from '@phosphor-icons/react';
import { formatPhoneNumber } from './helpers/string.js';
import { dbGetAgents, dbAddPhoneNumber, dbDeletePhoneNumber, dbUpdatePhoneNumber, dbGetPhoneNumbers } from './utilities/database.js';
import { deleteRetellPhoneNumber, buyRetellPhoneNumber } from './utilities/retell.js';
import { v4 as uuidv4 } from 'uuid';

export default function PhoneNumbers() {

    const auth = useRequireAuth();

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    let isPageWide = useMediaQuery('(min-width: 960px)');

    const [loading, setLoading] = useState(true);
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [buyNumberDialogOpen, setBuyNumberDialogOpen] = useState(false);
    const [buyNumberAreaCode, setBuyNumberAreaCode] = useState('');
    const [buyNumberNickname, setBuyNumberNickname] = useState('');

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

      // Update phone number name
  const updatePhoneNumberName = async (number, name) => {
    let _number = JSON.parse(JSON.stringify(number));
    _number.name = name;
    let success = await dbUpdatePhoneNumber(_number);
    if (success) {
      let _phoneNumbers = phoneNumbers.map(p => {
        if (p.id === _number.id) {
          p.name = name;
        }
        return p;
      });
      setPhoneNumbers(_phoneNumbers);
      toast.success('Phone number name updated');
    } else {
            toast.error('Error updating phone number name');
        }
    }

    // Buy number

    // Delete phone number
    const onDeletePhoneNumber = async (id) => {
        let _phoneNumbers = phoneNumbers.filter(p => p.id !== id);
        setPhoneNumbers(_phoneNumbers);
    }

    // Number component
    const Number = ({ number, updatePhoneNumberName }) => {

        const [name, setName] = useState(number.name);

        useEffect(() => {
            setName(number.name);
        }, [number]);

        const deleteNumber = async () => {

            console.log('Deleting number', number.id);

            try {

                // Check if number if associated with an agent
                let agents = await dbGetAgents(auth.workspace.id);
                let agent = agents.find(a => a.phoneNumberId === number.id);
                if (agent) {
                    toast.error('Cannot delete phone number associated with an agent');
                    return;
                }

                // Delete phone number from database
                let res = await dbDeletePhoneNumber(number.id, auth.workspace.id);
                if (res) {
                    onDeletePhoneNumber(number.id);
                    toast.success('Phone number deleted');
                    // Delete phone number from Retell
                    await deleteRetellPhoneNumber(number.number);
                } else {
                    toast.error('Error deleting phone number');
                }

            } catch (error) {
                console.error('Error deleting phone number', error);
                toast.error('Error deleting phone number');
            }

        }

        return (
            <Card>
                <Row style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, height: 160 }}>
                    <div style={{ width: '100%' }}>
                        <Phone size={26} color='gray' />
                        <Text size="3" as="div" weight="bold" style={{ marginTop: 10 }}>{number.number ? formatPhoneNumber(number.number) : 'No phone number'}</Text>
                        <Text size="2" as="div" color='gray' style={{ marginTop: 0 }}>{number.name}</Text>
                    </div>
                    <div style={{ width: '100%' }}>
                        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, width: '100%' }}>
                            {/* Edit number */}
                            <Dialog.Root>
                                <Dialog.Trigger>
                                    <Button variant="ghost" color="gray"><Pencil weight="bold" size={16} /></Button>
                                </Dialog.Trigger>
                                <Dialog.Content style={{ maxWidth: 450 }}>
                                    <Dialog.Title style={{ marginBottom: 0 }}>Edit name</Dialog.Title>
                                    <Dialog.Description size="1" color="gray">
                                        Edit the name of this phone number.
                                    </Dialog.Description>

                                    <TextField.Root variant="outline" value={name} onChange={(e) => setName(e.target.value)} />

                                    <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40, marginBottom: 0 }}>
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">
                                                Cancel
                                            </Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                            <Button onClick={() => updatePhoneNumberName(number, name)}>
                                                Save
                                            </Button>
                                        </Dialog.Close>
                                    </Row>
                                </Dialog.Content>
                            </Dialog.Root>
                            {/* Delete number */}
                            <AlertDialog.Root>
                                <AlertDialog.Trigger>
                                    <Button variant="ghost" color="red"><Trash weight="bold" size={16} /></Button>
                                </AlertDialog.Trigger>
                                <AlertDialog.Content>
                                    <AlertDialog.Title>Delete {number.number}</AlertDialog.Title>
                                    <AlertDialog.Description>
                                        Are you sure you want to delete this phone number? This action cannot be undone.
                                    </AlertDialog.Description>
                                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                        <AlertDialog.Cancel>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action>
                                            <Button variant="solid" color="red" onClick={deleteNumber}>Delete</Button>
                                        </AlertDialog.Action>
                                    </Row>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
                        </Row>
                    </div>
                </Row>
            </Card>
        )
    }

    // Buy number
    const buyNumber = async () => {
        console.log('Buying number', buyNumberAreaCode, buyNumberNickname);
        setLoading(true);
        let newNumber = await buyRetellPhoneNumber(buyNumberAreaCode, buyNumberNickname);
        if (newNumber) {
            // Add phone number to phone numbers database
            let uuid = uuidv4();
            let phoneNumber = {
                id: uuid,
                name: buyNumberNickname,
                number: newNumber.phone_number || null,
                areaCode: buyNumberAreaCode || null,
                type: 'bought',
                lastModificationTimestamp: newNumber.last_modification_timestamp || null,
                workspaceId: auth.workspace.id,
                createdBy: auth.user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            let res = await dbAddPhoneNumber(phoneNumber);
            if (res) {
                toast.success('Phone number bought');
                setBuyNumberDialogOpen(false);
                setBuyNumberAreaCode('');
                setBuyNumberNickname('');
                setPhoneNumbers([...phoneNumbers, phoneNumber]);
            } else {
                toast.error('Error buying phone number');
            }
        } else {
            toast.error('Error buying phone number');
        }
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
        <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>

            <Heading size='4'>Phone Numbers</Heading>

            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
                <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10 }}>
                    <Text size="1" color='gray'>{phoneNumbers.length} phone numbers</Text>
                </Col>
                <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10, textAlign: 'right' }}>
                    <Button variant="solid" onClick={() => setBuyNumberDialogOpen(true)}><Plus /> Buy New number</Button>
                </Col>
            </Row>


            <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

                {phoneNumbers.length > 0 && (
                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
                        {phoneNumbers.map((phoneNumber, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={4}>
                                <Number number={phoneNumber} updatePhoneNumberName={updatePhoneNumberName} onDeletePhoneNumber={onDeletePhoneNumber} />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Buy number dialog */}
                <Dialog.Root open={buyNumberDialogOpen} onOpenChange={setBuyNumberDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title>Buy number</Dialog.Title>
                        <VisuallyHidden>
                            <Dialog.Description>Buy a new phone number. Enter the area code you want to buy a number in (US only), and add  a nickname for the number.</Dialog.Description>
                        </VisuallyHidden>

                        <Callout.Root>
                            <Callout.Icon>
                                <Info weight="bold" />
                            </Callout.Icon>
                            <Callout.Text as="div">
                                Each number costs $10/month. You can cancel at any time.
                            </Callout.Text>
                        </Callout.Root>

                        <Text size="2" as="div" style={{ marginTop: 10 }}>Area code</Text>
                        <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter the 3-digit area code you want to buy a number in (US only).</Text>
                        <TextField.Root variant="outline" placeholder="415" maxLength={3} type="number" value={buyNumberAreaCode} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberAreaCode(e.target.value)} />

                        <Text size="2" as="div" style={{ marginTop: 20 }}>Nickname</Text>
                        <Text size="1" color='gray' as="div" style={{ marginTop: 0 }}>Enter a nickname for the phone number you want to import. This will be used to identify the phone number in the dashboard.</Text>
                        <TextField.Root variant="outline" placeholder="My new number" value={buyNumberNickname} style={{ marginTop: 5 }} onChange={(e) => setBuyNumberNickname(e.target.value)} />

                        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40, marginBottom: 0 }}>
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
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

            </div>

            <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
        </div>
    )



}

