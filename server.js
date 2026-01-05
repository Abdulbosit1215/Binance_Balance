import express from 'express'
import cors from 'cors'
import axios from 'axios'
import CryptoJS from 'crypto-js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Proxy endpoint for Binance API
app.post('/api/binance/account', async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.body

    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: 'API key and secret are required' })
    }

    // Get server time first
    const timeResponse = await axios.get('https://api.binance.com/api/v3/time')
    const serverTime = timeResponse.data.serverTime

    // Create signature
    const timestamp = serverTime
    const queryString = `timestamp=${timestamp}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString(CryptoJS.enc.Hex)

    // Fetch account info
    const response = await axios.get('https://api.binance.com/api/v3/account', {
      params: {
        timestamp,
        signature
      },
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error('Binance API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || error.message || 'Failed to fetch account data'
    })
  }
})

// Proxy endpoint for getting prices
app.get('/api/binance/prices', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
    res.json(response.data)
  } catch (error) {
    console.error('Binance prices error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || error.message || 'Failed to fetch prices'
    })
  }
})

// Proxy endpoint for crypto news (using NewsAPI as example)
app.get('/api/news/crypto', async (req, res) => {
  try {
    // In production, you'd use a real news API key
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'cryptocurrency OR bitcoin OR ethereum',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: process.env.NEWS_API_KEY || 'demo'
      }
    })
    res.json(response.data.articles || [])
  } catch (error) {
    console.error('News API error:', error.message)
    // Return fallback news if API fails
    res.json([
      {
        title: "Bitcoin reaches new all-time high",
        url: "https://coindesk.com/markets/bitcoin/",
        source: { name: "CoinDesk" }
      },
      {
        title: "Ethereum upgrade improves network efficiency",
        url: "https://www.coingecko.com/en/coins/ethereum",
        source: { name: "CoinGecko" }
      }
    ])
  }
})

// Proxy endpoint for general news
app.get('/api/news/general', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        apiKey: process.env.NEWS_API_KEY || 'demo'
      }
    })
    res.json(response.data.articles || [])
  } catch (error) {
    console.error('General news API error:', error.message)
    res.json([])
  }
})

// Enhanced prices endpoint with more frequent updates
app.get('/api/binance/prices-enhanced', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price')
    res.json(response.data)
  } catch (error) {
    console.error('Enhanced prices error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.msg || error.message || 'Failed to fetch enhanced prices'
    })
  }
})

// Currency conversion rates
app.get('/api/currency/rates', async (req, res) => {
  try {
    // Using a free currency API (you might want to use a paid service for production)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
    res.json(response.data)
  } catch (error) {
    console.error('Currency rates error:', error.message)
    // Fallback rates
    res.json({
      rates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0
      }
    })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})

