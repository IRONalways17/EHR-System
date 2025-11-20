# EHR AI System - Quick Start Script
# This script starts the backend API server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🏥 EHR AI System - Backend API" -ForegroundColor Cyan  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = "d:\Internet\Infosys Intern 2025\ehr-ai-system\backend"
Set-Location $backendPath

# Check if requirements are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
$fastapi = python -c "import fastapi; print('ok')" 2>$null
if ($fastapi -ne "ok") {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 Starting API Server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Server URL: http://localhost:8000" -ForegroundColor White
Write-Host "📚 API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "💚 Health:     http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Frontend:   http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
python api_server.py
