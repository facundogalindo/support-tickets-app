import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute allowedRoles={["agent"]}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["user", "agent"]}>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;