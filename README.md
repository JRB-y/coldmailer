# ColdMailer

> Validate emails before you send. Protect your domain reputation.

An email validation SaaS application that helps you verify email addresses, reduce bounce rates, and maintain a healthy sender reputation.

## 🚀 Features

### Current Features
- ✅ **Single Email Validation** - Validate individual email addresses in real-time
- ✅ **Comprehensive Checks** - Syntax, DNS/MX records, disposable domains, free email providers, role accounts
- ✅ **Risk Scoring** - Get a risk score (0-100) for each email address
- ✅ **Modern UI** - Clean, responsive interface built with Nuxt 3 and Shadcn Vue

### Coming Soon
- 🔄 Bulk CSV validation
- 🔐 User authentication & authorization
- 💳 Stripe payment integration
- 📊 Usage analytics dashboard
- 🎟️ Credit system
- 📈 Subscription plans

## 📋 Tech Stack

### Frontend
- **Framework**: Nuxt 3 + Vue 3
- **Styling**: Tailwind CSS
- **Components**: Shadcn Vue
- **Icons**: Lucide Vue

### Backend
- **Framework**: Express.js
- **Runtime**: Node.js (ESM)
- **Validation**: Custom email validation service

## 🏗️ Project Structure

```
coldmailer/
├── frontend/                 # Nuxt 3 frontend application
│   ├── pages/               # Application pages
│   │   ├── index.vue       # Landing page with validation form
│   │   ├── dashboard.vue   # User dashboard (placeholder)
│   │   ├── pricing.vue     # Pricing page (placeholder)
│   │   └── auth/           # Authentication pages
│   ├── components/          # Vue components
│   │   └── ui/             # Shadcn UI components
│   ├── composables/         # Vue composables
│   ├── lib/                # Utility functions
│   ├── assets/             # Static assets & CSS
│   └── nuxt.config.ts      # Nuxt configuration
│
├── backend/                 # Express.js backend API
│   ├── routes/             # API route handlers
│   │   ├── validate.js     # Email validation endpoint
│   │   ├── auth.js         # Authentication (placeholder)
│   │   ├── bulk.js         # Bulk validation (placeholder)
│   │   ├── credits.js      # Credit management (placeholder)
│   │   └── subscriptions.js # Stripe subscriptions (placeholder)
│   ├── services/           # Business logic
│   │   └── emailValidator.js # Email validation service
│   ├── utils/              # Utility functions
│   └── server.js           # Express server entry point
│
├── package.json            # Root package with workspaces
└── README.md              # This file
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone or navigate to the repository**
   ```bash
   cd /path/to/coldmailer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   ```

   Frontend (.env):
   ```bash
   cd frontend
   cp .env.example .env
   ```

## 🚀 Running the Application

### Start both frontend and backend (recommended)
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Start individually

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## 📡 API Endpoints

### Current Endpoints

#### `POST /api/validate`
Validate a single email address.

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "email": "test@example.com",
  "isValid": true,
  "status": "valid",
  "riskScore": 15,
  "checks": {
    "syntax": true,
    "dns": true,
    "mx": true,
    "disposable": false,
    "freeEmail": true,
    "roleAccount": false
  },
  "reason": ""
}
```

**Status Values:**
- `valid` - Email is safe to send to
- `invalid` - Email has critical issues
- `risky` - Email may cause issues
- `unknown` - Unable to validate

### Planned Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/bulk/upload` - Upload CSV for bulk validation
- `GET /api/bulk/jobs/:id` - Get validation job status
- `GET /api/credits` - Get credit balance
- `POST /api/subscriptions/create` - Create subscription

## 🧪 Email Validation Logic

The validator performs the following checks:

1. **Syntax Check** - Validates email format using regex
2. **DNS/MX Check** - Verifies domain has valid mail exchange records
3. **Disposable Domain** - Detects temporary/disposable email services
4. **Free Email Provider** - Identifies free email providers (Gmail, Yahoo, etc.)
5. **Role Account** - Detects role-based addresses (info@, admin@, etc.)

### Risk Score Calculation
- Invalid syntax: +100 (max risk)
- No DNS/MX records: +50
- Disposable domain: +80
- Role account: +30
- Free email provider: +10

## 🎨 UI Components

Built with Shadcn Vue components:
- `Button` - Primary action buttons
- `Input` - Form inputs
- `Card` - Content containers
- `Badge` - Status indicators

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=4000
NODE_ENV=development
```

**Frontend (.env)**
```env
NUXT_PUBLIC_API_URL=http://localhost:4000
```

## 📝 Future Roadmap

### Phase 1: Core Features (In Progress)
- [x] Single email validation
- [x] Basic UI
- [ ] User authentication
- [ ] User dashboard

### Phase 2: Premium Features
- [ ] Bulk CSV validation
- [ ] Credit system
- [ ] Usage analytics
- [ ] API keys for developers

### Phase 3: Monetization
- [ ] Stripe integration
- [ ] Subscription plans
- [ ] Payment processing
- [ ] Invoice generation

### Phase 4: Advanced Features
- [ ] Email list cleaning
- [ ] API rate limiting
- [ ] Webhooks
- [ ] Team management
- [ ] White-label solution

## 🤝 Contributing

This is a private project. For issues or suggestions, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For support, please contact support@coldmailer.com (placeholder)

---

Built with ❤️ using Nuxt 3, Vue 3, Express.js, and Tailwind CSS
