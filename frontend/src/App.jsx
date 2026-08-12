import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Public/Home';
import Login from './pages/Public/Login';
import Apply from './pages/Public/Apply';
import ClfLab from './pages/CLFLab/ClfLab';

// Customer Portal
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import MyLoan from './pages/Customer/MyLoan';
import PaymentHistory from './pages/Customer/PaymentHistory';
import Documents from './pages/Customer/Documents';
import Profile from './pages/Customer/Profile';

// Admin Portal
import AdminDashboard from './pages/Admin/AdminDashboard';
import Requests from './pages/Admin/Requests';
import Customers from './pages/Admin/Customers';
import Loans from './pages/Admin/Loans';
import Payments from './pages/Admin/Payments';
import Collateral from './pages/Admin/Collateral';
import AdminDocuments from './pages/Admin/Documents';
import Reports from './pages/Admin/Reports';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Page Content */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/clf-lab" element={<ClfLab />} />

                {/* Customer Portal (Protected) */}
                <Route path="/customer" element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/customer/loan" element={
                  <ProtectedRoute>
                    <MyLoan />
                  </ProtectedRoute>
                } />
                <Route path="/customer/payments" element={
                  <ProtectedRoute>
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                <Route path="/customer/documents" element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } />
                <Route path="/customer/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Portal (Protected ADMIN role only) */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/requests" element={
                  <AdminRoute>
                    <Requests />
                  </AdminRoute>
                } />
                <Route path="/admin/customers" element={
                  <AdminRoute>
                    <Customers />
                  </AdminRoute>
                } />
                <Route path="/admin/loans" element={
                  <AdminRoute>
                    <Loans />
                  </AdminRoute>
                } />
                <Route path="/admin/payments" element={
                  <AdminRoute>
                    <Payments />
                  </AdminRoute>
                } />
                <Route path="/admin/collateral" element={
                  <AdminRoute>
                    <Collateral />
                  </AdminRoute>
                } />
                <Route path="/admin/documents" element={
                  <AdminRoute>
                    <AdminDocuments />
                  </AdminRoute>
                } />
                <Route path="/admin/reports" element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                } />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
