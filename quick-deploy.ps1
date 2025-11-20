# Quick EC2 Backend Deployment - Fully Automated
param(
    [Parameter(Mandatory=$true)]
    [string]$AwsSecretKey
)

$env:AWS_ACCESS_KEY_ID = "AKIAU6UJCXHU4MPBR6NY"
$env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "🚀 Starting EC2 Backend Deployment..." -ForegroundColor Cyan

# Deploy CloudFormation stack
Write-Host "`nDeploying EC2 instance..." -ForegroundColor Yellow
aws cloudformation create-stack `
    --stack-name ehr-backend-stack `
    --template-body file://infrastructure/ec2-backend.yaml `
    --parameters ParameterKey=KeyName,ParameterValue=ehr-backend-key `
    --region us-east-1

Write-Host "Waiting for stack creation (this takes ~3-5 minutes)..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete --stack-name ehr-backend-stack --region us-east-1

# Get backend URL
$backendUrl = aws cloudformation describe-stacks `
    --stack-name ehr-backend-stack `
    --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' `
    --output text --region us-east-1

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ EC2 BACKEND DEPLOYED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend URL: $backendUrl" -ForegroundColor Cyan
Write-Host ""

# Update frontend API URL
Write-Host "Updating frontend API URL..." -ForegroundColor Yellow

$apiFilePath = "d:\Internet\Infosys Intern 2025\ehr-ai-system\frontend\src\services\api.js"
$content = Get-Content $apiFilePath -Raw
$content = $content -replace "http://localhost:8000", $backendUrl
$content | Set-Content $apiFilePath

Write-Host "✅ Frontend updated to use: $backendUrl" -ForegroundColor Green

# Rebuild and deploy frontend
Write-Host "`nRebuilding frontend..." -ForegroundColor Yellow
cd "d:\Internet\Infosys Intern 2025\ehr-ai-system\frontend"
npm run build

Write-Host "Deploying to S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://ehr-frontend-48208 --delete

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Frontend: http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
Write-Host "Backend:  $backendUrl" -ForegroundColor Cyan
Write-Host "Health:   $backendUrl/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app is now fully live on AWS! 🚀" -ForegroundColor Green
