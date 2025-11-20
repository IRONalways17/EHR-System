import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImageEnhancement from './pages/ImageEnhancement'
import ClinicalNotes from './pages/ClinicalNotes'
import ICD10Coding from './pages/ICD10Coding'
import PatientManagement from './pages/PatientManagement'
import Patients from './pages/Patients'
import { useAuth } from './context/AuthContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAuthenticated } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // If not authenticated, show only login route
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Gradient Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 20s ease infinite',
          opacity: 0.05,
          zIndex: -2,
        }}
      />
      
      {/* Floating Orbs Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: { xs: '200px', md: '400px' },
              height: { xs: '200px', md: '400px' },
              borderRadius: '50%',
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${15 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </Box>

      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: sidebarOpen ? '240px' : '0px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'transparent',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/image-enhancement" element={<ProtectedRoute><ImageEnhancement /></ProtectedRoute>} />
          <Route path="/clinical-notes" element={<ProtectedRoute><ClinicalNotes /></ProtectedRoute>} />
          <Route path="/icd10-coding" element={<ProtectedRoute><ICD10Coding /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/patient-management" element={<ProtectedRoute><PatientManagement /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
