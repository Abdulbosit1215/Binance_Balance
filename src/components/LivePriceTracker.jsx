import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LivePriceTracker.css';

function LivePriceTracker() {
  const [prices, setPrices] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const [updateInterval, setUpdateInterval] = useState(10000); // Default 10 seconds
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Define the assets we want to track
  const TRACKED_ASSETS = [
    { symbol: 'BTC', name: 'Bitcoin', crypto: true },
    { symbol: 'ETH', name: 'Ethereum', crypto: true },
    { symbol: 'BNB', name: 'Binance Coin', crypto: true },
    { symbol: 'SOL', name: 'Solana', crypto: true },
    { symbol: 'ADA', name: 'Cardano', crypto: true },
    { symbol: 'XRP', name: 'Ripple', crypto: true },
    { symbol: 'DOGE', name: 'Dogecoin', crypto: true },
    { symbol: 'DOT', name: 'Polkadot', crypto: true },
    { symbol: 'AVAX', name: 'Avalanche', crypto: true },
    { symbol: 'LINK', name: 'Chainlink', crypto: true },
    { symbol: 'UNI', name: 'Uniswap', crypto: true },
    { symbol: 'AAVE', name: 'Aave', crypto: true },
  ];

  // Available update intervals
  const INTERVAL_OPTIONS = [
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' },
    { value: 15000, label: '15s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' },
    { value: 300000, label: '5m' },
  ];

  // Fetch prices with smooth updates
  const fetchPrices = useCallback(async () => {
    try {
      setIsUpdating(true);

      // Fetch current prices from Binance
      const pricesResponse = await axios.get('http://localhost:3001/api/binance/prices-enhanced');
      const allPrices = pricesResponse.data;

      // Fetch 24h price changes from Binance
      const changeResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const priceChanges = changeResponse.data;

      // Create price change map
      const changeMap = {};
      priceChanges.forEach(ticker => {
        changeMap[ticker.symbol] = {
          priceChangePercent: parseFloat(ticker.priceChangePercent),
          lastPrice: parseFloat(ticker.lastPrice)
        };
      });

      // Process our tracked assets
      const processedPrices = TRACKED_ASSETS.map(asset => {
        const binanceSymbol = `${asset.symbol}USDT`;
        const priceData = changeMap[binanceSymbol];
        const previousPrice = previousPrices[asset.symbol];

        if (priceData) {
          const currentPrice = priceData.lastPrice;
          const priceChange = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

          return {
            ...asset,
            currentPrice,
            change24h: priceData.priceChangePercent,
            changeDirection: priceData.priceChangePercent >= 0 ? 'up' : 'down',
            priceChange: priceChange,
            isNewUpdate: !!previousPrice && Math.abs(priceChange) > 0.01, // Highlight significant changes
          };
        }

        // Fallback: try to find price from ticker prices
        const tickerPrice = allPrices.find(t => t.symbol === binanceSymbol);
        if (tickerPrice) {
          const currentPrice = parseFloat(tickerPrice.price);
          const previousPrice = previousPrices[asset.symbol];
          const priceChange = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

          return {
            ...asset,
            currentPrice,
            change24h: 0, // No change data available
            changeDirection: 'neutral',
            priceChange: priceChange,
            isNewUpdate: !!previousPrice && Math.abs(priceChange) > 0.01,
          };
        }

        // If no price found, return with placeholder
        return {
          ...asset,
          currentPrice: 0,
          change24h: 0,
          changeDirection: 'neutral',
          priceChange: 0,
          isNewUpdate: false,
        };
      });

      // Update previous prices for next comparison
      const newPreviousPrices = {};
      processedPrices.forEach(asset => {
        if (asset.currentPrice > 0) {
          newPreviousPrices[asset.symbol] = asset.currentPrice;
        }
      });
      setPreviousPrices(newPreviousPrices);

      setPrices(processedPrices);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching live prices:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [previousPrices]);

  // Set up automatic updates with selected interval
  useEffect(() => {
    fetchPrices();

    const interval = setInterval(fetchPrices, updateInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, updateInterval]);


  const formatPrice = (price, isCrypto) => {
    if (price === 0) return 'Price N/A';
    if (isCrypto) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <div className="live-price-tracker-container">
      <div className="price-tracker-header">
        <h2>Live Crypto Prices</h2>
        <div className="price-controls">
          <div className="interval-selector">
            <label>Update:</label>
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="interval-select"
            >
              {INTERVAL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="control-buttons">
            <button
              onClick={fetchPrices}
              disabled={isUpdating}
              className="btn-refresh"
              title="Refresh prices now"
            >
              🔄
            </button>
            <div className={`update-indicator ${isUpdating ? 'updating' : ''}`}>
              {isUpdating ? '🔄' : '✅'}
            </div>
          </div>
        </div>
      </div>

      <div className="price-grid">
        {prices.map(item => (
          <div
            key={item.symbol}
            className={`price-card ${item.changeDirection} ${item.isNewUpdate ? 'price-updated' : ''}`}
          >
            <div className="price-header">
              <span className="price-symbol">{item.symbol}</span>
              <span className="price-name">{item.name}</span>
              {item.isNewUpdate && (
                <span className="price-flash">⚡</span>
              )}
            </div>
            <div className="price-details">
              <span className={`current-price ${item.priceChange !== 0 ? (item.priceChange > 0 ? 'price-gain' : 'price-loss') : ''}`}>
                {formatPrice(item.currentPrice, item.crypto)}
              </span>
              <div className="change-indicators">
                <span className={`change-indicator ${item.changeDirection}`}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                </span>
                {item.priceChange !== 0 && (
                  <span className={`instant-change ${item.priceChange > 0 ? 'positive' : 'negative'}`}>
                    {item.priceChange > 0 ? '↗' : '↘'} {Math.abs(item.priceChange).toFixed(3)}%
                  </span>
                )}
              </div>
            </div>
            <div className="price-sparkline">
              <div className={`sparkline-bar ${item.changeDirection}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="price-update-info">
        <div className="update-status">
          {isUpdating ? (
            <span className="updating-indicator">
              <span className="pulse-dot"></span>
              Live
            </span>
          ) : (
            <span className="ready-indicator">
              <span className="ready-dot"></span>
              Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default LivePriceTracker;

