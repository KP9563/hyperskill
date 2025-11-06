import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./firebase.js";

const app = express();

// ✅ Middleware setup
app.use(cors());
app.use(bodyParser.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Field Explorer backend API 🚀" });
});

// ✅ Test route to check Firebase connection
app.get("/test-firebase", async (req, res) => {
  try {
    const docRef = await db.collection("testCollection").add({
      message: "Firebase connection successful!",
      timestamp: new Date(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("🔥 Firebase test error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Route to receive data from frontend (Teacher Registration, etc.)
app.post("/submit-data", async (req, res) => {
  try {
    const formData = req.body;

    if (!formData || Object.keys(formData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No form data received.",
      });
    }

    console.log("📥 Received form data:", formData);

    // Save to Firestore
    const docRef = await db.collection("submissions").add({
      ...formData,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Data saved successfully!",
      id: docRef.id,
    });
  } catch (error) {
    console.error("🔥 Error saving data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ✅ Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
