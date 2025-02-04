// Firebase
import { db } from '../use-firebase.js';
import { collection, query, where, getDocs, addDoc, setDoc, limit, deleteDoc, doc, getDoc } from 'firebase/firestore';

// Update workspace
export const dbUpdateWorkspace = async(workspaceId, _workspace) => {
  try {
    const docRef = await setDoc(doc(db, "workspaces", workspaceId), _workspace);
    return true;
  } catch (error) {
    // console.error("Error updating workspace:", error);
    return false;
  }
}

// Update user
export const dbUpdateUser = async(_user) => {
  try {
    const docRef = doc(db, "users", _user.uid);
    await setDoc(docRef, _user);
    return true;
  } catch (error) {
    // console.error("Error updating user:", error);
    return false;
  }
}

// Get phone numbers
export const dbGetPhoneNumbers = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "phonenumbers"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _phoneNumbers = snapshot.docs.map((doc) => doc.data());
    return _phoneNumbers;
  } catch (error) {
    // console.error("Error fetching phone numbers:", error);
    return [];
  }
}

// Update phone number
export const dbUpdatePhoneNumber = async(_phoneNumber) => {
  try {
    const snapshot = await getDocs(query(collection(db, "phonenumbers"), where("workspaceId", "==", _phoneNumber.workspaceId), where("id", "==", _phoneNumber.id), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await setDoc(docRef, _phoneNumber);
    return true;
  } catch (error) {
    // console.error("Error updating phone number:", error);
    return false;
  }
}

// Add phone number
export const dbAddPhoneNumber = async(_phoneNumber) => {
  try {
    const docRef = await addDoc(collection(db, "phonenumbers"), _phoneNumber);
    return docRef.id;
  } catch (error) {
    // console.error("Error adding phone number:", error);
    return false;
  }
}

// Delete phone number
export const dbDeletePhoneNumber = async(phoneNumberId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "phonenumbers"), where("id", "==", phoneNumberId), where("workspaceId", "==", workspaceId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    // console.error("Error deleting phone number:", error);
    return false;
  }
}

// Get calendars
export const dbGetCalendars = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _calendars = snapshot.docs.map((doc) => doc.data());
    return _calendars;
  } catch (error) {
    // console.error("Error fetching calendars:", error);
    return [];
  }
}

// Get calls
export const dbGetCalls = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calls"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _calls = snapshot.docs.map((doc) => doc.data());
    return _calls;
  } catch (error) {
    // console.error("Error fetching calls:", error);
    return [];
  }
}

// Get agent
export const dbGetAgent = async(workspaceId, agentId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("workspaceId", "==", workspaceId), where("id", "==", agentId), limit(1)));
    if (snapshot.empty) {
      return null;
    }
    const _agent = snapshot.docs[0].data();
    return _agent;
  } catch (error) {
    // console.error("Error fetching agent:", error);
    return null;
  }
}

// Create agent
export const dbCreateAgent = async(_agent) => {
  try {
    const docRef = await addDoc(collection(db, "agents"), _agent);
    return docRef.id;
  } catch (error) {
    console.error("Error creating agent:", error);
    return null;
  }
}

// Get all agents 
export const dbGetAgents = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _agents = snapshot.docs.map((doc) => doc.data());
    return _agents;
  } catch (error) {
    // console.error("Error fetching agents:", error);
    return [];
  }
}

// Update agent
export const dbUpdateAgent = async(_agent) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), 
      where("workspaceId", "==", _agent.workspaceId),
      where("id", "==", _agent.id)
    ));
    
    if (snapshot.empty) {
      console.error("Agent not found");
      return false;
    }

    const docRef = doc(db, snapshot.docs[0].ref.path);
    await setDoc(docRef, _agent);
    return true;

  
  } catch (error) {
    // console.error("Error updating agent:", error);
    return false;
  }
}

// Delete agent
export const dbDeleteAgent = async(workspaceId, agentId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("workspaceId", "==", workspaceId), where("id", "==", agentId)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    // console.error("Error deleting agent:", error);
    return false;
  }
}

// Delete call
export const dbDeleteCall = async(workspaceId, callId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calls"), where("workspaceId", "==", workspaceId), where("id", "==", callId)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    // console.error("Error deleting call:", error);
    return false;
  }
}

// Update calendar name
export const dbUpdateCalendarName = async(calendarId, name, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("workspaceId", "==", workspaceId), where("id", "==", calendarId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await setDoc(docRef, { name: name });
    return true;
  } catch (error) {
    // console.error("Error updating calendar name:", error);
    return false;
  }
}

// Delete calendar
export const dbDeleteCalendar = async(calendarId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("workspaceId", "==", workspaceId), where("id", "==", calendarId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = doc(db, snapshot.docs[0].ref.path);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    // console.error("Error deleting calendar:", error);
    return false;
  }
}

