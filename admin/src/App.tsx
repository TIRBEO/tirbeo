import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "./components/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import LandingPagesPage from "./pages/LandingPagesPage"
import ChatLandingPage from "./pages/ChatLandingPage"
import DocsPage from "./pages/DocsPage"
import ChatPage from "./pages/ChatPage"
import AccountsPage from "./pages/AccountsPage"
import UsersPage from "./pages/UsersPage"
import SecurityPage from "./pages/SecurityPage"
import SettingsPage from "./pages/SettingsPage"
import AdminPage from "./pages/AdminPage"
import ApiKeysPage from "./pages/ApiKeysPage"
import IntegrationsPage from "./pages/IntegrationsPage"
import PermissionsPage from "./pages/PermissionsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import NavManagerPage from "./pages/NavManagerPage"
import SystemHealthPage from "./pages/SystemHealthPage"
import EmailSettingsPage from "./pages/EmailSettingsPage"
import UniversalConfigPage from "./pages/UniversalConfigPage"
import AuthSettingsPage from "./pages/AuthSettingsPage"
import ContentApprovalPage from "./pages/ContentApprovalPage"
import SitesManagerPage from "./pages/SitesManagerPage"
import ContentFeaturesPage from "./pages/ContentFeaturesPage"
import ContentPricingPage from "./pages/ContentPricingPage"
import ContentFAQPage from "./pages/ContentFAQPage"
import ContentTeamPage from "./pages/ContentTeamPage"
import ContentTimelinePage from "./pages/ContentTimelinePage"
import ContentMarqueeLogosPage from "./pages/ContentMarqueeLogosPage"
import ContentLandingStatsPage from "./pages/ContentLandingStatsPage"
import ContentNewsletterPage from "./pages/ContentNewsletterPage"
import ContentAnnouncementsPage from "./pages/ContentAnnouncementsPage"
import ContentAppsPage from "./pages/ContentAppsPage"
import ContentShowcasePage from "./pages/ContentShowcasePage"
import ContentFooterPage from "./pages/ContentFooterPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = sessionStorage.getItem("admin_session")
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/landing" element={<LandingPagesPage />} />
        <Route path="/chat-landing" element={<ChatLandingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/nav" element={<NavManagerPage />} />
        <Route path="/admin/system-health" element={<SystemHealthPage />} />
        <Route path="/settings/email" element={<EmailSettingsPage />} />
        <Route path="/admin/audit-log" element={<SecurityPage />} />

        {/* Content Management */}
        <Route path="/content/features" element={<ContentFeaturesPage />} />
        <Route path="/content/pricing" element={<ContentPricingPage />} />
        <Route path="/content/faq" element={<ContentFAQPage />} />
        <Route path="/content/team" element={<ContentTeamPage />} />
        <Route path="/content/timeline" element={<ContentTimelinePage />} />
        <Route path="/content/marquee-logos" element={<ContentMarqueeLogosPage />} />
        <Route path="/content/landing-stats" element={<ContentLandingStatsPage />} />
        <Route path="/content/newsletter" element={<ContentNewsletterPage />} />
        <Route path="/content/announcements" element={<ContentAnnouncementsPage />} />
        <Route path="/content/apps" element={<ContentAppsPage />} />
        <Route path="/content/showcase" element={<ContentShowcasePage />} />
        <Route path="/content/footer" element={<ContentFooterPage />} />

        {/* Core Admin */}
        <Route path="/config" element={<UniversalConfigPage />} />
        <Route path="/settings/auth" element={<AuthSettingsPage />} />
        <Route path="/admin/content-approval" element={<ContentApprovalPage />} />
        <Route path="/sites" element={<SitesManagerPage />} />
      </Route>
    </Routes>
  )
}
