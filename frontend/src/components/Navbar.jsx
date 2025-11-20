import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Badge, Tooltip, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setNotifAnchor(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleClose()
  }

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar>
        <IconButton
          color="primary"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          {/* Circular Logo with Hover Effect */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid transparent',
              background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.15)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              },
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="EHR AI Logo"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            
            {/* Fallback Icon if logo not found */}
            <LocalHospitalIcon 
              sx={{ 
                fontSize: 28, 
                color: '#667eea',
                display: 'none',
              }} 
            />
          </Box>
          
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              display: { xs: 'none', sm: 'block' },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            EHR AI System
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* AI Powered Badge */}
        <Tooltip title="Powered by AWS Bedrock & Claude AI" arrow>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              mr: 3,
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              animation: 'glow 2s ease-in-out infinite',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            AI Powered
          </Box>
        </Tooltip>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton 
              onClick={handleNotifClick}
              sx={{
                color: '#667eea',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Badge badgeContent={3} color="error" overlap="circular">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: '16px',
                minWidth: 320,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Notifications
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  🎉 Welcome Dr. Saadhana
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Logged in at {user?.loginTime}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ✅ System Status: All Operational
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  AWS Services running smoothly
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  🚀 New Features Available
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Check out the enhanced UI!
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
          
          {/* Profile */}
          <Tooltip title="Profile" arrow>
            <IconButton
              onClick={handleProfileClick}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0) || 'D'}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: '16px',
                minWidth: 280,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Dr. Saadhana
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.role} • {user?.department}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  @{user?.username}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <EmailIcon fontSize="small" sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccessTimeIcon fontSize="small" sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Logged in
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {user?.loginTime}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: '#f5576c',
                '&:hover': {
                  backgroundColor: 'rgba(245, 87, 108, 0.1)',
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#f5576c' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
