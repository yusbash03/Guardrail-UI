import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApprovalsProvider } from './contexts/ApprovalsContext';
import { ThemedToaster } from './components/ThemedToaster';
import { UpdatePrompt } from './components/UpdatePrompt';
import { AppShell } from './components/layout/AppShell';
import { LogoMark } from './components/Logo';
import { Overview } from './pages/Overview';
import { AIShopping } from './pages/AIShopping';
import { SpendingRules } from './pages/SpendingRules';
import { Merchants } from './pages/Merchants';
import { Approvals } from './pages/Approvals';
import { Transactions } from './pages/Transactions';
import { Settings } from './pages/Settings';
import { CheckoutReturn } from './pages/CheckoutReturn';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { isApiError } from './lib/api';

// In-memory cache only — no persister (PWA_REQUIREMENTS.md §4).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: (count, error) => count < 2 && !(isApiError(error) && error.status < 500),
    },
  },
});

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
      <LogoMark className="h-10 w-10 animate-pulse" />
      <Loader2 className="sr-only" aria-label="Loading Guardrail" />
    </div>);

}

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Splash />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return (
    <ApprovalsProvider>
      <Outlet />
    </ApprovalsProvider>);

}

function AnonymousOnly() {
  const { status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route element={<AnonymousOnly />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<RequireAuth />}>
                  <Route path="/checkout/return" element={<CheckoutReturn />} />
                  <Route path="/checkout/cancel" element={<CheckoutReturn cancelled />} />
                  <Route element={<AppShell />}>
                    <Route index element={<Overview />} />
                    <Route path="/shop" element={<AIShopping />} />
                    <Route path="/shop/:conversationId" element={<AIShopping />} />
                    <Route path="/rules" element={<SpendingRules />} />
                    <Route path="/merchants" element={<Merchants />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/approvals/:id" element={<Approvals />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
          <ThemedToaster />
          <UpdatePrompt />
        </ThemeProvider>
      </QueryClientProvider>
    </MotionConfig>);

}
