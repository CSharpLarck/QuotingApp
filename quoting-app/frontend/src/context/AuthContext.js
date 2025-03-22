import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, query, where, getDocs, collection } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ Fetch user details from Firestore based on email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("Email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setCurrentUser({ uid: user.uid, ...userData });
          localStorage.setItem("userData", JSON.stringify(userData)); // ✅ Store in localStorage
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("userData"); // ✅ Clear data on logout
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ currentUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
