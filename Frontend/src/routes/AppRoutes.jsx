import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Profile from "../pages/profile/Profile";
import Settings from "../pages/settings/Settings";
import Dashboard from "../pages/dashboard/Dashboard";
import Room from "../pages/room/Room";
import JoinRedirect from "../pages/room/JoinRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root — send everyone to dashboard; ProtectedRoute will bounce
          unauthenticated users to /login automatically */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected routes wrapped in the dashboard layout (sidebar/navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Room and join-redirect stay outside DashboardLayout — full screen, no sidebar */}
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/join/:roomId" element={<JoinRedirect />} />
      </Route>

      {/* Catch-all — any unknown URL redirects home instead of showing a blank page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;