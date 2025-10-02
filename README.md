# ColdMailer

> Validate emails before you send. Protect your domain reputation.

An email validation SaaS application that helps you verify email addresses, reduce bounce rates, and maintain a healthy sender reputation.

## 🆕 Recent Updates

**Latest enhancements:**
- 🔧 **Critical Validation Logic Fixes** - Separated DNS from MX checks, independent checks run always
  - DNS checks domain existence (A/AAAA records)
  - MX checks email delivery capability (MX records)
  - Independent checks (disposable/free/role) run even when DNS/MX fail
  - Fixed UI display logic for negated fields
  - Risk scorer now properly checks MX records
- ✅ **SMTP Validation Fully Implemented** - Real mailbox verification via SMTP protocol
  - Full TCP connection to mail servers on port 25
  - Proper SMTP handshake: HELO → MAIL FROM → RCPT TO
  - Optimized: Single MX DNS lookup (no duplicates)
  - Fallback to multiple MX servers (tries first 3)
  - 10-second timeout with graceful error handling
- ✨ Enhanced 8-point validation system with calibrated risk scoring
- 🎨 Added subtle geometric background pattern to frontend (40px grid, 2% opacity)
- 🔍 New validation checks: domain age verification & suspicious pattern detection
- 📊 Updated risk scoring algorithm with weighted factors
- 🎯 Refined status determination logic (valid/risky/invalid)
- 💾 Restructured backend services with modular validator and results processors
- 📱 Improved results display with 8-point detailed breakdown

## 🚀 Features

### Current Features
- ✅ **Single Email Validation** - Validate individual email addresses in real-time
- ✅ **Comprehensive 8-Point Validation** - Format, DNS/MX records, SMTP mailbox verification, disposable domains, free email providers, role accounts, domain age, and suspicious patterns
- ✅ **Advanced Risk Scoring** - Calibrated risk score (0-100) with weighted factors
- ✅ **Modern UI** - Clean, responsive interface with subtle geometric background pattern
- ✅ **Real-time Results** - Instant validation feedback with detailed check breakdowns
- ✅ **SMTP Verification** - Real mailbox verification via SMTP protocol (HELO → MAIL FROM → RCPT TO)

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
      "daysOld": 5000
    },
    "suspiciousPattern": false
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

The validator performs **8 comprehensive checks** (in order of priority):

1. **Format Validation** - Validates email syntax using regex patterns
2. **DNS Validation** - Verifies domain exists (A/AAAA records) - *Independent from MX*
3. **MX Records Check** - Confirms domain has valid mail exchange records - *Independent from DNS*
4. **SMTP Validation** - Verifies mailbox exists via SMTP protocol (HELO → MAIL FROM → RCPT TO)
5. **Disposable Domain Detection** - Identifies temporary/disposable email services - *Runs independently*
6. **Free Email Provider Detection** - Recognizes free email providers (Gmail, Yahoo, Outlook, etc.) - *Runs independently*
7. **Role Account Detection** - Flags generic addresses (info@, admin@, sales@, support@, etc.) - *Runs independently*
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

| Email | Status | Risk Score | Key Flags |
|-------|--------|------------|-----------|
| user@gmail.com | ✅ Valid | 10 | Free domain only |
| info@company.com | ✅ Valid | 30 | Role account + free-ish domain |
| user@guerrillamail.com | ⚠️ Risky | 90 | Disposable domain |
| random@xyz-disposable.net | ⚠️ Risky | 85 | Disposable + suspicious pattern |
| user@thisdomaindoesnotexist | ❌ Invalid | 100 | DNS/MX failure |
| bad@@gmail.com | ❌ Invalid | 100 | Syntax error |
| user@freshly-registered.xyz | ⚠️ Risky | 60 | New domain + suspicious |
| admin@mycompany.org | ✅ Valid | 40 | Role account on established domain |

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
```

**Frontend (.env)**
```env
NUXT_PUBLIC_API_URL=http://localhost:4000
```

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

### Phase 2: Premium Features (Next)
- [ ] Bulk CSV validation
- [ ] User authentication & authorization
- [ ] User dashboard
- [ ] Credit system
- [ ] Usage analytics
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
