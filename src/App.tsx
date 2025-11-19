import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherRegistration from "./pages/TeacherRegistration";
import LearnerDashboard from "./pages/LearnerDashboard";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ ADDED
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Default route -> Login */}
      <Route path="/" element={<Auth />} />

      {/* After login */}
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* Teacher flow */}
      <Route path="/teacher-registration" element={<TeacherRegistration />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

      {/* Learner flow */}
      <Route path="/learner-dashboard" element={<LearnerDashboard />} />

      {/* Admin flow */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* ✅ ADDED */}

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
