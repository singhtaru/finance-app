import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Login from "./pages/Login";

const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Group = lazy(() => import("./pages/Group"));
const Settlement = lazy(() => import("./pages/Settlement"));
const Profile = lazy(() => import("./pages/Profile"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#03012C] font-semibold">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <Group />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settlement/:id"
            element={
              <ProtectedRoute>
                <Settlement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
