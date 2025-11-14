import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SidebarLayout from "./layouts/SidebarLayout";
import { Toaster } from "react-hot-toast";

const RegisterPage = lazy(() => import("./pages/auth/Register"));
const AdminDashboard = lazy(() => import("./pages/Dashboards/AdminDashboard"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const MemberDashboard = lazy(
  () => import("./pages/Dashboards/MemberDashboard")
);

// manager Related
const TasksManagement = lazy(() => import("./pages/Tasks/TasksManagement"));

const WorkingOnPage = lazy(() => import("./pages/WorkingOnPage"));
// Member Related
const MemberTaskPage = lazy(() => import("./pages/Tasks/MemberTaskPage"));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Main Content (right) */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/Admin-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Admin"]}>
                  <SidebarLayout>
                    <AdminDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/User-Management"
              element={
                <RoleProtectedRoute allowedRoles={["Admin"]}>
                  <SidebarLayout>
                    <UserManagement />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />

            {/* Manager Related */}
            <Route
              path="/tasks-management"
              element={
                <RoleProtectedRoute allowedRoles={["Manager"]}>
                  <SidebarLayout>
                    <TasksManagement />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/Manager-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Manager"]}>
                  <SidebarLayout>
                    <AdminDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            {/* Members Related */}
            <Route
              path="/Member-Dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Member"]}>
                  <SidebarLayout>
                    <MemberDashboard />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <RoleProtectedRoute allowedRoles={["Member"]}>
                  <SidebarLayout>
                    <MemberTaskPage />
                  </SidebarLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <SidebarLayout>
                  <WorkingOnPage />
                </SidebarLayout>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
