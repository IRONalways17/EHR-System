import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import VisibilityIcon from '@mui/icons-material/Visibility'
import apiService from '../services/api'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPatients('active')
      
      if (response.success) {
        setPatients(response.data)
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching patients:', err)
      setError('Failed to load patients. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const getGenderColor = (gender) => {
    return gender === 'Male' ? '#667eea' : '#f5576c'
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default'
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
          }}
        >
          <PeopleIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Active Patients
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Patient management and records overview
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Patients Summary Cards */}
      {!loading && !error && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Patients</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {patients.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Images</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {patients.reduce((sum, p) => sum + (p.total_images || 0), 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Notes</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {patients.reduce((sum, p) => sum + (p.total_notes || 0), 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Patients Table */}
          <Card sx={{ 
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Patient Records
              </Typography>
              
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Patient ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Images</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Visit</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow 
                        key={patient.id}
                        sx={{ 
                          '&:hover': { 
                            background: 'rgba(102, 126, 234, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s'
                          } 
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={patient.patient_id} 
                            size="small" 
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                background: `linear-gradient(135deg, ${getGenderColor(patient.gender)} 0%, ${getGenderColor(patient.gender)}CC 100%)`
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography sx={{ fontWeight: 600 }}>
                              {patient.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>
                          <Chip 
                            label={patient.gender} 
                            size="small"
                            sx={{ 
                              background: `${getGenderColor(patient.gender)}20`,
                              color: getGenderColor(patient.gender),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={patient.status} 
                            size="small"
                            color={getStatusColor(patient.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ImageIcon sx={{ fontSize: 16, color: '#667eea' }} />
                            <Typography sx={{ fontWeight: 600 }}>
                              {patient.total_images || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: '#11998e' }} />
                            <Typography sx={{ fontWeight: 600 }}>
                              {patient.total_notes || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(patient.last_visit).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {patients.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No active patients found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
