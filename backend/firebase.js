import admin from "firebase-admin";
import fs from "fs";

// Read and parse the service account JSON file manually
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ✅ Export the Firestore instance
export { db };
