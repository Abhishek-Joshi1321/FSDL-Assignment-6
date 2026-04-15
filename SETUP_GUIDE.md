# 🚀 Setup Guide: Running Appointly Locally with MongoDB

## Prerequisites

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version
- Install npm automatically comes with Node.js

### 2. Install MongoDB Community Edition
#### Windows:
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Install MongoDB as a Service" (recommended)
4. MongoDB will start automatically

Verify MongoDB is running:
```bash
mongosh
```

#### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 3. Install MongoDB Compass (GUI)
- Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- Install and run it

---

## ✅ Quick Start

### Step 1: Start MongoDB
Make sure MongoDB service is running:

**Windows (PowerShell as Admin):**
```powershell
net start MongoDB
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongodb
```

Verify it's running:
```bash
mongosh
```
Type `exit` to quit.

### Step 2: Verify .env Configuration
The `.env` file is already configured:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/appointly
NODE_ENV=development
SESSION_SECRET=appointly-secret-2024
```

This connects to MongoDB on your local machine at port 27017 (default).

### Step 3: Install Dependencies
```bash
cd "d:\FSDL lab\ASSIGNMENT 6\Online Appointment Booking Application\files"
npm install
```

### Step 4: Start the Application
```bash
npm start
```

You should see:
```
✅ MongoDB connected
✅ Default services initialized
✅ Appointly running on http://localhost:3000
```

### Step 5: Open in Browser
Visit: **http://localhost:3000**

---

## 🗄️ Connect MongoDB Compass

### Step 1: Open MongoDB Compass
Click the application or run:
```bash
mongosh compass-cli
```

### Step 2: Create New Connection
- Click **"New Connection"**
- Keep the default: `mongodb://localhost:27017`
- Click **"Save & Connect"**

### Step 3: Explore Your Data
Once connected, navigate:
- **appointly** (database) → **users** (collection)
- **appointly** → **appointments** (collection)  
- **appointly** → **services** (collection)

You'll see all your bookings and user data in real-time!

### Alternative: Direct Connection URI
If needed, use this connection string in Compass:
```
mongodb://localhost:27017/appointly
```

---

## 🎯 Features & Testing

### 1. Register a New Account
- Go to http://localhost:3000
- Click "Sign In" → "Register"
- Create an account with name, email, password

### 2. Book an Appointment
- Click "Book Appointment"
- Select a service (Healthcare service)
- Pick a date and available time slot
- Confirm your details
- Submit booking

### 3. View Dashboard
- After booking, go to Dashboard
- See your appointments with status, date, and time
- Cancel or modify appointments

### 4. Admin Features
- Users can see only their appointments
- Admin role can see all appointments
- Admin can confirm pending appointments

### 5. MongoDB Compass View
All data is automatically saved to MongoDB:
- Check **Users** collection for registered users
- Check **Appointments** for all bookings
- Check **Services** for available services

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Or restart it
sudo systemctl restart mongodb
```

### Port 3000 Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:** Change port in `.env`:
```
PORT=3001
```

### npm install Errors
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Compass Can't Connect
- Ensure MongoDB service is running
- Check connection string is: `mongodb://localhost:27017`
- Try connecting from terminal: `mongosh`

---

## 📁 Project Structure
```
files/
├── server.js              # Express server with MongoDB
├── models.js              # MongoDB schemas
├── package.json           # Dependencies
├── .env                   # Configuration
├── public/
│   ├── index.html         # Frontend SPA
│   ├── css/
│   │   └── style.css      # Styled components
│   └── js/
│       └── app.js         # Client-side logic
└── README.md              # Documentation
```

---

## 🛑 Stop the Application

Press **Ctrl+C** in the terminal running the app.

---

## 📚 Available API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/logout` | Logout |
| GET | `/api/services` | Get all services |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | Get user's appointments |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |

---

## ✨ Next Steps

- Customize services in MongoDB Compass
- Add more healthcare services to the database
- Modify appointment duration and pricing
- Deploy to production (Heroku, Railway, Render, etc.)

**Happy Booking!** 🏥
