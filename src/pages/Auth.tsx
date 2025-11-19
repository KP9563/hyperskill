import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // LOGIN fields
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // SIGNUP fields
  const [signupData, setSignupData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ADMIN fields
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
  });

  // ======================================================
  // NORMAL LOGIN
  // ======================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const user = userCred.user;

      const profileRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(profileRef);

      if (!docSnap.exists()) {
        navigate("/role-selection");
        return;
      }

      const role = docSnap.data().role;

      if (role === "teacher") navigate("/teacher-dashboard");
      else if (role === "learner") navigate("/learner-dashboard");
      else navigate("/role-selection");

      toast.success("Logged in!");
    } catch (err: any) {
      toast.error(err.message);
    }

    setIsLoading(false);
  };

  // ======================================================
  // SIGN UP
  // ======================================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );

      await setDoc(doc(db, "profiles", userCred.user.uid), {
        email: signupData.email,
        phone: signupData.phone,
        role: null,
        createdAt: new Date(),
      });

      toast.success("Account created");
      navigate("/role-selection");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ======================================================
  // ADMIN LOGIN
  // ======================================================
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );

      const user = cred.user;

      // Check Firestore if user is an admin
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        toast.error("Not authorized as admin");
        setIsLoading(false);
        return;
      }

      toast.success("Admin logged in!");
      navigate("/admin-dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }

    setIsLoading(false);
  };

  // ------------------------------------------------------
  // UI (UNCHANGED)
  // ------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            HyperSkill
          </CardTitle>
          <CardDescription className="text-base">
            Making learning easy and accessible
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
                <Button className="w-full bg-gradient-primary" type="submit">
                  Login
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={signupData.phone}
                  onChange={(e) =>
                    setSignupData({ ...signupData, phone: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <Button className="w-full bg-gradient-primary" type="submit">
                  Create Account
                </Button>
              </form>
            </TabsContent>

            {/* ADMIN */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Admin Email"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={adminData.password}
                  onChange={(e) =>
                    setAdminData({ ...adminData, password: e.target.value })
                  }
                />
                <Button className="w-full bg-red-600" type="submit">
                  Admin Login
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
