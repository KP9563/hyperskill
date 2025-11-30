// src/App.tsx
import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherRegistration from "./pages/TeacherRegistration";
import LearnerDashboard from "./pages/LearnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// NEW PAGES (You will get these next)
import TeachersList from "./pages/TeachersList";         // shows verified teachers
import TeacherProfile from "./pages/TeachersProfile";   // teacher detail + book session

import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />

      {/* Select role */}
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* Teacher Routes */}
      <Route path="/teacher-registration" element={<TeacherRegistration />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

      {/* Learner Routes */}
      <Route path="/learner-dashboard" element={<LearnerDashboard />} />

      {/* NEW → Teachers list under a skill or field */}
      <Route path="/learner/teachers" element={<TeachersList />} />

      {/* NEW → Individual teacher profile */}
      <Route path="/learner/teacher/:id" element={<TeacherProfile />} />

      {/* Admin Route */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
