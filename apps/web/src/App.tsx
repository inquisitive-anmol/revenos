import { Routes, Route } from "react-router-dom";
import LoginPage from "./app/(auth)/login/page";
import SignupPage from "./app/(auth)/signup/page";
import PipelinePage from "./app/(dashboard)/pipeline/page";
import AgentDetailPage from "./app/(dashboard)/agents/[id]/page";
import Home from "./app/Home";
import DashboardPage from "./app/(dashboard)/main/page";
import AgentsPage from "./app/(dashboard)/agents/page";
import PublicAuthRoute from "./components/protectRoutes/authRoutes/page";
import ProtectedRoute from "./components/protectRoutes/protectedRoutes/page";
import CampaignsPage from "./app/(dashboard)/campaign/campaigns/page";
import CampaignDetailsPage from "./app/(dashboard)/campaign/[id]/page";
import CreateCampaignPage from "./app/(dashboard)/campaign/create/page";
import LeadsPage from "./app/(dashboard)/lead/list/page";
import LeadDetailsPage from "./app/(dashboard)/lead/[id]/page";
import MeetingsPage from "./app/(dashboard)/meeting/list/page";
import InviteAcceptPage from "./app/(auth)/invite/[token]/page";
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from "./components/layout/DashboardLayout";
import AnalyticsPage from "./app/(dashboard)/analytics/main/page";
import SettingsPage from "./app/(settings)/settings/page";
import WorkflowBuilderPage from "./app/(dashboard)/agents/builder/[workflowId]/page";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>

      {/* 1. COMPLETELY PUBLIC ROUTES */}
      {/* Accessible to anyone, logged in or not */}
      <Route path="/" element={<Home />} />
      <Route path="/invite/:token" element={<InviteAcceptPage />} />

      {/* 2. AUTH-ONLY ROUTES */}
      {/* Kicks logged-in users to the dashboard */}
      <Route element={<PublicAuthRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 3. PROTECTED ROUTES */}
      {/* Kicks unauthenticated users to /sign-in */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard Layout Group */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="/campaigns/create" element={<CreateCampaignPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
        </Route>

        {/* Unique Builder/Fullscreen Routes (Excluded from dashboard layout) */}
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/agents/builder/:workflowId" element={<WorkflowBuilderPage />} />
      </Route>
    </Routes>
    </>
  );
}
export default App;
