import { Routes, Route } from "react-router-dom";
import LoginPage from "./app/(auth)/login/page";
import SignupPage from "./app/(auth)/signup/page";
import PipelinePage from "./app/(dashboard)/pipeline/page";
import AgentDetailPage from "./app/(dashboard)/agents/page";
import Home from "./app/Home";
import DashboardPage from "./app/(dashboard)/main/page";
import AgentBuilderPage from "./app/(dashboard)/agents/page";
import PublicAuthRoute from "./components/protectRoutes/authRoutes/page";
import ProtectedRoute from "./components/protectRoutes/protectedRoutes/page";
import CampaignsPage from "./app/(dashboard)/campaign/campaigns/page";
import CampaignDetailsPage from "./app/(dashboard)/campaign/[id]/page";
import CreateCampaignPage from "./app/(dashboard)/campaign/create/page";
import LeadsPage from "./app/(dashboard)/lead/list/page";
import LeadDetailsPage from "./app/(dashboard)/lead/[id]/page";
import MeetingsPage from "./app/(dashboard)/meeting/list/page";

function App() {
  return (
    <Routes>

      {/* 1. COMPLETELY PUBLIC ROUTES */}
      {/* Accessible to anyone, logged in or not */}
      <Route path="/" element={<Home />} />

      {/* 2. AUTH-ONLY ROUTES */}
      {/* Kicks logged-in users to the dashboard */}
      <Route element={<PublicAuthRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 3. PROTECTED ROUTES */}
      {/* Kicks unauthenticated users to /sign-in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="/campaigns/create" element={<CreateCampaignPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/agents" element={<AgentBuilderPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
      </Route>
    </Routes>
  );
}
export default App;