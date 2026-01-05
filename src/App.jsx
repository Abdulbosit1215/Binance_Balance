import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import TotalPnLGraph from './components/TotalPnLGraph'
import GraphModal from './components/GraphModal'
import CryptoNewsRunner from './components/CryptoNewsRunner'
import CryptoCalendar from './components/CryptoCalendar'
import LivePriceTracker from './components/LivePriceTracker'
import GeneralNews from './components/GeneralNews'
import MainMenu from './components/MainMenu'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [balances, setBalances] = useState([])
  const [previousBalances, setPreviousBalances] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [tokenBalanceType, setTokenBalanceType] = useState('usdValue')
  const [timeFrame, setTimeFrame] = useState('1h')
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false) // New state for calendar visibility
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(180000) // 3 minutes
  const [wishlist, setWishlist] = useState([])
  const [newWishlistItem, setNewWishlistItem] = useState('')
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [newsSearchTerm, setNewsSearchTerm] = useState('')
  const [newsCategory, setNewsCategory] = useState('all')
  const [currencyConverter, setCurrencyConverter] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '',
    result: '',
    rates: {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_JPY': 110.0,
      'EUR_USD': 1.18,
      'GBP_USD': 1.37,
      'JPY_USD': 0.0091,
      'BTC_USD': 30000,
      'ETH_USD': 2000,
      'USD_BTC': 0.000033,
      'USD_ETH': 0.0005
    }
  })

  // Load saved API keys and previous balances from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('binance_api_key')
    const savedApiSecret = localStorage.getItem('binance_api_secret')
    const savedPreviousBalances = localStorage.getItem('binance_previous_balances')
    
    if (savedApiKey && savedApiSecret) {
      setApiKey(savedApiKey)
      setApiSecret(savedApiSecret)
      setIsConfigured(true)
    }
    
    if (savedPreviousBalances) {
      setPreviousBalances(JSON.parse(savedPreviousBalances))
    }
    
    const savedHistoricalData = localStorage.getItem('binance_historical_data')
    if (savedHistoricalData) {
      setHistoricalData(JSON.parse(savedHistoricalData))
    }
    
    const savedInterval = localStorage.getItem('autoRefreshInterval')
    if (savedInterval) {
      setAutoRefreshInterval(Number(savedInterval))
    }

    const savedWishlist = localStorage.getItem('binance_wishlist')
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
  }, [])

  // Fetch balance from Binance
  const fetchBalance = useCallback(async () => {
    if (!apiKey || !apiSecret) {
      setError('Please configure your API keys')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Fetch account info through proxy server
      const response = await axios.post('http://localhost:3001/api/binance/account', {
        apiKey,
        apiSecret
      })

      // Process balances - filter out zero balances and convert to numbers
      const accountBalances = response.data.balances
        .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map(b => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked)
        }))
        .filter(b => b.total > 0)
        .sort((a, b) => b.total - a.total)

      // Get USD price for each asset - try multiple quote currencies with enhanced API
      const usdPrices = {}
      try {
        // Use enhanced prices endpoint for better real-time data
        const pricesResponse = await axios.get('http://localhost:3001/api/binance/prices-enhanced')
        const allPrices = pricesResponse.data

        // Get base prices for conversion
        let btcUsdtPrice = 0
        let ethUsdtPrice = 0
        let busdUsdtPrice = 1
        let bnbUsdtPrice = 0

        allPrices.forEach(ticker => {
          if (ticker.symbol === 'BTCUSDT') btcUsdtPrice = parseFloat(ticker.price)
          if (ticker.symbol === 'ETHUSDT') ethUsdtPrice = parseFloat(ticker.price)
          if (ticker.symbol === 'BUSDUSDT') busdUsdtPrice = parseFloat(ticker.price)
          if (ticker.symbol === 'BNBUSDT') bnbUsdtPrice = parseFloat(ticker.price)
        })

        // Cache prices for faster subsequent loads
        const priceCache = {}
        allPrices.forEach(ticker => {
          priceCache[ticker.symbol] = parseFloat(ticker.price)
        })
        localStorage.setItem('price_cache', JSON.stringify(priceCache))

        const STABLE_COINS = ['USDT', 'BUSD', 'USDC', 'DAI', 'TUSD'];

        // First pass: Direct USDT/BUSD pairs and handle "LD" assets
        allPrices.forEach(ticker => {
          const symbol = ticker.symbol;
          const price = parseFloat(ticker.price);

          // Direct USDT pairs
          if (symbol.endsWith('USDT')) {
            const asset = symbol.replace('USDT', '');
            if (!usdPrices[asset]) {
              usdPrices[asset] = price;
            }
          }
          // Direct BUSD pairs
          else if (symbol.endsWith('BUSD')) {
            const asset = symbol.replace('BUSD', '');
            if (!usdPrices[asset]) {
              usdPrices[asset] = price * busdUsdtPrice;
            }
          }
        });

        // Add stablecoins with their direct values (or BUSDUSDT converted)
        usdPrices['USDT'] = 1;
        usdPrices['BUSD'] = busdUsdtPrice;
        usdPrices['USDC'] = 1; // Assuming USDC is generally 1:1

        // Second pass: Handle "LD" assets and conversions if not already priced
        accountBalances.forEach(balance => {
          const asset = balance.asset;
          if (asset.startsWith('LD') && !usdPrices[asset]) {
            const baseAsset = asset.substring(2); // Strip "LD"
            if (usdPrices[baseAsset]) {
              usdPrices[asset] = usdPrices[baseAsset];
            }
          }
        });

        // Third pass: Convert from BTC, ETH, BNB if still no direct USD price
        allPrices.forEach(ticker => {
          const symbol = ticker.symbol;
          const price = parseFloat(ticker.price);

          // BTC pairs - convert to USD
          if (symbol.endsWith('BTC') && btcUsdtPrice > 0) {
            const asset = symbol.replace('BTC', '');
            if (!usdPrices[asset]) {
              usdPrices[asset] = price * btcUsdtPrice;
            }
          }
          // ETH pairs - convert to USD
          else if (symbol.endsWith('ETH') && ethUsdtPrice > 0) {
            const asset = symbol.replace('ETH', '');
            if (!usdPrices[asset]) {
              usdPrices[asset] = price * ethUsdtPrice;
            }
          }
          // BNB pairs - convert to USD
          else if (symbol.endsWith('BNB') && bnbUsdtPrice > 0) {
            const asset = symbol.replace('BNB', '');
            if (!usdPrices[asset]) {
              usdPrices[asset] = price * bnbUsdtPrice;
            }
          }
        });

      } catch (err) {
        console.error('Error fetching prices:', err)
      }

      // Calculate USD values and changes
      const balancesWithChanges = accountBalances.map(balance => {
        const price = usdPrices[balance.asset] || 0
        const usdValue = balance.total * price
        const previous = previousBalances[balance.asset] || { total: balance.total, usdValue }
        const change = balance.total - previous.total
        const changePercent = previous.total > 0 ? ((change / previous.total) * 100) : 0
        const usdChange = usdValue - previous.usdValue

        return {
          ...balance,
          price,
          usdValue,
          change,
          changePercent,
          usdChange
        }
      })

      setBalances(balancesWithChanges)
      setLastUpdate(new Date())

      // Calculate total portfolio value
      const totalPortfolioValue = balancesWithChanges.reduce((sum, b) => sum + b.usdValue, 0)
      
      // Get initial portfolio value from historical data
      const initialValue = historicalData.length > 0 ? historicalData[0].totalValue : totalPortfolioValue
      const pnl = totalPortfolioValue - initialValue

      // Update historical data
      const newHistoricalEntry = {
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        totalValue: totalPortfolioValue,
        pnl: pnl
      }

      // Add per-asset historical data
      const assetHistory = {}
      balancesWithChanges.forEach(b => {
        if (!assetHistory[b.asset]) {
          assetHistory[b.asset] = []
        }
        assetHistory[b.asset].push({
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          balance: b.total,
          usdValue: b.usdValue
        })
      })

      // Update historical data arrays
      const updatedHistorical = [...historicalData, newHistoricalEntry]
      // Keep only last 100 entries to prevent localStorage from getting too large
      const trimmedHistorical = updatedHistorical.slice(-100)
      
      // Update per-asset history
      const existingAssetHistory = JSON.parse(localStorage.getItem('binance_asset_history') || '{}')
      Object.keys(assetHistory).forEach(asset => {
        if (!existingAssetHistory[asset]) {
          existingAssetHistory[asset] = []
        }
        existingAssetHistory[asset] = [...(existingAssetHistory[asset] || []), ...assetHistory[asset]]
        // Keep only last 100 entries per asset
        existingAssetHistory[asset] = existingAssetHistory[asset].slice(-100)
      })
      
      setHistoricalData(trimmedHistorical)
      localStorage.setItem('binance_historical_data', JSON.stringify(trimmedHistorical))
      localStorage.setItem('binance_asset_history', JSON.stringify(existingAssetHistory))

      // Save current balances as previous for next comparison
      const newPreviousBalances = {}
      balancesWithChanges.forEach(b => {
        newPreviousBalances[b.asset] = {
          total: b.total,
          usdValue: b.usdValue
        }
      })
      setPreviousBalances(newPreviousBalances)
      localStorage.setItem('binance_previous_balances', JSON.stringify(newPreviousBalances))
    } catch (err) {
      console.error('Error fetching balance:', err)
      setError(err.response?.data?.msg || err.message || 'Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }, [apiKey, apiSecret, previousBalances])

  const handleSaveKeys = () => {
    if (apiKey && apiSecret) {
      localStorage.setItem('binance_api_key', apiKey)
      localStorage.setItem('binance_api_secret', apiSecret)
      setIsConfigured(true)
      setError('')
    } else {
          setError('Please enter both API key and secret')
    }
  }

  const handleAddWishlistItem = () => {
    if (newWishlistItem.trim() && !wishlist.includes(newWishlistItem.trim().toUpperCase())) {
      const updatedWishlist = [...wishlist, newWishlistItem.trim().toUpperCase()]
      setWishlist(updatedWishlist)
      localStorage.setItem('binance_wishlist', JSON.stringify(updatedWishlist))
      setNewWishlistItem('')
    }
  }

  const handleRemoveWishlistItem = (itemToRemove) => {
    const updatedWishlist = wishlist.filter(item => item !== itemToRemove)
    setWishlist(updatedWishlist)
    localStorage.setItem('binance_wishlist', JSON.stringify(updatedWishlist))
  }

  const handleClearKeys = () => {
    localStorage.removeItem('binance_api_key')
    localStorage.removeItem('binance_api_secret')
    setApiKey('')
    setApiSecret('')
    setIsConfigured(false)
    setBalances([])
    setPreviousBalances({})
  }

  // Auto-refresh every 2-3 minutes if configured
  useEffect(() => {
    if (isConfigured) {
      fetchBalance()
      const interval = setInterval(fetchBalance, autoRefreshInterval)
      return () => clearInterval(interval)
    }
  }, [isConfigured, fetchBalance, autoRefreshInterval])


  const formatNumber = (num) => {
    if (num === 0) return '0.00'
    if (Math.abs(num) < 0.01) return num.toFixed(6)
    if (Math.abs(num) < 1) return num.toFixed(4)
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatCurrency = (num) => {
    return `$${formatNumber(num)}`
  }

  return (
    <div className="app">
      <div className="container">
        <div className="signature">BoSs007</div>
        <header className="header">
          <h1>Binance Balance Tracker</h1>
          <div className="header-actions">
            <button
              onClick={() => setShowMainMenu(true)}
              className="btn btn-menu icon-only"
              title="Main Menu"
            >
              ☰
            </button>
            {lastUpdate && (
              <p className="last-update">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </header>

        <CryptoNewsRunner />

        {/* Calendar is now conditionally rendered within a modal */}
        <LivePriceTracker />

        <GeneralNews />

        {showMainMenu && (
          <MainMenu
            apiKey={apiKey}
            setApiKey={setApiKey}
            apiSecret={apiSecret}
            setApiSecret={setApiSecret}
            isConfigured={isConfigured}
            handleSaveKeys={handleSaveKeys}
            handleClearKeys={handleClearKeys}
            wishlist={wishlist}
            newWishlistItem={newWishlistItem}
            setNewWishlistItem={setNewWishlistItem}
            handleAddWishlistItem={handleAddWishlistItem}
            handleRemoveWishlistItem={handleRemoveWishlistItem}
            autoRefreshInterval={autoRefreshInterval}
            setAutoRefreshInterval={setAutoRefreshInterval}
            showSettings={showMainMenu}
            setShowSettings={setShowMainMenu}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            newsSearchTerm={newsSearchTerm}
            setNewsSearchTerm={setNewsSearchTerm}
            newsCategory={newsCategory}
            setNewsCategory={setNewsCategory}
            currencyConverter={currencyConverter}
            setCurrencyConverter={setCurrencyConverter}
            onClose={() => setShowMainMenu(false)}
          />
        )}

        {!isConfigured ? (
          <div className="config-panel">
            <h2>Configure API Keys</h2>
            <p className="info-text">
              Enter your Binance API key and secret. They will be stored locally in your browser.
            </p>
            <div className="input-group">
              <label>API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Binance API Key"
              />
            </div>
            <div className="input-group">
              <label>API Secret</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your Binance API Secret"
              />
            </div>
            <button onClick={handleSaveKeys} className="btn btn-primary">
              Save & Connect
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        ) : (
          <>
            <div className="controls">
              <button onClick={fetchBalance} className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Balance'}
              </button>
              <div className="settings-menu">
                <button onClick={() => setShowSettings(!showSettings)} className="btn btn-settings icon-only" title="Settings">
                  ⚙️
                </button>
                <button onClick={() => setShowCalendar(!showCalendar)} className="btn btn-settings icon-only" title="Calendar">
                  🗓️
                </button>
                {showSettings && (
                  <div className="settings-dropdown">
                    <div className="settings-item">
                      <label>Auto-refresh interval:</label>
                      <select 
                        value={autoRefreshInterval} 
                        onChange={(e) => {
                          setAutoRefreshInterval(Number(e.target.value))
                          localStorage.setItem('autoRefreshInterval', e.target.value)
                        }}
                      >
                        <option value={120000}>2 minutes</option>
                        <option value={180000}>3 minutes</option>
                        <option value={300000}>5 minutes</option>
                        <option value={600000}>10 minutes</option>
                      </select>
                    </div>
                    <div className="settings-item">
                      <button onClick={handleClearKeys} className="btn btn-danger">
                        Clear API Keys
                      </button>
                    </div>
                    <div className="settings-item">
                      <button onClick={() => {
                        localStorage.removeItem('binance_historical_data')
                        localStorage.removeItem('binance_asset_history')
                        localStorage.removeItem('binance_previous_balances')
                        setHistoricalData([])
                        setPreviousBalances({})
                        alert('Historical data cleared!')
                      }} className="btn btn-danger">
                        Clear Historical Data
                      </button>
                    </div>
                    <div className="settings-item">
                      <button onClick={() => {
                        localStorage.removeItem('binance_wishlist')
                        setWishlist([])
                        alert('Wishlist cleared!')
                      }} className="btn btn-danger">
                        Clear Wishlist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showCalendar && (
              <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
                <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="calendar-modal-header">
                    <h2>Crypto Calendar</h2>
                    <button className="modal-close" onClick={() => setShowCalendar(false)}>&times;</button>
                  </div>
                  <div className="calendar-modal-body">
                    <CryptoCalendar />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="error">{error}</p>}

            {historicalData.length > 0 && (
              <div className="graph-section">
                <TotalPnLGraph data={historicalData} timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
              </div>
            )}


            {balances.length > 0 && (
              <div className="balances-container">
                <h2>Your Balances</h2>
                <p className="info-text">Click on any token card to view its historical graph</p>
                <div className="balances-grid">
                  {balances.map((balance) => (
                    <div
                      key={balance.asset}
                      className="balance-card clickable"
                      onClick={() => {
                        const assetHistory = JSON.parse(localStorage.getItem('binance_asset_history') || '{}')
                        setSelectedToken({
                          asset: balance.asset,
                          data: assetHistory[balance.asset] || []
                        })
                      }}
                    >
                      <div className="balance-header">
                        <h3 className={`crypto-name ${
                          STABLE_COINS.includes(balance.asset) ? 'stablecoin' :
                          (balance.usdChange > 0 ? 'profit' : balance.usdChange < 0 ? 'loss' : '')
                        }`}>
                          {balance.asset}
                        </h3>
                        <span className={`usd-value ${balance.usdValue === 0 ? 'no-value' : ''}`}>
                          {balance.usdValue > 0 ? formatCurrency(balance.usdValue) : 'Price N/A'}
                        </span>
                      </div>
                      <div className="balance-details">
                        <div className="balance-row">
                          <span>Total:</span>
                          <span className="balance-amount">{formatNumber(balance.total)}</span>
                        </div>
                        <div className="balance-row price-row">
                          <span>Real-time Price:</span>
                          {balance.price > 0 ? (
                            <span className="real-time-price">{formatCurrency(balance.price)}</span>
                          ) : (
                            <span className="no-price">Price not available</span>
                          )}
                        </div>
                        <div className="balance-row change-row">
                          <span>Change:</span>
                          <span
                            className={`change-value ${
                              balance.change > 0
                                ? 'positive'
                                : balance.change < 0
                                ? 'negative'
                                : 'neutral'
                            }`}
                          >
                            {balance.change > 0 ? '+' : ''}
                            {formatNumber(balance.change)} (
                            {balance.changePercent > 0 ? '+' : ''}
                            {formatNumber(balance.changePercent)}%)
                          </span>
                        </div>
                        {balance.usdChange !== 0 && (
                          <div className="balance-row change-row">
                            <span>USD Change:</span>
                            <span
                              className={`change-value ${
                                balance.usdChange > 0
                                  ? 'positive'
                                  : balance.usdChange < 0
                                  ? 'negative'
                                  : 'neutral'
                              }`}
                            >
                              {balance.usdChange > 0 ? '+' : ''}
                              {formatCurrency(balance.usdChange)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {balances.length === 0 && !loading && !error && (
              <p className="info-text">Click "Refresh Balance" to fetch your balances</p>
            )}

            <GraphModal
              isOpen={selectedToken !== null}
              onClose={() => setSelectedToken(null)}
              asset={selectedToken?.asset || ''}
              historicalData={selectedToken?.data || []}
              balanceType={tokenBalanceType}
              setBalanceType={setTokenBalanceType}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App

