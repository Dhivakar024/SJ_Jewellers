# SJ Jewelers — Gold & Silver Application Ecosystem

A full-stack gold and silver investment platform with real-time rates, wallet holdings, purchase checkout, KYC, withdrawal flows, and admin dashboard.

---

## 📁 Project Structure

```text
project-root/
│
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── admin/                # Admin Portal views (Dashboard, Rates, Members, Analytics, etc.)
│   │   ├── components/           # Reusable UI components (BottomNav, ActionSheet, Container)
│   │   ├── config/               # Support and environment configuration
│   │   ├── context/              # AppContext global state manager
│   │   ├── screens/              # Customer screens (Home, BuyNow, Profile, Withdraw, Auth)
│   │   ├── services/             # Centralized API client and domain services
│   │   ├── styles/               # CSS themes, variables, and animations
│   │   ├── utils/                # Auth tokens, storage, and formatters
│   │   ├── App.jsx               # Route guards and screen orchestrator
│   │   └── main.jsx              # React DOM entry point
│   │
│   ├── public/                   # Static assets (favicons, SVGs)
│   ├── .env                      # Frontend environment configuration (VITE_API_BASE_URL)
│   ├── .env.example              # Example environment template
│   ├── index.html                # Single-page application template
│   ├── package.json              # Frontend npm dependencies and scripts
│   ├── vercel.json               # Vercel SPA routing rewrites
│   └── vite.config.js            # Vite build configuration
│
├── backend/                      # FastAPI + MongoDB Atlas Backend
│   ├── app/
│   │   ├── database/             # MongoDB Atlas connection manager
│   │   ├── middleware/           # OWASP security headers, CORS & request rate limiting
│   │   ├── routes/               # Modular REST endpoints (auth, rates, purchases, holdings, etc.)
│   │   ├── schemas/              # Pydantic v2 data models and validators
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Argon2 password hashing & JWT token security
│   │   ├── config.py             # Server settings
│   │   └── main.py               # FastAPI application initialization
│   │
│   ├── tests/                    # Automated security and validation unit tests
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Backend environment configuration
│   └── README.md                 # Backend documentation
│
└── README.md                     # Root project documentation
```

---

## 🚀 Running the Project

### 1. Start Backend (FastAPI + MongoDB)
```bash
cd backend
# Activate virtual environment
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/macOS

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Backend URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

---

### 2. Start Frontend (React + Vite)
```bash
cd frontend
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- **Frontend App URL**: `http://localhost:5173/`

---

## 🧪 Testing

### Automated Backend Tests:
```bash
cd backend
python -m unittest tests/test_production_security.py
```

### Production Build:
```bash
cd frontend
npm run build
```
