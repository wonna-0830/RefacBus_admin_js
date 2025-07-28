import { createContext, useContext, useEffect, useState } from "react";
import { auth, realtimeDb } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ 로그인된 유저 UID:", user.uid);
        const snapshot = await get(ref(realtimeDb, `admin/${user.uid}`));
        const adminData = snapshot.val();
        if (adminData) {
          setAdmin({ uid: user.uid, ...adminData });
        } else {
          setAdmin(null); // 데이터는 없지만 로그인은 되어 있는 경우
        }
      } else {
        setAdmin(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminContext.Provider value={admin}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
