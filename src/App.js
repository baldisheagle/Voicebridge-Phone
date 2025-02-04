import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";

import { useMediaQuery } from './shared-functions.js';

import { Theme } from "@radix-ui/themes";
import { ThemeContext } from "./Theme.js";
import { Container, Row, Col } from 'react-bootstrap';
import { ProvideAuth } from "./use-firebase.js";
import Login from "./Login.js";
import Signup from "./Signup.js";
import VerifyEmail from "./VerifyEmail.js";
import ForgotPassword from "./ForgotPassword.js";
import NotFound from "./NotFound.js";
import Dashboard from "./Dashboard.js";
import Settings from './Settings.js';
import Calls from './Calls.js';
import Receptionist from './Receptionist.js';
import PhoneNumbers from './PhoneNumbers.js';
import Business from './Business.js';
import Onboarding from './Onboarding.js';
import UserProfile from './Profile.js';
import Profile from './components/common/Profile.js';
import SidebarComponent from './components/common/Sidebar.js';

export default function App() {

  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');
  
  document.body.style = 'background: var(--accent-1)';

  return (
    <ProvideAuth>
      <Router>
        <Theme accentColor="indigo" appearance={theme === 'dark-theme' ? "dark" : "light"}>
          <Container className={`App ${theme}`} fluid style={{ marginTop: 0, padding: 0, backgroundColor: `var(--accent-1)` }}>
            <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 0, marginLeft: 0, marginRight: 0 }}>
              <SidebarComponent />
              <Profile />
              <Col style={{ width: `calc(100% - ${isPageWide ? 200 : 45}px)`, padding: 0, marginTop: 0, marginLeft: isPageWide ? 200 : 45, minHeight: '100vh' }}>
                <Routes>
                  {/* Main */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calls" element={<Calls />} />
                  {/* <Route path="/agents" element={<Agents />} /> */}
                  {/* <Route path="/agent/:agentId" element={<Agent />} /> */}
                  <Route path="/receptionist" element={<Receptionist />} />
                  <Route path="/phone-numbers" element={<PhoneNumbers />} />
                  <Route path="/business" element={<Business />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile" element={<UserProfile />} />
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  {/* Catch all */}
                  <Route path="/notfound" element={<NotFound />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Col>
            </Row>
          </Container>
        </Theme>
      </Router>
    </ProvideAuth>
  );

}
