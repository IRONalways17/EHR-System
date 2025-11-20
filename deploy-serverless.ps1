# SERVERLESS AWS DEPLOYMENT - NO EC2 NEEDED!
# Uses Lambda + API Gateway for fully managed backend
#
# PREREQUISITES:
# 1. Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
# 2. Configure AWS credentials: aws configure
#
# USAGE:
# .\deploy-serverless.ps1 -AwsSecretKey "YOUR_SECRET_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$AwsSecretKey,
    
    [Parameter(Mandatory=$false)]
    [string]$AwsAccessKey = "AKIAU6UJCXHUXFCLDLG4"
)

$env:AWS_ACCESS_KEY_ID = $AwsAccessKey
$env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EHR AI - Serverless Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test credentials
Write-Host "`n[1/5] Testing AWS credentials..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS credentials invalid!" -ForegroundColor Red
    Write-Host $identity -ForegroundColor Red
    exit 1
}
Write-Host "✅ Credentials valid!" -ForegroundColor Green

# Build SAM application
Write-Host "`n[2/5] Building Lambda functions..." -ForegroundColor Yellow
cd "d:\Internet\Infosys Intern 2025\ehr-ai-system"

sam build --template infrastructure/serverless-template.yaml --use-container

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete!" -ForegroundColor Green

# Deploy to AWS
Write-Host "`n[3/5] Deploying to AWS..." -ForegroundColor Yellow
sam deploy `
    --template-file .aws-sam/build/template.yaml `
    --stack-name ehr-serverless-api `
    --capabilities CAPABILITY_IAM `
    --region us-east-1 `
    --no-confirm-changeset `
    --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployed to AWS!" -ForegroundColor Green

# Get API URL
Write-Host "`n[4/5] Getting API Gateway URL..." -ForegroundColor Yellow
$apiUrl = aws cloudformation describe-stacks `
    --stack-name ehr-serverless-api `
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' `
    --output text

Write-Host "API URL: $apiUrl" -ForegroundColor Cyan

# Update frontend
Write-Host "`n[5/5] Updating and deploying frontend..." -ForegroundColor Yellow

# Create .env file
$envContent = "VITE_API_URL=$apiUrl"
$envContent | Out-File -FilePath "frontend/.env.production" -Encoding UTF8

# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://ehr-frontend-48208 --delete

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  🎉 SERVERLESS DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
Write-Host "Backend:  $apiUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your app is LIVE on AWS with:" -ForegroundColor Green
Write-Host "   - Lambda functions (serverless)" -ForegroundColor White
Write-Host "   - API Gateway (managed API)" -ForegroundColor White
Write-Host "   - Groq AI (image enhancement, clinical notes, ICD-10)" -ForegroundColor White
Write-Host "   - S3 hosting (frontend)" -ForegroundColor White
Write-Host ""
Write-Host "No servers to manage! Everything is serverless! 🚀" -ForegroundColor Green
