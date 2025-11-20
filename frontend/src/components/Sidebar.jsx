import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CodeIcon from '@mui/icons-material/Code'
import PeopleIcon from '@mui/icons-material/People'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const DRAWER_WIDTH = 240

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, badge: null },
  { title: 'Image Enhancement', path: '/image-enhancement', icon: <ImageIcon />, badge: 'AI' },
  { title: 'Clinical Notes', path: '/clinical-notes', icon: <DescriptionIcon />, badge: 'GenAI' },
  { title: 'ICD-10 Coding', path: '/icd10-coding', icon: <CodeIcon />, badge: 'ML' },
  { title: 'Patient Management', path: '/patients', icon: <PeopleIcon />, badge: null },
]

export default function Sidebar({ open }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          mt: 8,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(102, 126, 234, 0.1)',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {/* Header Section */}
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <AutoAwesomeIcon 
          sx={{ 
            fontSize: 48, 
            color: '#667eea',
            mb: 1,
            filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
            animation: 'float 3s ease-in-out infinite',
          }} 
        />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Powered by
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            display: 'block',
          }}
        >
          Amazon Titan (FREE)
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)' }} />
      
      <List sx={{ p: 2 }}>
        {menuItems.map((item, index) => {
          const isSelected = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiChip-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 700,
                    },
                  },
                  '&:hover': {
                    background: isSelected 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(102, 126, 234, 0.08)',
                    transform: 'translateX(4px)',
                    boxShadow: isSelected 
                      ? '0 6px 24px rgba(102, 126, 234, 0.5)'
                      : '0 2px 8px rgba(102, 126, 234, 0.1)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? 'white' : '#667eea',
                    minWidth: 40,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                  }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                      color: isSelected ? 'white' : '#667eea',
                      border: 'none',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)', mx: 2 }} />

      {/* Stats Section */}
      <Box sx={{ p: 3, mt: 'auto' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 20, color: '#667eea' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#667eea' }}>
              System Status
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5 }}>
            98% Uptime
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All services operational
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}
