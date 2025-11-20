#!/bin/bash
# EC2 Backend Deployment Script
# Run this on your EC2 instance after SSH

set -e

echo "========================================="
echo "  EHR AI Backend - EC2 Setup"
echo "========================================="

# Update system
echo "[1/5] Updating system..."
sudo yum update -y

# Install Python 3
echo "[2/5] Installing Python..."
sudo yum install python3 python3-pip git -y

# Clone repository
echo "[3/5] Cloning repository..."
cd /home/ec2-user
if [ -d "Infosys-intern-2025" ]; then
    cd Infosys-intern-2025
    git pull
else
    git clone https://github.com/23f2003700/Infosys-intern-2025.git
    cd Infosys-intern-2025
fi

cd ehr-ai-system/backend

# Install Python dependencies
echo "[4/5] Installing dependencies..."
pip3 install --user -r requirements.txt

# Create systemd service
echo "[5/5] Creating service..."
sudo tee /etc/systemd/system/ehr-backend.service > /dev/null <<EOF
[Unit]
Description=EHR AI Backend API with Groq AI
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/Infosys-intern-2025/ehr-ai-system/backend
ExecStart=/usr/bin/python3 api_server.py
Restart=always
Environment="PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin"

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable ehr-backend
sudo systemctl start ehr-backend

# Get status
sleep 3
sudo systemctl status ehr-backend --no-pager

echo ""
echo "========================================="
echo "  ✅ Backend Deployed Successfully!"
echo "========================================="
echo ""
echo "API is running on port 8000"
echo "Test it: curl http://localhost:8000/health"
echo ""
echo "To view logs: sudo journalctl -u ehr-backend -f"
echo "========================================="
