import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/layout/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';
import { useAuth } from './contexts/AuthContext';
import { FormProvider } from './contexts/FormContext';
import TodayAppointments from './features/doctor/TodayAppointments';


const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const AppointmentScheduling = lazy(() => import('./pages/AppointmentScheduling'));
const DoctorAvailability = lazy(() => import('./pages/DoctorAvailability'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const PatientFeedback=lazy(()=>import('./pages/PatientFeedback'));
const AppointmentBooking = lazy(() => import('./features/appointments/AppointmentBooking'));
const ContactSupport = lazy(() => import('./features/contact/ContactSupport'));
const EmergencyContacts = lazy(() => import('./features/emergency/EmergencyContacts'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const PatientRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<PatientDashboard />} />
    <Route path="appointments" element={<AppointmentScheduling />} />
    <Route path="appointments/book" element={<AppointmentBooking />} />
    <Route path="profile" element={<ProfileSettings />} />
    <Route path="feedback" element={<PatientFeedback />} />
    <Route path="*" element={<Navigate to="/app/patient/dashboard" replace />} />
  </Routes>
);

const DoctorRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="today-appointments" element={<TodayAppointments />} />
    <Route path="appointments" element={<AppointmentScheduling />} />
    <Route path="availability" element={<DoctorAvailability />} />
    <Route path="profile" element={<ProfileSettings />} />
    <Route path="*" element={<Navigate to="/app/doctor/dashboard" replace />} />
  </Routes>
);

const RoleBasedRedirect = () => {
  const { user } = useAuth();  
  const dashboardRoutes = {
    patient: '/app/patient/dashboard',
    doctor: '/app/doctor/dashboard',
  }; 
  const redirectPath = dashboardRoutes[user?.role] || '/app/patient/dashboard';
  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <FormProvider>
                    <LandingPage />
                  </FormProvider>
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes with Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Patient Routes */}
              <Route path="patient/*" element={<ProtectedRoute allowedRoles={['patient']}><PatientRoutes /></ProtectedRoute>} />
              
              {/* Doctor Routes */}
              <Route path="doctor/*" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorRoutes /></ProtectedRoute>} />

              {/* Common routes */}
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="contact"
                element={
                  <FormProvider>
                    <ContactSupport />
                  </FormProvider>
                }
              /> 
              <Route path="emergency" element={<EmergencyContacts />} />
            </Route>
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global toast notifications */}
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;