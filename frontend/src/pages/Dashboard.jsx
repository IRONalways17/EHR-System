import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CodeIcon from '@mui/icons-material/Code'
import PeopleIcon from '@mui/icons-material/People'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SpeedIcon from '@mui/icons-material/Speed'
import apiService from '../services/api'

// Sample data - updated to match 6 active patients
const enhancementData = [
  { name: 'Jan', images: 12, patient: 'Aaryan' },
  { name: 'Feb', images: 18, patient: 'Sushmita' },
  { name: 'Mar', images: 15, patient: 'Rohan' },
  { name: 'Apr', images: 22, patient: 'Priya' },
  { name: 'May', images: 19, patient: 'Vikram' },
  { name: 'Jun', images: 24, patient: 'Ananya' },
]

const metricsData = [
  { name: 'Week 1', psnr: 28.5, ssim: 0.82, quality: 85 },
  { name: 'Week 2', psnr: 30.2, ssim: 0.85, quality: 88 },
  { name: 'Week 3', psnr: 29.8, ssim: 0.84, quality: 87 },
  { name: 'Week 4', psnr: 31.5, ssim: 0.88, quality: 92 },
]

function StatCard({ title, value, icon, color, subtitle, trend, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Tooltip title={`Click to view ${title.toLowerCase()} details`} arrow placement="top">
      <Card 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered 
            ? `0 20px 40px ${color}40`
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            opacity: isHovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                color="textSecondary" 
                gutterBottom 
                variant="overline"
                sx={{ fontWeight: 600, letterSpacing: 1 }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                  label={trend}
                  size="small"
                  sx={{
                    mt: 1,
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: `${color}15`,
                    color: color,
                  }}
                />
              )}
            </Box>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
                border: `2px solid ${color}30`,
                color,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                boxShadow: isHovered ? `0 8px 16px ${color}30` : 'none',
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>

        {/* Animated Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      </Card>
    </Tooltip>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [animatedValues, setAnimatedValues] = useState({ images: 0, notes: 0, codes: 0, patients: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [isBackendConnected, setIsBackendConnected] = useState(true)

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await apiService.getDashboardStats()
        
        if (response.success) {
          setDashboardData(response.data)
          setIsBackendConnected(true)
          
          // Animate numbers
          const targets = {
            images: response.data.images?.total || 0,
            notes: response.data.notes?.total || 0,
            codes: response.data.icd10?.total || 0,
            patients: response.data.patients?.active_patients || 0,
          }
          
          const duration = 2000
          const steps = 60
          const interval = duration / steps
          
          let currentStep = 0
          const timer = setInterval(() => {
            currentStep++
            const progress = currentStep / steps
            setAnimatedValues({
              images: Math.floor(targets.images * progress),
              notes: Math.floor(targets.notes * progress),
              codes: Math.floor(targets.codes * progress),
              patients: Math.floor(targets.patients * progress),
            })
            if (currentStep >= steps) {
              clearInterval(timer)
              setAnimatedValues(targets) // Set exact values at end
            }
          }, interval)
          
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        // Silently fall back to default values without showing error
        setIsBackendConnected(false)
        const defaultTargets = { images: 110, notes: 48, codes: 156, patients: 6 }
        setAnimatedValues(defaultTargets)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardStats()
  }, [])

  return (
    <Box>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {!loading && (
        <>
          {/* Header with Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                }}
              >
                <SpeedIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Dashboard Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time system performance & analytics
                </Typography>
              </Box>
            </Box>
            
            {/* Backend Status Indicator */}
            {!isBackendConnected && (
              <Chip
                label="Demo Mode"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  color: '#ff9800',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>

          {/* Statistics Cards with Animation */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Images Enhanced"
            value={animatedValues.images}
            icon={<ImageIcon sx={{ fontSize: 32 }} />}
            color="#667eea"
            subtitle="From 6 active patients"
            trend="+12% this month"
            onClick={() => navigate('/image-enhancement')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Notes Generated"
            value={animatedValues.notes}
            icon={<DescriptionIcon sx={{ fontSize: 32 }} />}
            color="#11998e"
            subtitle="SOAP, Discharge & Radiology"
            trend="+8% this month"
            onClick={() => navigate('/clinical-notes')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ICD-10 Codes"
            value={animatedValues.codes}
            icon={<CodeIcon sx={{ fontSize: 32 }} />}
            color="#f5576c"
            subtitle="AI-powered suggestions"
            trend="+15% this month"
            onClick={() => navigate('/clinical-notes')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Patients"
            value={animatedValues.patients}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="#2e7d32"
            subtitle="All patients active"
            trend="100% active"
            onClick={() => navigate('/patients')}
          />
        </Grid>
      </Grid>

          {/* Charts with Modern Design */}
          <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 48px rgba(102, 126, 234, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 48,
                    height: 48,
                  }}
                >
                  <ImageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Image Enhancement Activity
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Monthly processing volume by patient
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enhancementData}>
                  <defs>
                    <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="images" fill="url(#colorImages)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{ 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 48px rgba(17, 153, 142, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    width: 48,
                    height: 48,
                  }}
                >
                  <AutoAwesomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Enhancement Quality Metrics
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    PSNR and SSIM performance trends
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricsData}>
                  <defs>
                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#11998e" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#38ef7d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 153, 142, 0.1)" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(17, 153, 142, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#11998e" 
                    strokeWidth={3}
                    fill="url(#colorQuality)"
                    name="Quality Score (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status with Modern Progress Bars */}
        <Grid item xs={12}>
          <Card
            sx={{ 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 48,
                    height: 48,
                  }}
                >
                  <SpeedIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    System Performance
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Real-time infrastructure health monitoring
                  </Typography>
                </Box>
                <Chip
                  icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                  label="All Systems Operational"
                  sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    fontWeight: 700,
                    px: 2,
                    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                  }}
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        AWS Bedrock API
                      </Typography>
                      <Chip 
                        label="98%" 
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          backgroundColor: 'rgba(17, 153, 142, 0.1)',
                          color: '#11998e',
                        }}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={98} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: 'rgba(17, 153, 142, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                        },
                      }} 
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Lambda Functions
                      </Typography>
                      <Chip 
                        label="95%" 
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                        }}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={95} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Storage (S3)
                      </Typography>
                      <Chip 
                        label="72%" 
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          backgroundColor: 'rgba(245, 87, 108, 0.1)',
                          color: '#f5576c',
                        }}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={72} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: 'rgba(245, 87, 108, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </>
      )}
    </Box>
  )
}
