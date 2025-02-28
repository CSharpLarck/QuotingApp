import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, orderBy, getDoc, getDocs, query, where, 
  addDoc, updateDoc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyA3yAXswNzlE_nVwE1Z97LzQJUh3PyUjSY",
  authDomain: "designerblinds-c482a.firebaseapp.com",
  projectId: "designerblinds-c482a",
  storageBucket: "designerblinds-c482a.appspot.com",
  messagingSenderId: "141452257923",
  appId: "1:141452257923:web:74db6313db9391bc2949b6",
  measurementId: "G-JJ77HVBTJX"
};


// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Register a New User
const registerUser = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Store user in Firestore under "users" collection
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export { 
  db, auth, collection, doc, getDoc, orderBy, setDoc, deleteDoc, updateDoc, 
  getDocs, query, where, addDoc, serverTimestamp, 
  signInWithEmailAndPassword, registerUser
};
