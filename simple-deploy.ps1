# Simple AWS Deployment Script
# Deploy EHR AI System to AWS

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   EHR AI System - AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$STACK_NAME = "ehr-ai-system"
$REGION = "us-east-1"
$DEPLOYMENT_BUCKET = "ehr-deployment-340663646697"

# Step 1: Package Lambda functions
Write-Host "[1/5] Packaging Lambda functions..." -ForegroundColor Yellow
cd backend\lambda_functions

# Create a simple zip with all Python files
Compress-Archive -Path *.py -DestinationPath lambda-package.zip -Force

Write-Host "  Lambda package created" -ForegroundColor Green

# Step 2: Upload to S3
Write-Host "`n[2/5] Uploading to S3..." -ForegroundColor Yellow
aws s3 cp lambda-package.zip s3://$DEPLOYMENT_BUCKET/lambda-package.zip

Write-Host "  Upload complete" -ForegroundColor Green

# Step 3: Create simplified CloudFormation template
Write-Host "`n[3/5] Creating CloudFormation template..." -ForegroundColor Yellow
cd ..\..

$template = @"
AWSTemplateFormatVersion: '2010-09-09'
Description: EHR AI System - Simplified Deployment

Resources:
  # S3 Bucket for Medical Images
  MedicalImagesBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub 'ehr-medical-images-${AWS::AccountId}'
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
            AllowedMethods: [GET, PUT, POST]
            AllowedOrigins: ['*']

  # DynamoDB Table
  PatientRecordsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: ehr-patient-records
      AttributeDefinitions:
        - AttributeName: patient_id
          AttributeType: S
        - AttributeName: note_id
          AttributeType: S
      KeySchema:
        - AttributeName: patient_id
          KeyType: HASH
        - AttributeName: note_id
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST

  # IAM Role for Lambda
  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: BedrockAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: ['bedrock:*']
                Resource: '*'
        - PolicyName: S3Access
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: ['s3:*']
                Resource:
                  - !GetAtt MedicalImagesBucket.Arn
                  - !Sub '${MedicalImagesBucket.Arn}/*'
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: ['dynamodb:*']
                Resource: !GetAtt PatientRecordsTable.Arn

  # Lambda: Image Enhancement
  ImageEnhancementFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: ehr-image-enhancement
      Runtime: python3.11
      Handler: image_enhancement.lambda_handler
      Role: !GetAtt LambdaRole.Arn
      Timeout: 60
      MemorySize: 2048
      Code:
        S3Bucket: $DEPLOYMENT_BUCKET
        S3Key: lambda-package.zip
      Environment:
        Variables:
          AWS_REGION: !Ref AWS::Region
          BEDROCK_MODEL_ID: anthropic.claude-3-sonnet-20240229-v1:0
          S3_BUCKET_NAME: !Ref MedicalImagesBucket

  # Lambda: Clinical Notes
  ClinicalNotesFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: ehr-clinical-notes
      Runtime: python3.11
      Handler: clinical_notes_generator.lambda_handler
      Role: !GetAtt LambdaRole.Arn
      Timeout: 60
      MemorySize: 1024
      Code:
        S3Bucket: $DEPLOYMENT_BUCKET
        S3Key: lambda-package.zip
      Environment:
        Variables:
          AWS_REGION: !Ref AWS::Region
          BEDROCK_MODEL_ID: anthropic.claude-3-sonnet-20240229-v1:0
          DYNAMODB_TABLE_NAME: !Ref PatientRecordsTable

  # Lambda: ICD-10 Coding
  ICD10CodingFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: ehr-icd10-coding
      Runtime: python3.11
      Handler: icd10_coding.lambda_handler
      Role: !GetAtt LambdaRole.Arn
      Timeout: 30
      MemorySize: 512
      Code:
        S3Bucket: $DEPLOYMENT_BUCKET
        S3Key: lambda-package.zip
      Environment:
        Variables:
          AWS_REGION: !Ref AWS::Region
          BEDROCK_MODEL_ID: anthropic.claude-3-sonnet-20240229-v1:0

  # API Gateway
  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: ehr-ai-api
      Description: EHR AI System API

  # API Gateway Resource - Image Enhancement
  ImageEnhancementResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref ApiGateway
      ParentId: !GetAtt ApiGateway.RootResourceId
      PathPart: image-enhancement

  # API Gateway Method - Image Enhancement
  ImageEnhancementMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ApiGateway
      ResourceId: !Ref ImageEnhancementResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${ImageEnhancementFunction.Arn}/invocations'

  # Lambda Permission - Image Enhancement
  ImageEnhancementPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref ImageEnhancementFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${ApiGateway}/*'

  # API Deployment
  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - ImageEnhancementMethod
    Properties:
      RestApiId: !Ref ApiGateway
      StageName: prod

Outputs:
  ApiUrl:
    Value: !Sub 'https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/prod'
  ImagesBucket:
    Value: !Ref MedicalImagesBucket
  PatientTable:
    Value: !Ref PatientRecordsTable
"@

$template | Out-File -FilePath "infrastructure\simple-template.yaml" -Encoding UTF8
Write-Host "  Template created" -ForegroundColor Green

# Step 4: Deploy CloudFormation
Write-Host "`n[4/5] Deploying to AWS..." -ForegroundColor Yellow
Write-Host "  This may take 3-5 minutes..." -ForegroundColor Gray

aws cloudformation deploy `
  --template-file infrastructure\simple-template.yaml `
  --stack-name $STACK_NAME `
  --capabilities CAPABILITY_IAM `
  --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "  Deployment failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Get outputs
Write-Host "`n[5/5] Getting deployment info..." -ForegroundColor Yellow

$API_URL = aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --region $REGION `
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" `
  --output text

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nAPI Gateway URL:" -ForegroundColor Cyan
Write-Host "  $API_URL" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Enable Bedrock access in AWS Console" -ForegroundColor Yellow
Write-Host "  2. Build and deploy frontend" -ForegroundColor Yellow
Write-Host "  3. Test the application`n" -ForegroundColor Yellow
