import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { //makes auth data available to all child componnets
  const [user, setUser] = useState(null);  //stores the cuurent logged in firebase user and null when logged out
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {   //listens for firebase login/logout ....u--->current firebase user
      if (u) {     //when a user is authenticated
        await u.reload();  //forces firebase to refresh user data

        const freshUser = auth.currentUser;  //gets the refreshed user object
        setUser(freshUser);

        const snap = await getDoc(doc(db, "users", freshUser.uid));  //fetches user document
        setRole(snap.exists() ? snap.data().role : "customer");
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>   {/*make thes available globally */}
      {children}
    </AuthContext.Provider>
  );
};
