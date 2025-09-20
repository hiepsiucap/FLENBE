#!/bin/bash

# ===============================================
# FLENBE EC2 Setup Script
# ===============================================
# Script để cài đặt và cấu hình EC2 instance
# Run with: bash setup-ec2.sh

set -e

echo "🚀 Starting FLENBE EC2 Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/flenbe
sudo mkdir -p /var/www/flenbe-staging
sudo chown $USER:$USER /var/www/flenbe
sudo chown $USER:$USER /var/www/flenbe-staging

# MongoDB Note
echo ""
echo "📝 MongoDB Database:"
echo "   This script doesn't install MongoDB locally."
echo "   Please use one of these options:"
echo "   • MongoDB Atlas (recommended): https://www.mongodb.com/atlas"
echo "   • External MongoDB server"
echo "   • Add MONGODB connection string to GitHub Secrets"
echo ""

# Configure Nginx for FLENBE
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/flenbe > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Production app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Staging app (if needed)
    location /staging {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/flenbe /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
echo "🔥 Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw --force enable

# Setup PM2 startup
echo "🔧 Setting up PM2 startup..."
pm2 startup
echo "Note: Run the command shown above if you want PM2 to start on boot"

# Create useful aliases
echo "📝 Creating useful aliases..."
cat >> ~/.bashrc << 'EOF'

# FLENBE aliases
alias flenbe-logs="pm2 logs flenbe"
alias flenbe-status="pm2 status"
alias flenbe-restart="pm2 restart flenbe"
alias flenbe-staging-logs="pm2 logs flenbe-staging"
alias flenbe-staging-restart="pm2 restart flenbe-staging"
alias nginx-reload="sudo systemctl reload nginx"
alias nginx-status="sudo systemctl status nginx"
EOF

echo ""
echo "✅ EC2 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add your SSH public key to ~/.ssh/authorized_keys"
echo "2. Configure GitHub Secrets in your repository"
echo "3. Push code to trigger deployment"
echo ""
echo "🔧 Useful commands:"
echo "  pm2 status              - Check PM2 processes"
echo "  pm2 logs flenbe         - View application logs"
echo "  sudo systemctl status nginx - Check Nginx status"
echo "  df -h                   - Check disk space"
echo ""
echo "🌐 Your server is ready for FLENBE deployment!"
