# Setup script for AI-Powered EHR System
# Run this script to set up your development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI-Powered EHR System - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host $pythonVersion -ForegroundColor Green

if ($pythonVersion -match "Python 3\.([0-9]+)\.") {
    $minorVersion = [int]$Matches[1]
    if ($minorVersion -lt 9) {
        Write-Host "ERROR: Python 3.9 or higher is required!" -ForegroundColor Red
        exit 1
    }
}

# Create virtual environment
Write-Host "`nCreating virtual environment..." -ForegroundColor Yellow
python -m venv venv
Write-Host "Virtual environment created!" -ForegroundColor Green

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "`nUpgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host "`nInstalling dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "`nCreating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host ".env file created. Please edit it with your Azure OpenAI credentials." -ForegroundColor Green
} else {
    Write-Host "`n.env file already exists." -ForegroundColor Green
}

# Create necessary directories
Write-Host "`nCreating data directories..." -ForegroundColor Yellow
$dirs = @(
    "data\raw\xray",
    "data\raw\ct", 
    "data\raw\mri",
    "data\raw\ultrasound",
    "data\raw\dxa",
    "data\raw\synthetic",
    "data\processed\train",
    "data\processed\validation",
    "data\processed\test",
    "data\output",
    "models\image_enhancement",
    "models\clinical_notes",
    "models\icd10_coding",
    "logs"
)

foreach ($dir in $dirs) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "Directories created!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env with your Azure OpenAI credentials" -ForegroundColor White
Write-Host "2. Run demo: python examples\demo.py" -ForegroundColor White
Write-Host "3. Generate synthetic data for testing" -ForegroundColor White
Write-Host "4. Start the API server: python src\module4_integration\deploy.py" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see docs\QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
