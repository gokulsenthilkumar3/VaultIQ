# VaultIQ: Enterprise Asset & Operations Hub

![VaultIQ Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20PostgreSQL-blue?style=for-the-badge)

**VaultIQ** is a next-generation Office Asset Management system designed for modern enterprise scale. It combines high-fidelity 3D visualization, AI-driven predictive maintenance, and cryptographic audit trails into a single, unified operations dashboard.

---

## 🚀 Key Innovations

### 🌐 Digital Twin Engine

Real-time 3D synchronization for physical assets. Every server, laptop, and workstation is represented as a high-fidelity digital twin that reflects its live IoT telemetry and health status.

### 🤖 AI Lifecycle Assistant

Powered by an integrated LLM service, the VaultIQ Assistant provides natural language insights into your inventory. Ask about budget forecasts, replacement cycles, or maintenance summaries in plain English.

### 🔗 Blockchain Audit Trail

Every change of custody or maintenance record is cryptographically anchored to an immutable ledger (SHA-256), ensuring total compliance and a tamper-proof history of every asset.

### 🔮 Predictive Maintenance

Heuristic and ML-based engine that analyzes temperature, usage hours, and performance metrics to trigger maintenance alerts before hardware failures occur.

---

## 🛠 Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)

- **Visualization**: Three.js (Digital Twin Engine)

- **Styling**: Vanilla CSS + Glassmorphism Design System

- **Scanning**: HTML5 QR Code (Camera-based)

### Backend (Microservices)

- **Core**: NestJS (Node.js)

- **Database**: PostgreSQL with Prisma ORM

- **Cache**: Redis

- **Security**: Azure AD SSO + RBAC Middleware

- **Hashing**: Crypto-based SHA-256 Chain

---

## 📦 Project Structure

```text
├── frontend/             # Next.js Application
│   ├── app/              # App Router Pages
│   ├── components/       # UI & 3D Components
│   └── styles/           # Global Design Tokens
├── backend/              # NestJS Microservices
│   ├── src/
│   │   ├── assets/       # Inventory Logic
│   │   ├── blockchain/   # Immutable Audit Service
│   │   ├── maintenance/  # Predictive Engine
│   │   └── helpdesk/     # Ticketing & AI Triage
│   └── prisma/           # Database Schema
└── vaultiq_innovations.md # Advanced Feature Specs
```

---

## 🚦 Getting Started

1. **Clone the Repo**:

   ```bash
   git clone https://github.com/gokulsenthilkumar3/VaultIQ.git
   ```

2. **Environment Setup**:
   Create a `.env` file in the root and backend directories with your `DATABASE_URL`.

3. **Install Dependencies**:

   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. **Run Development Servers**:

   ```bash
   # In separate terminals
   npm run dev (frontend)
   npm run start:dev (backend)
   ```

---

## 📄 License

Enterprise Proprietary. Built with ⚡ by **me**.
