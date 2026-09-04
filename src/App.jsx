import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import DirectoryLayout from '@/components/directory/Layout';
import PartnerOnboarding from '@/pages/PartnerOnboarding';
import PrivateMessages from '@/pages/PrivateMessages.jsx';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import AdDetail from '@/pages/AdDetail';
import ServiceDetail from '@/pages/ServiceDetail';
import SupportChat from '@/components/SupportChat';
import SplashScreen from '@/components/SplashScreen';
import { isNativeApp } from '@/lib/nativeApp';

const LoadingScreen = () => (isNativeApp() ? <SplashScreen /> : (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
));

// Code-split main views for faster WebView cold-start and lower initial bundle.
const Directory = lazy(() => import('@/pages/Directory'));
const PartnerDetail = lazy(() => import('@/pages/PartnerDetail'));
const MyProfile = lazy(() => import('@/pages/MyProfile'));
const Messages = lazy(() => import('@/pages/Messages.jsx'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<DirectoryLayout />}>
        <Route path="/" element={<Navigate to="/directory" replace />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/partners/directory/partner/:slug" element={<PartnerDetail />} />
        <Route path="/partner/:slug" element={<PartnerDetail />} />
        <Route path="/become-a-partner" element={<PartnerOnboarding />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/private-messages" element={<PrivateMessages />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ad" element={<AdDetail />} />
        <Route path="/services/:serviceId" element={<ServiceDetail />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SupportChat />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App