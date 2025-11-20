# ONE-COMMAND DEPLOYMENT - Sets up everything on AWS
# Run: .\deploy-all.ps1 -AwsSecretKey "YOUR_SECRET_KEY_HERE"

param(
    [Parameter(Mandatory=$false)]
    [string]$AwsSecretKey,
    
    [Parameter(Mandatory=$false)]
    [string]$BackendUrl
)

$env:AWS_ACCESS_KEY_ID = "AKIAU6UJCXHU4MPBR6NY"
$env:AWS_DEFAULT_REGION = "us-east-1"

if ($AwsSecretKey) {
    $env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EHR AI - AWS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Option 1: Use existing backend URL
if ($BackendUrl) {
    Write-Host "`nUsing provided backend URL: $BackendUrl" -ForegroundColor Green
}
# Option 2: Deploy new EC2 backend
elseif ($AwsSecretKey) {
    Write-Host "`n[STEP 1] Creating EC2 Key Pair..." -ForegroundColor Yellow
    
    # Check if key exists
    $keyExists = aws ec2 describe-key-pairs --key-names ehr-backend-key 2>$null
    if (-not $keyExists) {
        aws ec2 create-key-pair --key-name ehr-backend-key --query 'KeyMaterial' --output text > ehr-backend-key.pem
        Write-Host "✅ Key pair created" -ForegroundColor Green
    } else {
        Write-Host "✅ Key pair already exists" -ForegroundColor Green
    }
    
    Write-Host "`n[STEP 2] Deploying EC2 Backend..." -ForegroundColor Yellow
    
    # Deploy CloudFormation
    $stackExists = aws cloudformation describe-stacks --stack-name ehr-backend-stack 2>$null
    
    if (-not $stackExists) {
        cd "d:\Internet\Infosys Intern 2025\ehr-ai-system"
        
        aws cloudformation create-stack `
            --stack-name ehr-backend-stack `
            --template-body file://infrastructure/ec2-backend.yaml `
            --region us-east-1
        
        Write-Host "Waiting for EC2 to launch (3-5 minutes)..." -ForegroundColor Yellow
        aws cloudformation wait stack-create-complete --stack-name ehr-backend-stack
        Write-Host "✅ EC2 instance created!" -ForegroundColor Green
    } else {
        Write-Host "✅ Stack already exists" -ForegroundColor Green
    }
    
    # Get backend URL from stack
    $BackendUrl = aws cloudformation describe-stacks `
        --stack-name ehr-backend-stack `
        --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' `
        --output text
    
    Write-Host "✅ Backend URL: $BackendUrl" -ForegroundColor Cyan
}
else {
    # Manual mode - use localhost
    Write-Host "`n⚠️  No AWS Secret Key provided" -ForegroundColor Yellow
    Write-Host "Using localhost backend for testing..." -ForegroundColor Yellow
    $BackendUrl = "http://localhost:8000"
}

# Update frontend environment
Write-Host "`n[STEP 3] Configuring Frontend..." -ForegroundColor Yellow

$envContent = @"
VITE_API_URL=$BackendUrl
"@

$envContent | Out-File -FilePath "d:\Internet\Infosys Intern 2025\ehr-ai-system\frontend\.env" -Encoding UTF8
Write-Host "✅ Frontend configured with: $BackendUrl" -ForegroundColor Green

# Build frontend
Write-Host "`n[STEP 4] Building Frontend..." -ForegroundColor Yellow
cd "d:\Internet\Infosys Intern 2025\ehr-ai-system\frontend"
npm run build
Write-Host "✅ Build complete!" -ForegroundColor Green

# Deploy to S3
Write-Host "`n[STEP 5] Deploying to S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://ehr-frontend-48208 --delete
Write-Host "✅ Deployed to S3!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor Cyan
Write-Host ""

if ($BackendUrl -ne "http://localhost:8000") {
    Write-Host "✅ Your app is LIVE on AWS with Groq AI!" -ForegroundColor Green
    Write-Host "   Test it now: http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor White
} else {
    Write-Host "⚠️  Backend running locally" -ForegroundColor Yellow
    Write-Host "   To deploy backend to AWS, run with -AwsSecretKey parameter" -ForegroundColor White
}
