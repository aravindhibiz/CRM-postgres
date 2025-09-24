const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    name: 'SalesFlow Pro'
  })
})

// API endpoint for basic info
app.get('/api/info', (req, res) => {
  res.json({
    app: 'SalesFlow Pro',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Handle client-side routing - send all non-API requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SalesFlow Pro server running on port ${PORT}`)
  console.log(`📊 Health check available at /health`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app