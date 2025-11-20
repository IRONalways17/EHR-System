import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Avatar,
  Chip,
} from '@mui/material'
import { Visibility, VisibilityOff, Lock, Person, LocalHospital } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = login(username, password)
    
    if (result.success) {
      // Show loading animation for 8 seconds to ensure GIF is visible
      setTimeout(() => {
        navigate('/dashboard')
      }, 8000)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 25%, rgba(240, 147, 251, 0.9) 50%, rgba(79, 172, 254, 0.9) 75%, rgba(0, 242, 254, 0.9) 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 20s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/info.gif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 0,
        },
      }}
    >
      {/* Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: '200px', md: '400px' },
            height: { xs: '200px', md: '400px' },
            borderRadius: '50%',
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(118,75,162,0.15) 0%, transparent 70%)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${15 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      {/* Loading Animation - Shows after successful login */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <img 
            src="/info.gif" 
            alt="Loading" 
            style={{ 
              width: '200px', 
              height: '200px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            }}
          />
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white',
              fontWeight: 700,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            Authenticating... Please wait
          </Typography>
        </Box>
      )}

      {/* Login Card */}
      <Card
        sx={{
          maxWidth: 450,
          width: '90%',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              }}
            >
              <LocalHospital sx={{ fontSize: 48 }} />
            </Avatar>
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              INFOSYS EHR AI
            </Typography>
            
            <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500, mb: 2 }}>
              Electronic Health Records System
            </Typography>

            <Chip
              label="Infosys Springboard 6.0"
              sx={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                px: 1,
              }}
            />
          </Box>

          {/* Demo Credentials Alert */}
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              background: 'rgba(79, 172, 254, 0.1)',
              border: '1px solid rgba(79, 172, 254, 0.3)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Demo Credentials:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Username: <strong>doctor</strong>
            </Typography>
            <Typography variant="caption">
              Password: <strong>HealthCare@2025</strong>
            </Typography>
          </Alert>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: '200% 200%',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                },
                '&:disabled': {
                  background: 'rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              {loading ? '🔐 Authenticating...' : '🚀 Login to EHR System'}
            </Button>
          </form>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="textSecondary">
              © 2025 Infosys Springboard 6.0 | Aaryan Choudhary
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
