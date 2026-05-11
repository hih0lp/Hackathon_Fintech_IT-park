import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage/LandingPage.jsx'
import LoginPage from '../pages/LoginPage/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx'
import VerificationPage from '../pages/VerificationPage/VerificationPage.jsx'
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage.jsx'
import ProjectPage from '../pages/ProjectPage/ProjectPage.jsx'
import RadarPage from '../pages/RadarPage/RadarPage.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/radar" element={<RadarPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
