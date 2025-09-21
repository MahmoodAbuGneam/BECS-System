# 🩸 BECS - Blood Establishment Computer Software

A modern, professional fullstack web application for blood bank management with sophisticated UI design and comprehensive functionality.

## ✨ Features

- **🏥 Professional Medical Interface** - Modern glassmorphism design with medical-grade color palette
- **📝 Donation Intake** - Record blood donations with donor management
- **🔄 Routine Distribution** - Smart blood distribution with compatibility alternatives
- **🚨 Emergency Distribution** - One-click O- universal donor blood dispensing
- **📊 Real-time Dashboard** - Live inventory tracking with critical alerts
- **🧬 Blood Compatibility** - Automated compatibility checking and recommendations

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Flask + Python 3.11
- **Database**: MongoDB Atlas (Cloud)
- **Styling**: Modern CSS with glassmorphism effects
- **Deployment**: GitHub Pages ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env file with your MongoDB URI
   ```

4. **Start the backend server**:

   ```bash
   python start.py
   ```

   Or manually:

   ```bash
   uvicorn main:app --reload
   ```

   The backend will be available at: http://localhost:8000

### Frontend Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment** (optional):

   ```bash
   cp .env.example .env
   # Edit .env if your backend is not on localhost:8000
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at: http://localhost:3000

### MongoDB Configuration

#### Option 1: Local MongoDB

```bash
# Install MongoDB locally and start the service
# The default connection string is: mongodb://localhost:27017
```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update your `backend/.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

### Deploy to GitHub Pages (Frontend Only)

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:

   ```bash
   npm run deploy
   ```

   **Note**: For production deployment, you'll need to deploy the backend separately and update the `VITE_API_URL` in your `.env` file.

## 📋 Features

### Three Main Interfaces

1. **Donation Intake Interface** (Blood Bank Clerks)

   - Record donor information and blood donations
   - Update inventory automatically in MongoDB
   - Validate donor data and blood types

2. **Routine Distribution Interface** (Hospital Staff)

   - Request specific blood types and quantities
   - Get alternative recommendations when stock is low
   - Based on compatibility and rarity rules

3. **Emergency Distribution Interface** (Emergency Personnel)
   - One-click O- blood dispensing
   - Maximum available units in emergencies
   - Critical stock alerts

### Additional Features

- **Real-time Inventory Dashboard**
- **Blood Type Compatibility System**
- **Transaction Logging & Audit Trail**
- **MongoDB Integration**
- **RESTful API Backend**
- **Low Stock Alerts**

## 🩸 Blood Compatibility Rules

The system implements standard blood compatibility:

| Donor | Can Receive From                |
| ----- | ------------------------------- |
| A+    | A+, A-, O+, O-                  |
| A-    | A-, O-                          |
| B+    | B+, B-, O+, O-                  |
| B-    | B-, O-                          |
| AB+   | All types (Universal Recipient) |
| AB-   | AB-, A-, B-, O-                 |
| O+    | O+, O-                          |
| O-    | O- only                         |

**Emergency Protocol**: O- blood (Universal Donor) is dispensed in emergencies.

## 📁 Project Structure

```
becs-fullstack/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API service
│   └── App.tsx            # Main app
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── start.py          # Startup script
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
├── .env                  # Frontend environment
└── README.md
```

## 🛠️ Development

### Environment Variables

#### Backend (.env)

```bash
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=becs_db
ENVIRONMENT=development
```

#### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/inventory` - Get blood inventory
- `POST /api/donations` - Record donation
- `POST /api/distribute/routine` - Routine distribution
- `POST /api/distribute/emergency` - Emergency distribution
- `GET /api/transactions` - Get recent transactions

### Database Collections

- **inventory** - Blood type stock levels
- **donors** - Donor information
- **donations** - Donation records
- **transactions** - All distribution transactions

## 🚀 Deployment

### Backend Deployment Options

1. **Railway**: Connect your GitHub repo and deploy
2. **Heroku**: Use the Heroku CLI
3. **DigitalOcean App Platform**: Deploy from GitHub
4. **AWS/GCP/Azure**: Use their respective services

### Frontend Deployment

1. **GitHub Pages**: Use `npm run deploy`
2. **Netlify**: Connect your GitHub repo
3. **Vercel**: Deploy from GitHub

### Production Configuration

1. Update `VITE_API_URL` in frontend `.env` to your backend URL
2. Configure CORS in backend to allow your frontend domain
3. Use MongoDB Atlas for production database
4. Set up proper environment variables in your deployment platform

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a complete fullstack application with MongoDB integration. The backend handles all data persistence and business logic, while the frontend provides the user interface.
