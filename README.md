# ValixMailer

> Validate emails before you send. Protect your domain reputation.

An email validation SaaS application that helps you verify email addresses, reduce bounce rates, and maintain a healthy sender reputation.

## 🆕 Recent Updates

**Latest enhancements (Oct 2-3, 2025):**

- 🔐 **User Authentication & Database** - Full JWT-based auth system with MongoDB persistence
  - User registration and login with bcrypt password hashing
  - JWT tokens with 7-day expiration
  - Protected API endpoints with authentication middleware
  - MongoDB integration with Mongoose ODM
  - Credits system: 1000 free credits per new user
  - Validation history tracking and retrieval (paginated)
  - Credit deduction on each validation (1 credit per email)
  - Returns 402 Payment Required when out of credits
- 🔧 **Critical Validation Logic Fixes** - Separated DNS from MX checks, independent checks run always
  - DNS checks domain existence (A/AAAA records) - completely independent from MX
  - MX checks email delivery capability (MX records) - runs regardless of DNS
  - Independent checks (disposable/free/role) always run when syntax is valid
  - Fixed UI display logic for negated fields (disposable/free/role)
  - Risk scorer now properly validates MX records (missing MX = 100 risk)
  - All validation logic edge cases tested and verified
- ✅ **SMTP Validation Fully Implemented** - Real mailbox verification via SMTP protocol
  - Full TCP connection to mail servers on port 25
  - Proper SMTP handshake: HELO → MAIL FROM → RCPT TO → graceful QUIT
  - Optimized: Single MX DNS lookup, no duplicate queries (~100-500ms faster)
  - Fallback to multiple MX servers (tries first 3 by priority)
  - 10-second timeout per connection with graceful error handling
  - Note: Many providers (Gmail, Outlook) block SMTP verification for privacy
- ✨ **Enhanced 8-Point Validation System** with calibrated risk scoring (0-100+)
- 🎨 **Modern UI Design** - Subtle geometric background pattern (40px grid, 2% opacity)
- 🔍 **Advanced Checks** - Domain age verification & sophisticated pattern detection
- 📊 **Weighted Risk Scoring** - Critical (100) → High (90) → Medium (20-50) → Low (10)
- 🎯 **Smart Status Logic** - Invalid (critical fails) / Risky (60+) / Valid (<60)
- 💾 **Modular Architecture** - Separated validator checks and result processors
- 📱 **Enhanced Results Display** - Color-coded 8-point breakdown with status indicators
- 🧪 **Comprehensive Test Suite** - 58+ test cases covering all validation scenarios

## 🚀 Features

### Current Features

- ✅ **User Authentication** - JWT-based registration and login with secure password hashing
- ✅ **Credits System** - Track validation usage with credits (1000 free credits for new users)
- ✅ **Validation History** - Persistent storage of all validations with paginated retrieval
- ✅ **Single Email Validation** - Validate individual email addresses in real-time
- ✅ **Comprehensive 8-Point Validation** - Format, DNS/MX records, SMTP mailbox verification, disposable domains, free email providers, role accounts, domain age, and suspicious patterns
- ✅ **Advanced Risk Scoring** - Calibrated risk score (0-100) with weighted factors
- ✅ **Modern UI** - Clean, responsive interface with subtle geometric background pattern
- ✅ **Real-time Results** - Instant validation feedback with detailed check breakdowns
- ✅ **SMTP Verification** - Real mailbox verification via SMTP protocol (HELO → MAIL FROM → RCPT TO)
- ✅ **Protected API** - Secure endpoints with authentication middleware

### Coming Soon

- 🔄 Bulk CSV validation
- 💳 Stripe payment integration
- 📊 Usage analytics dashboard
- 📈 Subscription plans
- 🔑 API keys for developers

## 📋 Tech Stack

### Frontend

- **Framework**: Nuxt 3 + Vue 3
- **Styling**: Tailwind CSS
- **Components**: Shadcn Vue
- **Icons**: Lucide Vue

### Backend

- **Framework**: Express.js
- **Runtime**: Node.js (ESM)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Custom email validation service

## 🏗️ Project Structure

```
valixmailer/
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
│   ├── models/             # MongoDB/Mongoose models
│   │   ├── User.js         # User schema (email, password, credits)
│   │   └── Validation.js   # ValidationResult schema
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/             # API route handlers
│   │   ├── validate.js     # Email validation endpoint (protected)
│   │   ├── auth.js         # Authentication (register, login, me)
│   │   ├── validations.js  # Validation history endpoints
│   │   ├── credits.js      # Credit balance endpoint
│   │   ├── bulk.js         # Bulk validation (placeholder)
│   │   └── subscriptions.js # Stripe subscriptions (placeholder)
│   ├── services/           # Business logic
│   │   ├── validator/      # Email validation checks
│   │   │   ├── index.js           # Validator exports
│   │   │   ├── validateSyntax.js  # Email format validation
│   │   │   ├── checkDns.js        # DNS existence check (A/AAAA records)
│   │   │   ├── checkMxRecords.js  # MX record verification (email delivery)
│   │   │   ├── checkSmtp.js       # SMTP mailbox verification
│   │   │   ├── isDisposable.js    # Disposable domain detection
│   │   │   ├── isFreeDomain.js    # Free email provider detection
│   │   │   ├── isRoleAccount.js   # Role account detection
│   │   │   ├── checkDomainAge.js  # Domain age verification
│   │   │   └── hasSuspiciousPatterns.js # Suspicious pattern detection
│   │   └── results/        # Result processing
│   │       ├── index.js              # Results exports
│   │       ├── calculateRiskScore.js # Risk score calculation
│   │       ├── determineStatus.js    # Status determination
│   │       └── generateReason.js     # Reason generation
│   ├── tests/              # Test files
│   ├── db.js               # MongoDB connection module
│   └── server.js           # Express server entry point
│
├── package.json            # Root package with workspaces
├── README.md              # This file
├── TODO.md                # Future tasks and roadmap
└── SMTP_IMPLEMENTATION.md # SMTP validation technical details
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Clone or navigate to the repository**

   ```bash
   cd /path/to/coldmailer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up MongoDB**

   **Option A: Local MongoDB**

   ```bash
   # Install MongoDB (macOS with Homebrew)
   brew install mongodb-community

   # Start MongoDB
   brew services start mongodb-community
   ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get your connection string
   - Use the connection string in your `.env` file

4. **Set up environment variables**

   Backend (.env):

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and configure:
   # - MONGODB_URI (e.g., mongodb://localhost:27017/coldmailer)
   # - JWT_SECRET (generate a secure random string)
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

## 🎯 Quick Start Guide

### 1. Register a New User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

Save the returned `token` for subsequent requests.

### 2. Login (if already registered)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

### 3. Validate an Email (requires token)

```bash
curl -X POST http://localhost:4000/api/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

### 4. Check Your Credits

```bash
curl -X GET http://localhost:4000/api/credits \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. View Validation History

```bash
curl -X GET http://localhost:4000/api/validations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📡 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68df8766a91aec6c79e4568f",
    "email": "user@example.com",
    "credits": 1000,
    "createdAt": "2025-10-03T08:20:54.424Z"
  }
}
```

#### `POST /api/auth/login`

Login to an existing account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68df8766a91aec6c79e4568f",
    "email": "user@example.com",
    "credits": 1000
  }
}
```

#### `GET /api/auth/me`

Get current user information (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": "68df8766a91aec6c79e4568f",
    "email": "user@example.com",
    "credits": 999,
    "createdAt": "2025-10-03T08:20:54.424Z",
    "updatedAt": "2025-10-03T08:23:04.122Z"
  }
}
```

### Validation Endpoints

#### `POST /api/validate`

Validate a single email address (requires authentication, costs 1 credit).

**Headers:**

```
Authorization: Bearer <token>
```

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
  "riskScore": 10,
  "checks": {
    "syntax": true,
    "dns": true,
    "mx": true,
    "smtp": false,
    "disposable": false,
    "freeEmail": true,
    "roleAccount": false,
    "domainAge": {
      "isNew": false,
      "ageInDays": null
    },
    "suspiciousPattern": false
  },
  "reason": "",
  "creditsRemaining": 999
}
```

**Status Values:**

- `valid` - Email is safe to send to
- `invalid` - Email has critical issues
- `risky` - Email may cause issues
- `unknown` - Unable to validate

#### `GET /api/validations`

Get user's validation history (requires authentication, paginated).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**

```json
{
  "validations": [
    {
      "_id": "68df87e8a91aec6c79e45695",
      "userId": "68df8766a91aec6c79e4568f",
      "email": "test@example.com",
      "status": "valid",
      "riskScore": 10,
      "checks": { ... },
      "reason": "",
      "creditsUsed": 1,
      "createdAt": "2025-10-03T08:23:04.122Z",
      "updatedAt": "2025-10-03T08:23:04.122Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

#### `GET /api/validations/:id`

Get a single validation by ID (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "validation": {
    "_id": "68df87e8a91aec6c79e45695",
    "email": "test@example.com",
    "status": "valid",
    "riskScore": 10,
    "checks": { ... },
    "creditsUsed": 1,
    "createdAt": "2025-10-03T08:23:04.122Z"
  }
}
```

### Credits Endpoints

#### `GET /api/credits`

Get current credit balance (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "credits": 999,
  "email": "user@example.com"
}
```

### Planned Endpoints

- `POST /api/bulk/upload` - Upload CSV for bulk validation
- `GET /api/bulk/jobs/:id` - Get validation job status
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/credits/purchase` - Purchase additional credits

## 🧪 Email Validation Logic

The validator performs **8 comprehensive checks** (in order of priority):

1. **Format Validation** - Validates email syntax using regex patterns
2. **DNS Validation** - Verifies domain exists (A/AAAA records) - _Independent from MX_
3. **MX Records Check** - Confirms domain has valid mail exchange records - _Independent from DNS_
4. **SMTP Validation** - Verifies mailbox exists via SMTP protocol (HELO → MAIL FROM → RCPT TO)
5. **Disposable Domain Detection** - Identifies temporary/disposable email services - _Runs independently_
6. **Free Email Provider Detection** - Recognizes free email providers (Gmail, Yahoo, Outlook, etc.) - _Runs independently_
7. **Role Account Detection** - Flags generic addresses (info@, admin@, sales@, support@, etc.) - _Runs independently_
8. **Domain Age & Pattern Analysis** - Checks domain registration age and detects suspicious patterns

**Key Design**: DNS and MX are separate checks. Independent checks (5-7) run regardless of DNS/MX status, providing maximum information even for invalid domains.

### Risk Score Calculation (Calibrated)

The risk scoring system uses a weighted approach:

**Critical Failures (100 points)**

- Invalid email syntax → 100
- No DNS (domain doesn't exist) → 100
- No MX records (can't receive email) → 100

**High Risk (90 points)**

- Disposable email domain → +90

**Medium-High Risk (30-50 points)**

- New domain + suspicious pattern → +50
- New domain alone → +30
- Suspicious pattern alone → +20

**Medium Risk (20 points)**

- Role account → +20

**Low Risk (10 points)**

- Free email provider → +10

### Status Determination

- **Invalid** - Critical checks failed (syntax, DNS, or MX)
- **Risky** - Risk score ≥ 60
- **Valid** - Risk score < 60 and all critical checks pass

### Example Validations

| Email                       | Status     | Risk Score | Key Flags                          |
| --------------------------- | ---------- | ---------- | ---------------------------------- |
| user@gmail.com              | ✅ Valid   | 10         | Free domain only                   |
| info@company.com            | ✅ Valid   | 30         | Role account + free-ish domain     |
| user@guerrillamail.com      | ⚠️ Risky   | 90         | Disposable domain                  |
| random@xyz-disposable.net   | ⚠️ Risky   | 85         | Disposable + suspicious pattern    |
| user@thisdomaindoesnotexist | ❌ Invalid | 100        | DNS/MX failure                     |
| bad@@gmail.com              | ❌ Invalid | 100        | Syntax error                       |
| user@freshly-registered.xyz | ⚠️ Risky   | 60         | New domain + suspicious            |
| admin@mycompany.org         | ✅ Valid   | 40         | Role account on established domain |

## 🎨 UI Design

### Visual Design

- **Background Pattern** - Subtle geometric square grid (40px × 40px) with 2% opacity
- **Color Scheme** - Dark theme with black background and accent colors
- **Responsive Layout** - Mobile-first design with Tailwind CSS
- **Status Indicators** - Color-coded badges (green/red/yellow) for validation results

### Shadcn Vue Components

- `Button` - Primary action buttons with hover effects
- `Input` - Form inputs with dark theme styling
- `Card` - Content containers with zinc-900 background
- `Badge` - Status indicators with variant support (success/destructive/warning/secondary)

### Validation Results Display

Results are displayed in two cards:

1. **Status Card** - Overall status with icon, risk score badge, and reason
2. **Detailed Checks Card** - 8-point validation breakdown in a responsive grid

## 🧪 Testing

### Test Suite

The project includes comprehensive test cases for all validation functions:

- `backend/tests/simple.test.js` - Test cases for all validators
- Coverage includes: syntax, disposable detection, free domains, role accounts, suspicious patterns, MX records, and domain age

### Running Tests

```bash
cd backend
npm test
```

### Test Categories

- **Syntax Tests** - 12 test cases covering valid/invalid formats
- **Disposable Tests** - 7 test cases for temporary email detection
- **Free Domain Tests** - 7 test cases for free provider detection
- **Role Account Tests** - 9 test cases for generic addresses
- **Suspicious Pattern Tests** - 9 test cases for unusual patterns
- **MX Record Tests** - 5 test cases for DNS validation
- **Domain Age Tests** - 5 test cases for domain maturity
- **Integration Tests** - 4 combined scenario tests

## 🔍 Technical Details

### SMTP Mailbox Verification

Real-time SMTP validation to verify mailbox existence:

- **Protocol**: Connects to mail server via TCP on port 25
- **Handshake Sequence**:
  1. Wait for 220 (server greeting)
  2. Send `HELO domain` → expect 250
  3. Send `MAIL FROM:<verify@domain>` → expect 250
  4. Send `RCPT TO:<email>` → check response
- **Response Codes**:
  - 250/251 → Mailbox exists (returns `true`)
  - 550/551/553/554 → Mailbox doesn't exist (returns `false`)
  - Other codes → Uncertain/blocked (returns `false`)
- **Safety Features**:
  - 10-second timeout per connection
  - Tries first 3 MX servers (sorted by priority)
  - Falls back to next MX if first fails
  - Graceful error handling (returns `false` on errors)
  - No actual emails sent (only verification)
- **Note**: Many providers (Gmail, Outlook, etc.) block SMTP verification for privacy reasons. This check may return false negatives for privacy-protected mailboxes.
- **Performance Optimization**: MX records are resolved once and reused for SMTP validation, eliminating duplicate DNS lookups (~100-500ms savings per validation)

### Suspicious Pattern Detection

The system identifies potentially fake or low-quality emails by checking for:

- Excessive consecutive numbers (e.g., `user123456789@...`)
- Too many repeated characters (e.g., `aaaaaaaa@...`)
- Suspicious keywords: `random`, `test`, `fake`, `temp`, `spam`, `junk`, `dummy`
- Common keyboard patterns: `qwerty`, `asdfgh`, `12345`
- Regex-based pattern matching for unusual character sequences

### Domain Age Verification

The validator checks domain registration age to identify:

- **New domains** (< 90 days old) - Higher risk for spam/phishing
- **Established domains** (≥ 90 days old) - Lower risk
- Uses WHOIS-like checks or external APIs for domain age data
- Combines with suspicious patterns for accurate risk assessment

### Disposable Domain Detection

Maintains an extensive list of:

- Known disposable email providers (1000+ domains)
- Temporary email services
- 10-minute mail services
- Pattern-based detection for common disposable domain formats

### Free Email Provider List

Recognizes major free email providers:

- Gmail, Yahoo, Outlook/Hotmail, ProtonMail
- iCloud, AOL, Zoho, Mail.com
- Regional providers (GMX, Yandex, etc.)
- 50+ free email services included

### Role Account Keywords

Detects common role-based addresses:

- Administrative: `admin`, `administrator`, `webmaster`, `postmaster`
- Sales & Marketing: `sales`, `marketing`, `info`, `contact`
- Support: `support`, `help`, `helpdesk`, `service`
- Generic: `noreply`, `no-reply`, `billing`, `feedback`

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/coldmailer

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**

```env
NUXT_PUBLIC_API_URL=http://localhost:4000
```

### MongoDB Database Schema

**User Collection:**

- `email` - User's email address (unique, lowercase)
- `password` - Hashed password (bcrypt, 10 rounds)
- `credits` - Available credits (default: 1000)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Validation Collection:**

- `userId` - Reference to User (indexed)
- `email` - Validated email address
- `status` - Validation result (valid/invalid/risky/unknown)
- `riskScore` - Calculated risk score (0-100+)
- `checks` - All validation check results (object)
- `reason` - Explanation for status
- `creditsUsed` - Credits consumed (default: 1)
- `createdAt` - Validation timestamp
- `updatedAt` - Last update timestamp

## 📝 Roadmap & Progress

### Phase 1: Core Features ✅ (Completed)

- [x] Single email validation with 8-point check system
- [x] Advanced risk scoring algorithm (calibrated)
- [x] Modern dark-themed UI with geometric background
- [x] Real-time validation feedback
- [x] Comprehensive validation checks:
  - [x] Format/Syntax validation
  - [x] DNS/MX records verification
  - [x] Disposable domain detection
  - [x] Free email provider detection
  - [x] Role account detection
  - [x] Domain age verification
  - [x] Suspicious pattern detection
  - [x] SMTP mailbox verification (real implementation)
- [x] Status determination (valid/invalid/risky)
- [x] Responsive detailed results display
- [x] User authentication & authorization (JWT-based)
- [x] MongoDB integration with Mongoose
- [x] Credit system (1000 free credits per user)
- [x] Validation history tracking (paginated)
- [x] Protected API endpoints

### Phase 2: Premium Features (Next)

- [ ] Bulk CSV validation
- [ ] User dashboard (frontend)
- [ ] Usage analytics & charts
- [ ] API keys for developers

### Phase 3: Monetization

- [ ] Stripe integration
- [ ] Subscription plans (Basic/Pro/Enterprise)
- [ ] Payment processing
- [ ] Invoice generation
- [ ] Pricing page implementation

### Phase 4: Advanced Features

- [ ] Email list cleaning & deduplication
- [ ] API rate limiting
- [ ] Webhooks for async validation
- [ ] Team management
- [ ] White-label solution
- [ ] Advanced analytics & reporting

## 🤝 Contributing

This is a private project. For issues or suggestions, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 📖 Additional Documentation

- **[TODO.md](./TODO.md)** - Complete roadmap, future features, and task tracking
- **[SMTP_IMPLEMENTATION.md](./SMTP_IMPLEMENTATION.md)** - Technical deep-dive into SMTP validation implementation
- **[VALIDATION_LOGIC_FIXES.md](./VALIDATION_LOGIC_FIXES.md)** - Critical validation logic fixes (DNS/MX separation, independent checks)

## 🆘 Support

For support, please contact support@coldmailer.com (placeholder)

---

Built with ❤️ using Nuxt 3, Vue 3, Express.js, and Tailwind CSS
