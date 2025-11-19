import { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().role === "admin") {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  if (loading) return <div className="p-8">Checking access...</div>;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedAdminRoute;
