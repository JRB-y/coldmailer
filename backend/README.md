# ValixMail Backend

Email validation API with bulk processing support.

## Features

- Single email validation
- Bulk email validation via CSV upload
- User authentication with JWT
- Credit-based usage system
- MongoDB-based job queue (no Redis/Kafka required)

## Validation Checks

- Syntax validation
- DNS verification
- MX record validation
- SMTP verification
- Disposable domain detection
- Free email provider detection
- Role account detection
- Domain age analysis
- Suspicious pattern detection

## Running the Application

### Development

Run two processes in separate terminals:

```bash
# Terminal 1: API server
pnpm run dev:api

# Terminal 2: Background worker
pnpm run dev:worker
```

### Production

```bash
# Start API server
pnpm start

# Start worker (in a separate process/terminal)
pnpm run start:worker
```

## Bulk Validation API

### Upload CSV for Validation

```bash
POST /api/bulk/upload
Content-Type: multipart/form-data

# Upload a CSV file with email addresses
```

Response:
```json
{
  "jobId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "status": "pending",
  "message": "File uploaded successfully. Processing will begin shortly."
}
```

### Get All Jobs

```bash
GET /api/bulk/jobs
Authorization: Bearer <token>
```

### Get Job Status

```bash
GET /api/bulk/jobs/:id
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "status": "processing",
  "progress": 45,
  "counts": {
    "total": 1000,
    "valid": 400,
    "invalid": 50,
    "risky": 0,
    "unknown": 0
  },
  "createdAt": "2024-10-03T12:00:00.000Z",
  "updatedAt": "2024-10-03T12:05:00.000Z",
  "hasResults": false
}
```

### Download Results

```bash
GET /api/bulk/jobs/:id/download
Authorization: Bearer <token>
```

Returns a CSV file with validation results.

## CSV Format

### Input CSV
The worker accepts CSV files with an `email` column (case-insensitive):

```csv
email
john@example.com
jane@example.com
```

Or just a single column of emails:
```csv
john@example.com
jane@example.com
```

### Output CSV
Results include all validation details:

```csv
email,status,riskScore,reason,syntax,dns,mx,smtp,disposable,freeEmail,roleAccount,suspiciousPattern
john@example.com,valid,0,Email is valid,Yes,Yes,Yes,Yes,No,No,No,No
```

## Environment Variables

See `.env.example` for required configuration.
