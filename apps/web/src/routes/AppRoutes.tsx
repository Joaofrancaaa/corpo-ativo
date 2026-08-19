import { Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
