# AWS Deployment Script for EHR AI System
# This script deploys Lambda functions and API Gateway for AWS Bedrock integration

param(
    [Parameter(Mandatory=$true)]
    [string]$AwsSecretKey
)

# Set AWS credentials
$env:AWS_ACCESS_KEY_ID = "AKIAU6UJCXHU4MPBR6NY"
$env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EHR AI System - AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test AWS credentials
Write-Host "[1/5] Testing AWS credentials..." -ForegroundColor Yellow
aws sts get-caller-identity
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS credentials invalid!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ AWS credentials valid!" -ForegroundColor Green
Write-Host ""

# Check Bedrock access
Write-Host "[2/5] Checking Amazon Bedrock access..." -ForegroundColor Yellow
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?modelId==`amazon.titan-text-express-v1`]' --output json
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Amazon Bedrock accessible!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Bedrock access limited - enable in AWS Console" -ForegroundColor Yellow
}
Write-Host ""

# Package Lambda function
Write-Host "[3/5] Packaging Lambda functions..." -ForegroundColor Yellow
Set-Location "d:\Internet\Infosys Intern 2025\ehr-ai-system\backend\lambda_functions"

# Create deployment package
if (Test-Path "deployment.zip") {
    Remove-Item "deployment.zip" -Force
}

Compress-Archive -Path "*.py" -DestinationPath "deployment.zip"
Write-Host "✅ Lambda package created!" -ForegroundColor Green
Write-Host ""

# Deploy CloudFormation stack
Write-Host "[4/5] Deploying CloudFormation stack..." -ForegroundColor Yellow
Set-Location "d:\Internet\Infosys Intern 2025\ehr-ai-system\infrastructure"

sam deploy `
    --template-file cloudformation-template.yaml `
    --stack-name ehr-ai-system `
    --capabilities CAPABILITY_IAM `
    --region us-east-1 `
    --no-confirm-changeset `
    --no-fail-on-empty-changeset

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Stack deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Stack deployment had issues" -ForegroundColor Yellow
}
Write-Host ""

# Get API Gateway URL
Write-Host "[5/5] Getting API Gateway URL..." -ForegroundColor Yellow
$ApiUrl = aws cloudformation describe-stacks `
    --stack-name ehr-ai-system `
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' `
    --output text `
    --region us-east-1

if ($ApiUrl) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "API Gateway URL: $ApiUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update frontend API URL to: $ApiUrl" -ForegroundColor White
    Write-Host "2. Rebuild and deploy frontend" -ForegroundColor White
    Write-Host "3. Test AI features!" -ForegroundColor White
} else {
    Write-Host "⚠️ Could not retrieve API URL - check CloudFormation console" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Frontend URL: http://ehr-frontend-48208.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
