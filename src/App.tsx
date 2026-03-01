import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { CodesOverviewPage } from './pages/dashboard/CodesOverviewPage'
import { CodeDetailPage } from './pages/dashboard/CodeDetailPage'
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage'
import { CollectionsPage } from './pages/dashboard/CollectionsPage'
import { SettingsPage } from './pages/dashboard/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<CodesOverviewPage />} />
          <Route path="codes" element={<CodesOverviewPage />} />
          <Route path="codes/:id" element={<CodeDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
