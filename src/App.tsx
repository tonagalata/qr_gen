import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MarketingLayout } from './components/MarketingLayout'
import { LandingPage } from './pages/LandingPage'
import { FeaturesPage } from './pages/FeaturesPage'
import { PricingPage } from './pages/PricingPage'
import { AboutPage } from './pages/AboutPage'
import { FaqPage } from './pages/FaqPage'
import { LearnPage } from './pages/LearnPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { CodesOverviewPage } from './pages/dashboard/CodesOverviewPage'
import { CodeDetailPage } from './pages/dashboard/CodeDetailPage'
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage'
import { CollectionsPage } from './pages/dashboard/CollectionsPage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { TeamPage } from './pages/dashboard/TeamPage'
import { OnboardingPage } from './pages/OnboardingPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-transparent text-slate-900">
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/learn" element={<LearnPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

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
              <Route path="team" element={<TeamPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
