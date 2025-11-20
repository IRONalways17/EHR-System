# Deploy EHR Backend to AWS EC2
# This script creates an EC2 instance and deploys the FastAPI backend

param(
    [Parameter(Mandatory=$true)]
    [string]$AwsSecretKey
)

$env:AWS_ACCESS_KEY_ID = "AKIAU6UJCXHU4MPBR6NY"
$env:AWS_SECRET_ACCESS_KEY = $AwsSecretKey
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EC2 Backend Deployment for EHR AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create key pair
Write-Host "`n[1/6] Creating EC2 Key Pair..." -ForegroundColor Yellow
aws ec2 create-key-pair --key-name ehr-backend-key --query 'KeyMaterial' --output text > ehr-backend-key.pem
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Key pair created: ehr-backend-key.pem" -ForegroundColor Green
}

# Create security group
Write-Host "`n[2/6] Creating Security Group..." -ForegroundColor Yellow
$sgId = aws ec2 create-security-group `
    --group-name ehr-backend-sg `
    --description "Security group for EHR backend" `
    --query 'GroupId' --output text

Write-Host "Security Group ID: $sgId" -ForegroundColor Cyan

# Allow HTTP, HTTPS, and port 8000
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 8000 --cidr 0.0.0.0/0
Write-Host "✅ Security group configured" -ForegroundColor Green

# Launch EC2 instance
Write-Host "`n[3/6] Launching EC2 Instance (t2.micro - Free Tier)..." -ForegroundColor Yellow
$instanceId = aws ec2 run-instances `
    --image-id ami-0c55b159cbfafe1f0 `
    --instance-type t2.micro `
    --key-name ehr-backend-key `
    --security-group-ids $sgId `
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ehr-backend-server}]' `
    --query 'Instances[0].InstanceId' --output text

Write-Host "Instance ID: $instanceId" -ForegroundColor Cyan
Write-Host "Waiting for instance to start..." -ForegroundColor Yellow
aws ec2 wait instance-running --instance-ids $instanceId
Write-Host "✅ Instance running!" -ForegroundColor Green

# Get public IP
Start-Sleep -Seconds 10
$publicIp = aws ec2 describe-instances `
    --instance-ids $instanceId `
    --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  EC2 Instance Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Public IP: $publicIp" -ForegroundColor Cyan
Write-Host "Backend URL: http://${publicIp}:8000" -ForegroundColor Cyan
Write-Host ""

# Create deployment script
Write-Host "`n[4/6] Creating deployment script..." -ForegroundColor Yellow
$deployScript = @"
#!/bin/bash
set -e

echo '========================================='
echo '  Installing Dependencies'
echo '========================================='

# Update system
sudo yum update -y

# Install Python 3.11
sudo yum install python3.11 python3.11-pip -y

# Install git
sudo yum install git -y

echo '========================================='
echo '  Cloning Repository'
echo '========================================='

cd /home/ec2-user
git clone https://github.com/23f2003700/Infosys-intern-2025.git || true
cd Infosys-intern-2025/ehr-ai-system/backend

echo '========================================='
echo '  Installing Python Dependencies'
echo '========================================='

pip3.11 install --user -r requirements.txt

echo '========================================='
echo '  Starting Backend Server'
echo '========================================='

# Create systemd service
sudo tee /etc/systemd/system/ehr-backend.service > /dev/null <<EOF
[Unit]
Description=EHR AI Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/Infosys-intern-2025/ehr-ai-system/backend
ExecStart=/usr/bin/python3.11 api_server.py
Restart=always
Environment="PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin"

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable ehr-backend
sudo systemctl start ehr-backend

echo '========================================='
echo '  Backend Deployed Successfully!'
echo '========================================='
echo 'API URL: http://${publicIp}:8000'
echo 'Health: http://${publicIp}:8000/health'
echo '========================================='
"@

$deployScript | Out-File -FilePath "ec2-deploy.sh" -Encoding UTF8
Write-Host "✅ Deployment script created" -ForegroundColor Green

Write-Host "`n[5/6] Uploading code to EC2..." -ForegroundColor Yellow
Write-Host "Waiting for SSH to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Note: Actual SCP/SSH commands would go here
# For now, we'll create instructions

Write-Host "`n[6/6] Final Steps - Run these commands:" -ForegroundColor Yellow
Write-Host @"

# Connect to EC2:
ssh -i ehr-backend-key.pem ec2-user@$publicIp

# Then on EC2, run:
curl -o deploy.sh https://raw.githubusercontent.com/23f2003700/Infosys-intern-2025/main/ehr-ai-system/backend/deploy-ec2.sh
chmod +x deploy.sh
./deploy.sh

"@ -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Next: Update Frontend API URL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend URL: http://${publicIp}:8000" -ForegroundColor Cyan
Write-Host "Update frontend to use this URL" -ForegroundColor White
Write-Host ""

# Save IP for frontend update
"http://${publicIp}:8000" | Out-File -FilePath "backend-url.txt"
Write-Host "✅ Backend URL saved to backend-url.txt" -ForegroundColor Green
