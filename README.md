# SJ Jewelers — Gold & Silver Mobile App Platform

A modern, high-fidelity mobile application and administrative dashboard for gold and silver asset investments, built with React, Vite, and custom design tokens.

---

## 🚀 Features

- **User Mobile Application**:
  - Sign In, Create Account & Forgot Username auth flows.
  - Dynamic Gold & Silver live rate feeds and holdings balance summaries.
  - Interactive Buy Now flow (Rupees & Grams calculation with quick presets).
  - Mock Payment Gateway (UPI, Card, Net Banking) with transaction confirmation.
  - Mode of Withdraw with interactive KYC verification flow.
  - Real-time Transaction History and interactive Contact Us form.
  - User profile overview and profile editing.
  - Smooth vertical touch scrolling and mobile responsive sizing (`360px` - `430px`).

- **Admin Dashboard**:
  - Accessible via `#admin` route.
  - Key performance analytics and visual transaction volume charts.
  - Users management with view, edit, and account status controls.
  - KYC management queue with Approve & Reject action engine.
  - Transactions & Payments monitoring logs.
  - Withdrawals management table.
  - Live Gold & Silver rate management with real-time sync to the user application.
  - System settings and Maintenance Mode controls.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Icons**: Lucide React
- **State Management**: React Context (`AppContext`) with `localStorage` persistence
- **Styling**: Vanilla CSS with custom theme variables (Purple & Lavender palette)
- **Deployment Platform**: Vercel + GitHub

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sj-jewelers.git
cd sj-jewelers
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173/`.

### 4. Build for Production
```bash
npm run build
```
The optimized production output will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deploying to Vercel via GitHub

This project is pre-configured for automatic zero-config deployments on Vercel.

### Deployment Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete SJ Jewelers app and deployment config"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
   - Select and import your GitHub repository.
3. **Project Settings (Auto-Detected)**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Deploy**:
   - Click **"Deploy"**. Vercel will build the project and assign a production URL.
   - Every push to the `main` branch will automatically trigger a new deployment.
   - Pull requests will generate preview deployments.

---

## 📄 Routing Configuration

SPA routing rewrites are configured in `vercel.json` to ensure direct link navigation works without 404 errors across all routes.
