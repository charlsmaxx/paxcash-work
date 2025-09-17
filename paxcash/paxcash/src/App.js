import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import VirtualAccount from './pages/VirtualAccount';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Wallet from './pages/Wallet';
import Transfer from './pages/Transfer';
import PayBills from './pages/PayBills';
import Airtime from './pages/Airtime';
import Transactions from './pages/Transactions';
import Cards from './pages/Cards';
import KYC from './pages/KYC';
import Support from './pages/Support';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/contact" element={
          <Layout>
            <Contact />
          </Layout>
        } />
        <Route path="/about" element={
          <Layout>
            <About />
          </Layout>
        } />
        <Route path="/pricing" element={
          <Layout>
            <Pricing />
          </Layout>
        } />
        <Route path="/admin" element={
          <AdminDashboard />
        } />
        <Route path="/virtual-account" element={
          <ProtectedRoute>
            <VirtualAccount />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/transfer" element={
          <ProtectedRoute>
            <Transfer />
          </ProtectedRoute>
        } />
        <Route path="/pay-bills" element={
          <ProtectedRoute>
            <PayBills />
          </ProtectedRoute>
        } />
        <Route path="/airtime" element={
          <ProtectedRoute>
            <Airtime />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/cards" element={
          <ProtectedRoute>
            <Cards />
          </ProtectedRoute>
        } />
        <Route path="/kyc" element={
          <ProtectedRoute>
            <KYC />
          </ProtectedRoute>
        } />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
 