import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MainMenu.css';

function MainMenu({
  // API related props
  apiKey,
  setApiKey,
  apiSecret,
  setApiSecret,
  isConfigured,
  handleSaveKeys,
  handleClearKeys,

  // Wishlist related props
  wishlist,
  newWishlistItem,
  setNewWishlistItem,
  handleAddWishlistItem,
  handleRemoveWishlistItem,

  // Settings related props
  autoRefreshInterval,
  setAutoRefreshInterval,
  showSettings,
  setShowSettings,
  showCalendar,
  setShowCalendar,

  // News related props
  newsSearchTerm,
  setNewsSearchTerm,
  newsCategory,
  setNewsCategory,

  // Currency converter props
  currencyConverter,
  setCurrencyConverter,

  // Close function
  onClose
}) {
  const [activeTab, setActiveTab] = useState('api');
  const [exchangeRates, setExchangeRates] = useState(null);

  const menuTabs = [
    { id: 'api', label: 'API', icon: '🔑' },
    { id: 'wishlist', label: 'Wishlist', icon: '⭐' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'currency', label: 'Currency', icon: '💱' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Fetch exchange rates when currency tab is opened
  useEffect(() => {
    if (activeTab === 'currency' && !exchangeRates) {
      fetchExchangeRates();
    }
  }, [activeTab, exchangeRates]);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/currency/rates');
      setExchangeRates(response.data.rates);
      // Update the currency converter rates
      setCurrencyConverter(prev => ({
        ...prev,
        rates: response.data.rates
      }));
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Keep fallback rates
    }
  };

  const newsCategories = [
    'All', 'Crypto', 'Stocks', 'Economy', 'Technology', 'Politics', 'Health', 'Sports'
  ];

  return (
    <div className="main-menu-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="main-menu-container">
        <div className="main-menu-header">
          <h3>Main Menu</h3>
          <button className="menu-close" onClick={onClose}>×</button>
        </div>

        <div className="main-menu-tabs">
          {menuTabs.map(tab => (
            <button
              key={tab.id}
              className={`menu-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="main-menu-content">
          {activeTab === 'api' && (
            <div className="menu-section">
              <h4>API Configuration</h4>
              <p className="menu-description">
                Configure your Binance API keys to track your portfolio.
                Keys are stored locally in your browser.
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
              <div className="menu-actions">
                <button onClick={handleSaveKeys} className="btn btn-primary">
                  {isConfigured ? 'Update Keys' : 'Save & Connect'}
                </button>
                {isConfigured && (
                  <button onClick={handleClearKeys} className="btn btn-danger">
                    Clear Keys
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="menu-section">
              <h4>Crypto Wishlist</h4>
              <p className="menu-description">
                Add crypto assets you want to track. Assets will be monitored for price changes.
              </p>
              <div className="input-group">
                <input
                  type="text"
                  value={newWishlistItem}
                  onChange={(e) => setNewWishlistItem(e.target.value)}
                  placeholder="e.g., BTC, ETH, SOL"
                />
                <button onClick={handleAddWishlistItem} className="btn btn-primary">
                  Add to Wishlist
                </button>
              </div>
              {wishlist.length > 0 && (
                <div className="wishlist-items">
                  <h5>Your Wishlist ({wishlist.length} items)</h5>
                  <div className="wishlist-grid">
                    {wishlist.map(item => (
                      <div key={item} className="wishlist-item">
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemoveWishlistItem(item)}
                          className="btn btn-danger btn-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wishlist.length === 0 && (
                <p className="menu-description">Your wishlist is empty. Add some assets!</p>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="menu-section">
              <h4>News Settings</h4>
              <p className="menu-description">
                Configure news filtering and search preferences.
              </p>
              <div className="input-group">
                <label>Search News</label>
                <input
                  type="text"
                  value={newsSearchTerm}
                  onChange={(e) => setNewsSearchTerm(e.target.value)}
                  placeholder="Search news by keyword..."
                />
              </div>
              <div className="input-group">
                <label>Category Filter</label>
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value)}
                >
                  {newsCategories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="news-info">
                <p>📰 News feeds are updated in real-time</p>
                <p>🔗 Clicking news opens the original source</p>
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="menu-section">
              <h4>Currency Converter</h4>
              <p className="menu-description">
                Convert between different currencies using real-time rates.
              </p>
              <div className="currency-converter">
                <div className="converter-inputs">
                  <div className="input-group">
                    <label>From Currency</label>
                    <select
                      value={currencyConverter.fromCurrency}
                      onChange={(e) => setCurrencyConverter(prev => ({
                        ...prev,
                        fromCurrency: e.target.value
                      }))}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="BTC">BTC - Bitcoin</option>
                      <option value="ETH">ETH - Ethereum</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={currencyConverter.amount}
                      onChange={(e) => setCurrencyConverter(prev => ({
                        ...prev,
                        amount: e.target.value
                      }))}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="input-group">
                    <label>To Currency</label>
                    <select
                      value={currencyConverter.toCurrency}
                      onChange={(e) => setCurrencyConverter(prev => ({
                        ...prev,
                        toCurrency: e.target.value
                      }))}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="BTC">BTC - Bitcoin</option>
                      <option value="ETH">ETH - Ethereum</option>
                    </select>
                  </div>
                </div>
                <div className="converter-result">
                  <div className="result-display">
                    <span className="result-amount">
                      {currencyConverter.result ? `${currencyConverter.result} ${currencyConverter.toCurrency}` : 'Enter amount to convert'}
                    </span>
                    {exchangeRates && (
                      <span className="exchange-rate">
                        1 {currencyConverter.fromCurrency} = {(exchangeRates[currencyConverter.toCurrency] / exchangeRates[currencyConverter.fromCurrency]).toFixed(4)} {currencyConverter.toCurrency}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (exchangeRates && currencyConverter.amount) {
                        const fromRate = exchangeRates[currencyConverter.fromCurrency] || 1;
                        const toRate = exchangeRates[currencyConverter.toCurrency] || 1;
                        const convertedAmount = (parseFloat(currencyConverter.amount) / fromRate) * toRate;
                        const result = convertedAmount.toFixed(4);
                        setCurrencyConverter(prev => ({
                          ...prev,
                          result: result
                        }));
                      }
                    }}
                    className="btn btn-primary"
                    disabled={!currencyConverter.amount || currencyConverter.fromCurrency === currencyConverter.toCurrency || !exchangeRates}
                  >
                    Convert
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="menu-section">
              <h4>Application Settings</h4>
              <p className="menu-description">
                Configure auto-refresh intervals and other app preferences.
              </p>
              <div className="input-group">
                <label>Auto-refresh Interval</label>
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
                  <option value={900000}>15 minutes</option>
                </select>
              </div>
              <div className="settings-actions">
                <button
                  onClick={() => {
                    localStorage.removeItem('binance_historical_data')
                    localStorage.removeItem('binance_asset_history')
                    localStorage.removeItem('binance_previous_balances')
                    alert('Historical data cleared!')
                  }}
                  className="btn btn-danger"
                >
                  Clear Historical Data
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('binance_wishlist')
                    alert('Wishlist cleared!')
                  }}
                  className="btn btn-danger"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
