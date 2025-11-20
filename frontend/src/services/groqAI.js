// Groq Cloud API Direct Integration
// This allows frontend to call AI directly without backend

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "your-groq-api-key-here"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.1-70b-versatile"

export const callGroqAI = async (prompt, systemPrompt = "You are a helpful medical AI assistant.") => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Groq AI Error:', error)
    return null
  }
}

// Image Enhancement AI
export const enhanceImageWithAI = async (imageType, patientName) => {
  const prompt = `As an expert medical AI radiologist, analyze this ${imageType} medical image and provide detailed enhancement recommendations.

Patient: ${patientName}
Image Type: ${imageType}

Provide a professional medical image enhancement report including:
1. **Image Quality Assessment** (score 0-100)
2. **Key Areas Needing Enhancement** (be specific to ${imageType})
3. **Recommended Technical Adjustments**:
   - Contrast adjustment (%)
   - Brightness/Exposure (%)
   - Sharpening intensity
   - Noise reduction level
4. **Expected Diagnostic Improvements**
5. **Clinical Value** of this enhancement

Format as a clear, professional radiology report. Be concise but thorough.`

  const systemPrompt = "You are an expert medical imaging AI assistant specializing in radiology and diagnostic image enhancement. Provide technical, accurate medical insights."

  return await callGroqAI(prompt, systemPrompt)
}

// Clinical Notes Enhancement AI
export const enhanceClinicalNote = async (noteData) => {
  const { patientName, patientId, noteType, subjective, objective, assessment, plan } = noteData

  const prompt = `You are an expert medical documentation specialist. Enhance and complete this clinical note with professional medical insights and recommendations.

**Patient Information:**
- Name: ${patientName}
- ID: ${patientId}
- Note Type: ${noteType}

**Current Documentation:**

SUBJECTIVE: ${subjective}

OBJECTIVE: ${objective}

ASSESSMENT: ${assessment}

PLAN: ${plan}

**Task:** Provide professional medical enhancements including:

1. **Clinical Considerations**: Additional relevant clinical points or red flags
2. **Differential Diagnoses**: 2-3 alternative diagnoses to consider
3. **Follow-up Recommendations**: Specific timelines and monitoring parameters
4. **Patient Education**: Key points patient should understand
5. **Relevant Guidelines**: Any applicable clinical practice guidelines

Format as a professional medical addendum. Be concise, clinically relevant, and evidence-based.`

  const systemPrompt = "You are an experienced physician assistant specializing in medical documentation. Provide clinically accurate, professional, and evidence-based medical insights."

  return await callGroqAI(prompt, systemPrompt)
}

// ICD-10 Coding AI
export const searchICD10WithAI = async (diagnosis) => {
  const prompt = `You are a medical coding expert specializing in ICD-10 diagnosis codes.

Clinical Diagnosis/Description: "${diagnosis}"

Task: Provide the TOP 5 most relevant ICD-10 codes for this diagnosis.

For each code, provide:
1. ICD-10 Code (exact format like E11.9 or I10)
2. Full Official Description
3. Clinical Notes (when to use this code vs similar codes)
4. Confidence Score (0-100%)

Format as JSON array:
[
  {
    "code": "ICD-10 code",
    "description": "Official description",
    "notes": "Clinical guidance",
    "confidence": 95
  }
]

Be medically accurate. Only suggest valid ICD-10 codes.`

  const systemPrompt = "You are an expert medical coder with deep knowledge of ICD-10-CM coding guidelines. Provide accurate, clinically appropriate diagnosis codes."

  const response = await callGroqAI(prompt, systemPrompt)
  
  if (!response) return []

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[.*\]/s)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Failed to parse ICD-10 response:', error)
  }

  return []
}
