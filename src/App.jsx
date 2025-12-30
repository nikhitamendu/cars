import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBooking from "./pages/AdminBooking";
import AdminEnquiry from "./pages/AdminEnquiry"; // or AdminEnquiry if renamed
import CustomerBooking from "./pages/CustomerBooking";
import Enquiry from "./pages/Enquiry";
import MyEnquiries from "./pages/MyEnquiries";
import CarDetails from "./pages/CarDetails";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <>
      <Navbar />

      <div style={{ paddingTop: "10px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/car/:id" element={<CarDetails />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-enquiries"
            element={
              <ProtectedRoute allowedRole="customer">
                <MyEnquiries />
              </ProtectedRoute>
            }
          />

          <Route
            path="/enquiry/:id"
            element={
              <ProtectedRoute allowedRole="customer">
                <Enquiry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-bookings"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-enquiries"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminEnquiry />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
