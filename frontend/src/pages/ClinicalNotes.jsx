import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material'
import { toast } from 'react-toastify'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import DescriptionIcon from '@mui/icons-material/Description'
import apiService from '../services/api'

export default function ClinicalNotes() {
  const [noteType, setNoteType] = useState('soap')
  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [clinicalFindings, setClinicalFindings] = useState('')
  const [generatedNote, setGeneratedNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!patientName || !patientId || !patientAge || !clinicalFindings) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Parse clinical findings - each line is a finding
      const findings = clinicalFindings.split('\n').filter(f => f.trim())
      
      // Prepare note data matching Lambda function expectations
      const noteData = {
        note_type: 'soap',
        patient_info: {
          patient_id: patientId,
          name: patientName,
          age: parseInt(patientAge) || 45
        },
        findings: findings
      }

      const result = await apiService.generateClinicalNote(noteData)

      if (result.success) {
        // Lambda returns 'content' field, not 'data.full_note'
        setGeneratedNote(result.content || result.data?.full_note || result.data)
        toast.success('Clinical note generated successfully with Amazon Titan AI!')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(`Error: ${error.message || 'Failed to generate note'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNote)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedNote], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `clinical_note_${patientId}_${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Download started!')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(17, 153, 142, 0.4)',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Clinical Notes Generation
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            AI-powered medical documentation with Amazon Titan
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(17, 153, 142, 0.1)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Patient Information
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Note Type</InputLabel>
                <Select
                  value={noteType}
                  label="Note Type"
                  onChange={(e) => setNoteType(e.target.value)}
                >
                  <MenuItem value="soap">SOAP Note</MenuItem>
                  <MenuItem value="discharge">Discharge Summary</MenuItem>
                  <MenuItem value="radiology">Radiology Report</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Patient Age"
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g., 45"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={12}
                label={
                  noteType === 'soap'
                    ? 'Clinical Findings (one per line)'
                    : noteType === 'discharge'
                    ? 'Hospital Course & Procedures'
                    : 'Imaging Findings'
                }
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
                placeholder={
                  noteType === 'soap'
                    ? 'Patient complains of headache\nBP: 140/90 mmHg\nTemp: 98.6°F'
                    : noteType === 'discharge'
                    ? 'Admitted with chest pain...\nTreated with...'
                    : 'Chest X-ray shows...'
                }
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
                onClick={handleGenerate}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  backgroundSize: '200% 200%',
                  animation: loading ? 'gradient-shift 3s ease infinite' : 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(17, 153, 142, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f8a7e 0%, #30e06d 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(17, 153, 142, 0.5)',
                  },
                  '&:disabled': {
                    background: 'rgba(17, 153, 142, 0.3)',
                  },
                }}
              >
                {loading ? '✨ Generating with AI...' : '🚀 Generate with AI'}
              </Button>

              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%)',
                  border: '2px solid rgba(17, 153, 142, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label="Amazon Titan GenAI (FREE)"
                  size="small"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  ✨ Uses Amazon Titan Text Express for professional medical documentation
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Output Section */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📝 Generated Note
                </Typography>
                {generatedNote && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopy}
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 600,
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.2)',
                        },
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      variant="outlined"
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 600,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#764ba2',
                          background: 'rgba(102, 126, 234, 0.05)',
                        },
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  minHeight: 500,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(241, 243, 245, 0.9) 100%)',
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                {generatedNote || (
                  <Typography color="textSecondary" align="center" sx={{ mt: 10 }}>
                    {loading
                      ? 'Generating clinical note with AI...'
                      : 'Fill in patient information and click "Generate with AI"'}
                  </Typography>
                )}
                {generatedNote}
              </Paper>

              {generatedNote && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Generated: {new Date().toLocaleString()}
                    </Typography>
                    <Chip label="AI-Generated" size="small" color="secondary" />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
