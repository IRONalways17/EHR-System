#!/usr/bin/env pwsh
# AWS Deployment Script for EHR AI System
# Author: Aaryan Choudhary

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EHR AI System - AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$STACK_NAME = "ehr-ai-system"
$REGION = "us-east-1"
$S3_DEPLOYMENT_BUCKET = "ehr-ai-deployment-$((Get-Date).Ticks)"

# Check AWS CLI
Write-Host "[1/8] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check AWS Credentials
Write-Host "[2/8] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1
    Write-Host "✓ AWS credentials configured" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS credentials not configured. Run 'aws configure'" -ForegroundColor Red
    exit 1
}

# Create S3 deployment bucket
Write-Host "[3/8] Creating S3 deployment bucket..." -ForegroundColor Yellow
aws s3 mb s3://$S3_DEPLOYMENT_BUCKET --region $REGION 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment bucket created: $S3_DEPLOYMENT_BUCKET" -ForegroundColor Green
} else {
    Write-Host "! Using existing bucket or creation skipped" -ForegroundColor Yellow
}

# Package Lambda functions
Write-Host "[4/8] Packaging Lambda functions..." -ForegroundColor Yellow
Push-Location backend/lambda_functions
if (Test-Path package) { Remove-Item -Recurse -Force package }
New-Item -ItemType Directory -Path package | Out-Null
pip install -r ../requirements-lambda.txt -t package/ --quiet
Copy-Item *.py package/
Compress-Archive -Path package/* -DestinationPath lambda_functions.zip -Force
Pop-Location
Write-Host "✓ Lambda functions packaged" -ForegroundColor Green

# Deploy CloudFormation stack
Write-Host "[5/8] Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation package `
    --template-file infrastructure/cloudformation-template.yaml `
    --s3-bucket $S3_DEPLOYMENT_BUCKET `
    --output-template-file infrastructure/packaged-template.yaml `
    --region $REGION

aws cloudformation deploy `
    --template-file infrastructure/packaged-template.yaml `
    --stack-name $STACK_NAME `
    --capabilities CAPABILITY_IAM `
    --region $REGION `
    --parameter-overrides Environment=production

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ CloudFormation stack deployed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ CloudFormation deployment failed" -ForegroundColor Red
    exit 1
}

# Get API Gateway URL
Write-Host "[6/8] Retrieving API Gateway URL..." -ForegroundColor Yellow
$API_URL = aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" `
    --output text `
    --region $REGION

Write-Host "✓ API Gateway URL: $API_URL" -ForegroundColor Green

# Update frontend environment
Write-Host "[7/8] Updating frontend configuration..." -ForegroundColor Yellow
@"
VITE_API_URL=$API_URL
VITE_AWS_REGION=$REGION
VITE_ENVIRONMENT=production
"@ | Out-File -FilePath frontend/.env.production -Encoding UTF8
Write-Host "✓ Frontend environment configured" -ForegroundColor Green

# Build and deploy frontend
Write-Host "[8/8] Building and deploying frontend..." -ForegroundColor Yellow
Push-Location frontend
npm install
npm run build

# Create S3 bucket for frontend
$FRONTEND_BUCKET = "ehr-ai-frontend-$((Get-Random -Maximum 99999))"
aws s3 mb s3://$FRONTEND_BUCKET --region $REGION

# Configure bucket for static website hosting
aws s3 website s3://$FRONTEND_BUCKET --index-document index.html --error-document index.html

# Upload frontend build
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete

# Configure static website hosting
aws s3 website s3://$FRONTEND_BUCKET --index-document index.html --error-document index.html

# Make bucket public for website hosting
$policyJson = @"
{
    `"Version`": `"2012-10-17`",
    `"Statement`": [
        {
            `"Sid`": `"PublicReadGetObject`",
            `"Effect`": `"Allow`",
            `"Principal`": `"*`",
            `"Action`": `"s3:GetObject`",
            `"Resource`": `"arn:aws:s3:::$FRONTEND_BUCKET/*`"
        }
    ]
}
"@
$policyJson | Out-File -FilePath bucket-policy.json -Encoding ASCII -NoNewline
aws s3api put-bucket-policy --bucket $FRONTEND_BUCKET --policy file://bucket-policy.json
Remove-Item bucket-policy.json

Pop-Location

$FRONTEND_URL = "http://$FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com"
Write-Host "Frontend deployed to: $FRONTEND_URL" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend URL:  $FRONTEND_URL" -ForegroundColor White
Write-Host "API Gateway:   $API_URL" -ForegroundColor White
Write-Host "Region:        $REGION" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Access the frontend at the URL above" -ForegroundColor White
Write-Host "2. Verify Bedrock model access in AWS Console" -ForegroundColor White
Write-Host "3. Test image enhancement and clinical notes features" -ForegroundColor White
Write-Host ""
