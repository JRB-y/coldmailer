import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getWritableDir = (subfolder) => {
  // /tmp is the only writable location in Vercel serverless env
  const baseDir =
    process.env.VERCEL || process.env.NODE_ENV === 'production'
      ? '/tmp'
      : path.join(__dirname, '..')
  const dir = path.join(baseDir, subfolder)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return dir
}

// Create uploads directory if it doesn't exist
const uploadsDir = getWritableDir('uploads')
const resultsDir = getWritableDir('results')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  },
})

// File filter to only allow CSV files
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true)
  } else {
    cb(new Error('Only CSV files are allowed'), false)
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})
