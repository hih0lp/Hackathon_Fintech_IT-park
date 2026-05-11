import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage/LandingPage.jsx'
import LoginPage from '../pages/LoginPage/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx'
import VerificationPage from '../pages/VerificationPage/VerificationPage.jsx'
// import RadarPage from '../pages/RadarPage/RadarPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerificationPage />} />
      </Routes>
    </BrowserRouter>
  )
}
