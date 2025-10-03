import mongoose from 'mongoose'

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coldmailer'

    await mongoose.connect(mongoUri)

    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
