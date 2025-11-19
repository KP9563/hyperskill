// ===== server.js =====
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized successfully");
}

const db = admin.firestore();

// ✅ REGISTER (Learner or Teacher)
app.post("/register", async (req, res) => {
  try {
    const { email, phone, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const collection = role === "teacher" ? "teachers" : "learners";
    const userRef = db.collection(collection).doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await userRef.set({
      email,
      phone: phone || "",
      password,
      role,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: `${role} registered successfully` });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ LOGIN (Detects whether user is Teacher or Learner)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    let userDoc = null;
    let role = null;

    // 🔍 Check teachers
    const teacherRef = db.collection("teachers").doc(email);
    const teacherDoc = await teacherRef.get();
    if (teacherDoc.exists) {
      userDoc = teacherDoc;
      role = "teacher";
    }

    // 🔍 Check learners if not found in teachers
    if (!userDoc) {
      const learnerRef = db.collection("learners").doc(email);
      const learnerDoc = await learnerRef.get();
      if (learnerDoc.exists) {
        userDoc = learnerDoc;
        role = "learner";
      }
    }

    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userDoc.data();
    if (userData.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // ✅ Return role so frontend can navigate properly
    res.status(200).json({
      success: true,
      message: "Login successful",
      role,
      user: { email: userData.email, role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ ADMIN LOGIN (Fixed email & password)
app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔐 You can customize this
    const ADMIN_EMAIL = "admin@hyperskill.com";
    const ADMIN_PASSWORD = "admin123";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        role: "admin",
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🔥 HyperSkill Backend Running...");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
