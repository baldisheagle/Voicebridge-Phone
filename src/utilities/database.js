// Firebase
import { db } from '../use-firebase.js';
import { collection, query, where, getDocs, addDoc, setDoc, limit, deleteDoc, doc, getDoc } from 'firebase/firestore';

// Update workspace
export const dbUpdateWorkspace = async(workspaceId, _workspace) => {
  try {
    const docRef = await setDoc(doc(db, "workspaces", workspaceId), _workspace);
    return true;
  } catch (error) {
    console.error("Error updating workspace:", error);
    return false;
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
    console.error("Error fetching calls:", error);
    return [];
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
    console.error("Error fetching phone numbers:", error);
    return [];
  }
}

// Get agent
export const dbGetAgent = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return null;
    }
    const _agent = snapshot.docs[0].data();
    return _agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
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
    console.error("Error updating agent:", error);
    return false;
  }
}


