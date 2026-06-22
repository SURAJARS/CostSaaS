# DigitalOcean Deployment: Frontend + Backend Setup

## Quick Answer: YES ✅

DigitalOcean can host:

- ✅ Backend (Node.js/Express)
- ✅ Frontend (React)
- ✅ Database (MongoDB)
- ✅ All on the same server OR separate servers

---

## Deployment Options

### Option 1: Both on Same Droplet (Simplest) ⭐

**Best for:** Small to medium catering businesses (50-300 users)

**Architecture:**

```
Single DigitalOcean Droplet (2GB RAM)
├── Backend (Node.js on port 5000)
├── Frontend (React on port 3000)
└── MongoDB (local database)

Cost: ₹600/month
```

**Advantages:**

- Cheapest option (single ₹600/month Droplet)
- Simple deployment
- Easy to manage
- Perfect for starting out

**Disadvantages:**

- Frontend and backend share same resources
- If backend crashes, frontend CDN still works but API down
- Limited scalability

**File Structure:**

```
/root/
├── kasikannu/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   ├── frontend/
│   │   ├── src/
│   │   ├── build/    (production build)
│   │   └── package.json
│   └── nginx/        (reverse proxy config)
```

---

### Option 2: Separate Droplets (Recommended for Scale)

**Best for:** Large catering operations (300+ users, high traffic)

**Architecture:**

```
Droplet 1: Backend (2GB) - ₹600/month
├── Node.js
├── Express
└── MongoDB

Droplet 2: Frontend (1GB) - ₹300/month
├── React App
└── Nginx

Load Balancer: ₹50/month (optional)

Total Cost: ₹950-1,000/month
```

**Advantages:**

- Frontend and backend independent
- Frontend stays up even if backend crashes
- Easy to scale each separately
- Better performance isolation

**Disadvantages:**

- Higher cost (2 Droplets)
- Slightly more complex setup
- Requires load balancer for production

---

### Option 3: DigitalOcean App Platform (Easiest) 🚀

**Best for:** Developers who want zero DevOps hassle

**Architecture:**

```
DigitalOcean App Platform
├── Frontend Service (React build)
├── Backend Service (Node.js)
└── Database (MongoDB Atlas)

Cost: ₹800-1,500/month (auto-scaling)
```

**Advantages:**

- ✅ One-click deploy from GitHub
- ✅ Automatic scaling
- ✅ Built-in SSL/HTTPS
- ✅ Automatic updates
- ✅ Environment variables management
- ✅ No Docker knowledge needed

**Disadvantages:**

- ❌ Slightly more expensive than Droplet
- ❌ Less control over configuration

---

## Recommended Setup: Same Droplet + Nginx

### Architecture:

```
User Browser
    ↓
DigitalOcean Droplet (2GB) - ₹600/month
    ├── Nginx (Reverse Proxy)
    │   ├── Port 80 → Frontend (React)
    │   └── Port 443 → Backend API
    ├── Frontend (React)
    │   └── localhost:3000
    ├── Backend (Node.js)
    │   └── localhost:5000
    └── MongoDB
        └── localhost:27017

Total Cost: ₹600/month
```

### Benefits:

- Single monthly fee (₹600)
- Nginx handles routing
- SSL certificate for both
- Easy to manage
- Scalable to separate droplets later

---

## Step-by-Step Deployment (Same Droplet)

### Step 1: Create DigitalOcean Droplet

1. Go to https://www.digitalocean.com
2. Create account (get ₹2,000 free credits)
3. Click "Create" → "Droplet"
4. Select:
   - **Image:** Ubuntu 22.04 LTS
   - **Size:** 2GB RAM, 50GB SSD (₹600/month)
   - **Region:** India (Bangalore)
   - **Auth:** SSH keys (recommended)

### Step 2: Connect via SSH

```bash
# On your local computer
ssh root@your_server_ip

# Example:
ssh root@64.227.123.45
```

### Step 3: Install Requirements

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
curl https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Clone Kasikannu Repository

```bash
cd /root
git clone https://github.com/SURAJARS/kasikannu.git
cd kasikannu
```

### Step 5: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/catering_cost_estimation
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=production
EOF

# Run seed data (create database)
npm run seed

# Install PM2 (process manager to keep app running)
sudo npm install -g pm2

# Start backend with PM2
pm2 start src/server.js --name "kasikannu-backend"
pm2 startup
pm2 save

# Check if running
pm2 status
```

### Step 6: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF

# Build production version
npm run build

# The build folder is created - we'll serve with Nginx
```

### Step 7: Configure Nginx

```bash
# Backup default config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Create new Nginx config
sudo cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Root location serves frontend
    root /root/kasikannu/frontend/build;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on reboot
sudo systemctl enable nginx
```

### Step 8: Add SSL Certificate (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace yourdomain.com with your actual domain)
sudo certbot certonly --nginx -d yourdomain.com

# Update Nginx config to use SSL (or run certbot --nginx to auto-update)
sudo certbot --nginx -d yourdomain.com
```

### Step 9: Verify Everything Works

```bash
# Check backend
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost

# Check PM2 status
pm2 status

# Check MongoDB
mongo --eval "db.adminCommand('ping')"
```

---

## Access Your Deployed App

| Component    | URL                                         |
| ------------ | ------------------------------------------- |
| Frontend     | http://yourdomain.com (or http://server_ip) |
| Backend API  | http://yourdomain.com/api                   |
| Health Check | http://yourdomain.com/api/health            |

---

## File Locations on Server

```
/root/kasikannu/
├── backend/
│   ├── src/
│   │   ├── server.js      (main backend file)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── seeds/
│   ├── .env               (environment variables)
│   └── package.json
├── frontend/
│   ├── build/             (production build - served by Nginx)
│   ├── src/
│   ├── .env
│   └── package.json
└── nginx/
    └── (config in /etc/nginx/)
```

---

## Useful Commands After Deployment

### Manage Backend (PM2)

```bash
# Start backend
pm2 start src/server.js --name "kasikannu-backend" --cwd /root/kasikannu/backend

# Check status
pm2 status

# View logs
pm2 logs kasikannu-backend

# Restart backend
pm2 restart kasikannu-backend

# Stop backend
pm2 stop kasikannu-backend

# Delete from PM2
pm2 delete kasikannu-backend
```

### Update Backend Code

```bash
cd /root/kasikannu/backend

# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
npm install

# Restart with PM2
pm2 restart kasikannu-backend
```

### Update Frontend Code

```bash
cd /root/kasikannu/frontend

# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
npm install

# Rebuild
npm run build

# Nginx automatically serves new build
```

### Monitor Server Performance

```bash
# Check CPU and memory usage
top

# Check disk usage
df -h

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB size
mongo --eval "db.stats()"
```

---

## Monitoring & Maintenance

### Check Logs

```bash
# Backend logs
pm2 logs kasikannu-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Backup Database

```bash
# Create backup
mongodump --out /root/kasikannu/backups/

# Restore from backup
mongorestore /root/kasikannu/backups/
```

### Automatic Database Backups

```bash
# Create backup script
sudo cat > /root/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/kasikannu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mongodump --out $BACKUP_DIR/backup_$TIMESTAMP
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

# Make executable
chmod +x /root/backup_db.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add this line: 0 2 * * * /root/backup_db.sh
```

---

## Scaling from Single Droplet to Multiple Droplets

When you outgrow single droplet (300+ users):

### Move to Separate Droplets

**Option 1: Manual Split**

- Droplet 1: Backend + MongoDB (₹600)
- Droplet 2: Frontend + Nginx (₹300)
- Total: ₹900/month

**Option 2: Load Balancer**

- 2 Backend Droplets (₹600 each = ₹1,200)
- 1 Frontend Droplet (₹300)
- Load Balancer (₹50)
- Total: ₹1,550/month

**Option 3: App Platform**

- Automatic scaling
- Pay per resource used
- Typically ₹1,000-2,000/month

---

## Cost Summary: Single Droplet Setup

| Item            | Cost               | Notes                                 |
| --------------- | ------------------ | ------------------------------------- |
| Droplet (2GB)   | ₹600/month         | Includes frontend + backend + MongoDB |
| Domain name     | ₹200-500/year      | Optional, ~₹20/month                  |
| SSL certificate | Free               | Let's Encrypt (free forever)          |
| Backups         | Included           | Built into DigitalOcean               |
| Bandwidth       | Free               | First 1TB/month included              |
| **TOTAL**       | **₹620-650/month** | Everything together                   |

---

## Troubleshooting

### Frontend shows "Cannot connect to backend"

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs kasikannu-backend

# Restart backend
pm2 restart kasikannu-backend

# Check Nginx config
sudo nginx -t
```

### Port 5000 already in use

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### MongoDB connection error

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Need more disk space?

```bash
# Check disk usage
df -h

# Resize on DigitalOcean dashboard or add block storage
```

---

## Summary: Frontend + Backend on DigitalOcean

### ✅ YES, both can be deployed!

**Single Droplet (Recommended to start):**

- Frontend (React) + Backend (Node.js) + Database (MongoDB)
- Cost: ₹600/month
- No DevOps knowledge needed
- Easy to scale later

**Setup Time:** ~30-45 minutes after creating Droplet

**What happens when deployed:**

1. User visits `yourdomain.com`
2. Nginx serves React frontend
3. User clicks actions → API calls to `/api/...`
4. Nginx proxies to Backend (localhost:5000)
5. Backend queries MongoDB
6. Results returned to frontend

**Next Steps:**

1. Create DigitalOcean account
2. Create Ubuntu Droplet (2GB, ₹600/month)
3. SSH in and follow deployment steps above
4. Point domain to server IP
5. Visit your domain and test!
