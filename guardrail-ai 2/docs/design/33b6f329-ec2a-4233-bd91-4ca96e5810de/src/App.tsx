import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { ApprovalsProvider } from './contexts/ApprovalsContext';
import { ThemedToaster } from './components/ThemedToaster';
import { AppShell } from './components/layout/AppShell';
import { Overview } from './pages/Overview';
import { AIShopping } from './pages/AIShopping';
import { SpendingRules } from './pages/SpendingRules';
import { Merchants } from './pages/Merchants';
import { Approvals } from './pages/Approvals';
import { Transactions } from './pages/Transactions';
import { Settings } from './pages/Settings';
import { ComponentSheet } from './pages/ComponentSheet';
import { CheckoutReturn } from './pages/CheckoutReturn';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

interface AppProps {
  darkMode?: boolean;
  overviewEmpty?: boolean;
  checkoutOutcome?: 'success' | 'stopped' | 'cancelled';
  rulesConflict?: boolean;
}

export function App({ darkMode = false, overviewEmpty = false, checkoutOutcome = 'success', rulesConflict = false }: AppProps) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider initialDark={darkMode}>
        <ApprovalsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout/return" element={<CheckoutReturn outcome={checkoutOutcome} />} />
              <Route element={<AppShell />}>
                <Route index element={<Overview empty={overviewEmpty} />} />
                <Route path="/shop" element={<AIShopping />} />
                <Route path="/rules" element={<SpendingRules conflict={rulesConflict} />} />
                <Route path="/merchants" element={<Merchants />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/components" element={<ComponentSheet />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ThemedToaster />
        </ApprovalsProvider>
      </ThemeProvider>
    </MotionConfig>);

}