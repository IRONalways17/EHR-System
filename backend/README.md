# EHR AI System - Backend API

## Quick Start

### 1. Install Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### 2. Start the API Server
```powershell
python api_server.py
```

The server will start at `http://localhost:8000`

### 3. API Documentation
- Swagger UI: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- Dashboard Stats: http://localhost:8000/api/dashboard/stats

## Database

The system uses SQLite database (`ehr_data.db`) which is automatically created and seeded with initial data on first run.

### Initial Data
- 6 Active Patients (Aaryan, Sushmita, Rohan, Priya, Vikram, Ananya)
- 110 Enhanced Images
- 48 Clinical Notes
- 156 ICD-10 Code Suggestions

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get all dashboard statistics

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{patient_id}` - Get patient details
- `POST /api/patients` - Create new patient

### Images
- `GET /api/images` - Get enhanced images
- `POST /api/images/enhance` - Enhance new image
- `GET /api/images/stats` - Get image statistics

### Clinical Notes
- `GET /api/notes` - Get clinical notes
- `POST /api/notes/generate` - Generate new clinical note
- `GET /api/notes/stats` - Get note statistics

### ICD-10
- `GET /api/icd10` - Get ICD-10 suggestions
- `POST /api/icd10/search` - Search ICD-10 codes
- `GET /api/icd10/stats` - Get ICD-10 statistics

## CORS Configuration

The API allows all origins by default. In production, update the `allow_origins` in `api_server.py` to your specific frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com"],
    ...
)
```

## Database Schema

### Tables
1. **patients** - Patient information
2. **enhanced_images** - Image enhancement records
3. **clinical_notes** - Clinical documentation
4. **icd10_suggestions** - ICD-10 code suggestions

## Testing

Test the API using curl or Postman:

```powershell
# Health check
curl http://localhost:8000/health

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats

# Get all patients
curl http://localhost:8000/api/patients
```
