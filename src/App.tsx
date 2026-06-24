import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

import StudentDashboardPage from "@/pages/student/DashboardPage";
import StudentComplaintsListPage from "@/pages/student/ComplaintsListPage";
import NewComplaintPage from "@/pages/student/NewComplaintPage";
import ComplaintDetailPage from "@/pages/student/ComplaintDetailPage";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminComplaintsPage from "@/pages/admin/AdminComplaintsPage";
import AdminComplaintDetailPage from "@/pages/admin/AdminComplaintDetailPage";

import SuperAdminUniversitiesPage from "@/pages/super-admin/UniversitiesPage";
import NewUniversityPage from "@/pages/super-admin/NewUniversityPage";
import SuperAdminAnalyticsPage from "@/pages/super-admin/AnalyticsPage";
import SuperAdminChatPage from "@/pages/super-admin/SuperAdminChatPage";
import AdminChatPage from "@/pages/admin/AdminChatPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={<LandingPage />}
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />

            {/* Student */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentComplaintsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <NewComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ComplaintDetailPage />
                </ProtectedRoute>
              }
            />

            {/* SRC Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["src_officer"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={["src_officer"]}>
                  <AdminComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={["src_officer"]}>
                  <AdminComplaintDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute allowedRoles={["src_officer"]}>
                  <AdminChatPage />
                </ProtectedRoute>
              }
            />

            {/* Super Admin */}
            <Route
              path="/super-admin/universities"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminUniversitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/universities/new"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <NewUniversityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/analytics"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/chat"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminChatPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
