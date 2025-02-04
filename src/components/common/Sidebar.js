import React from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import Logo from "./Logo.js";
import { useMediaQuery } from "../../helpers/dom.js";
import { Sidebar, Menu, MenuItem, menuClasses } from 'react-pro-sidebar';
import { Gear, UserCircle, Phone, HouseSimple, SquaresFour, UsersFour, UserCircleGear, ArrowDownRight  } from "@phosphor-icons/react";

export default function SidebarComponent(props) {

  const location = useLocation();
  const navigate = useNavigate();

  let isPageWide = useMediaQuery('(min-width: 960px)');

  if (location.pathname === '/onboarding' || location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname === '/verify-email' || location.pathname === '/onboarding') {
    return (
      <div></div>
    )
  }

  return (
    <Col xs="auto" style={{ position: 'fixed', left: 0, padding: 0, marginTop: 0, height: '100%', overflow: 'hidden', borderRight: '1px solid var(--gray-6)' }}> 
      
      <div style={{ width: '100%', padding: 0, marginTop: 10, textAlign: 'left', paddingLeft: 12, cursor: 'pointer' }}  onClick={() => navigate('/')}>
        { isPageWide ? <Logo width={140} type="logo" /> :  <Logo width={18} type="icon" /> }
      </div>

      {/* <div style={{ width: '100%', padding: 0, marginTop: 10, textAlign: 'left', paddingLeft: 0 }}>
        <DropdownMenu.Root style={{ width: '100%' }}>
          <DropdownMenu.Trigger>
            <Button variant="soft" style={{ width: '100%' }} color="gray">
              { isPageWide ? 'Appointment Reminder' : 'A' }
              { isPageWide && <DropdownMenu.TriggerIcon /> }
            </Button>
          </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
                <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item shortcut="⌘ N">Archive</DropdownMenu.Item>

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
                    <DropdownMenu.Item>Move to folder…</DropdownMenu.Item>

                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Advanced options…</DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>

                <DropdownMenu.Separator />
                <DropdownMenu.Item>Share</DropdownMenu.Item>
                <DropdownMenu.Item>Add to favorites</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item shortcut="⌘ ⌫" color="red">
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div> */}

      <Sidebar 
          collapsed={isPageWide ? false : true}
          width="200px"
          collapsedWidth="45px" 
          backgroundColor="transparent"
          rootStyles={{
            fontFamily: 'Inter Medium',
            border: '0px solid transparent',
            fontSize: '0.85rem',
            marginTop: '10px',
            height: '100vh',
            overflowY: 'hidden',
          }}
          >
          <Menu
              rootStyles={{
                ['.' + menuClasses.button]: {
                  backgroundColor: 'transparent',
                  color: 'var(--gray-11)',
                  padding: '0px 5px 0px 5px',
                  height: '32px',
                  '&:hover': {
                    backgroundColor: 'var(--accent-3)',
                  },
                  [`&.ps-active`]: {
                    color: 'var(--accent-11)',
                    fontFamily: 'Inter Bold',
                    backgroundColor: 'var(--accent-3)',
                  },
                },
                ['.' + menuClasses.icon]: {
                  marginRight: '0px',
                  [`&.ps-active`]: {
                    color: 'var(--accent-11)',
                  },
                },
              }}
              >

              <MenuItem 
                label="Dashboard"
                active={location.pathname === '/dashboard' ? true : false} 
                icon={<HouseSimple size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/dashboard")}>Dashboard
              </MenuItem>

              <MenuItem 
                label="Calls"
                active={location.pathname === '/calls' ? true : false} 
                icon={<ArrowDownRight size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/calls")}>Calls
              </MenuItem>

              {/* <MenuItem 
                label="Agent"
                active={location.pathname === '/agent' ? true : false} 
                icon={<UserCircle size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/agent")}>Agent
              </MenuItem> */}

              {/* <MenuItem 
                label="Agents"
                active={location.pathname === '/agents' ? true : false} 
                icon={<UsersFour size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/agents")}>Agents
              </MenuItem> */}

              <MenuItem 
                label="Receptionist"
                active={location.pathname === '/receptionist' ? true : false} 
                icon={<UserCircleGear size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/receptionist")}>Receptionist
              </MenuItem>

              <MenuItem 
                label="Phone Numbers"
                active={location.pathname === '/phone-numbers' ? true : false} 
                icon={<Phone size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/phone-numbers")}>Phone Numbers
              </MenuItem>


              {/* <MenuItem 
                label="Integrations"
                active={location.pathname === '/integrations' ? true : false} 
                icon={<SquaresFour size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/integrations")}>Integrations
              </MenuItem> */}

              <MenuItem 
                label="Settings"
                active={location.pathname === '/settings' ? true : false} 
                icon={<Gear size={15} weight="bold" />}
                rootStyles={{
                  ['.' + menuClasses.button]: {
                    marginBottom: '0px',
                  },
                }}
                onClick={() => navigate("/settings")}>Settings
              </MenuItem>


            </Menu>
        </Sidebar>
    </Col>
  )

}
