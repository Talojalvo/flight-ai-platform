import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TripPlanProvider } from './state/TripPlanContext'
import { OnboardingPage } from './pages/OnboardingPage'
import { LoadingPage } from './pages/LoadingPage'
import { ResultsPage } from './pages/ResultsPage'
import { AgentManagementPage } from './pages/AgentManagementPage'

export default function App() {
  return (
    <TripPlanProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/agents" element={<AgentManagementPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <a href="/agents" target="_blank" rel="noopener noreferrer" className="agent-mgmt-link">
          Agents
        </a>
      </BrowserRouter>
    </TripPlanProvider>
  )
}
