import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Card, Spinner, Text, Dialog, TextField, VisuallyHidden } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowsLeftRight, CreditCard, Plus, Pencil, Phone } from '@phosphor-icons/react';
import { dbGetPhoneNumbers, dbUpdatePhoneNumber } from '../../utilities/database.js';
import { formatPhoneNumber } from '../../helpers/string.js';

export default function PhoneNumbers() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      phoneNumbers.find(p => p.id === _number.id).name = name;
      setPhoneNumbers(phoneNumbers);
      toast.success('Phone number name updated');
    } else {
      toast.error('Error updating phone number name');
    }
  }

  // Number component
  const Number = ({ number, updatePhoneNumberName }) => {

    const [name, setName] = useState(number.name);

    useEffect(() => {
      setName(number.name);
    }, [number]);

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
            </Row>
          </div>
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

      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10 }}>
          <Text size="1" color='gray'>{phoneNumbers.length} phone numbers</Text>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6} xl={6} style={{ padding: 10, textAlign: 'right' }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid"><Plus /> New number</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item><ArrowsLeftRight /> Connect a number via SIP Trunk</DropdownMenu.Item>
              <DropdownMenu.Item><CreditCard /> Buy a number</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Col>
      </Row>

      <div style={{ position: 'relative', top: 0, width: '100%', paddingRight: 10, paddingBottom: 100, overflow: 'auto', height: 'calc(100vh - 40px)' }}>
        {/* Phone numbers */}
        {phoneNumbers.length > 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
            {phoneNumbers.map((phoneNumber, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4}>
                <Number number={phoneNumber} updatePhoneNumberName={updatePhoneNumberName} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

