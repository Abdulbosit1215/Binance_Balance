import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './CryptoNewsRunner.css';

function CryptoNewsRunner() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSentiment = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("rally") || lowerTitle.includes("surge") || lowerTitle.includes("grows") ||
        lowerTitle.includes("launches") || lowerTitle.includes("promising") || lowerTitle.includes("celebrates") ||
        lowerTitle.includes("hope") || lowerTitle.includes("breakthroughs") || lowerTitle.includes("bullish") ||
        lowerTitle.includes("gains") || lowerTitle.includes("up") || lowerTitle.includes("rise")) {
      return 'positive';
    } else if (lowerTitle.includes("dip") || lowerTitle.includes("high fees") || lowerTitle.includes("congestion") ||
               lowerTitle.includes("impact") || lowerTitle.includes("crash") || lowerTitle.includes("bearish") ||
               lowerTitle.includes("falls") || lowerTitle.includes("down") || lowerTitle.includes("decline") ||
               lowerTitle.includes("hack") || lowerTitle.includes("scam")) {
      return 'negative';
    }
    return 'neutral';
  };

  // Fetch crypto news from API
  const fetchCryptoNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:3001/api/news/crypto');
      const articles = response.data.map((article, index) => ({
        id: article.url || index,
        title: article.title || 'Crypto News Update',
        url: article.url || '#',
        sentiment: getSentiment(article.title || ''),
        source: article.source?.name || 'Crypto News',
        publishedAt: article.publishedAt
      }));

      if (articles.length > 0) {
        setNewsItems(articles);
      } else {
        // Fallback news if API returns empty
        setNewsItems([
          { id: 1, title: "Bitcoin sees slight dip after recent rally.", url: "https://coindesk.com/markets/bitcoin/", sentiment: 'negative' },
          { id: 2, title: "Ethereum gas fees remain high amidst network congestion.", url: "https://www.coingecko.com/en/coins/ethereum", sentiment: 'negative' },
          { id: 3, title: "New DeFi project launches with promising tokenomics.", url: "https://defipulse.com/", sentiment: 'positive' },
          { id: 4, title: "Major exchange announces support for new altcoin.", url: "https://www.binance.com/en/support/announcement", sentiment: 'positive' },
          { id: 5, title: "Regulatory discussions continue to impact crypto markets.", url: "https://www.reuters.com/technology/cryptocurrencies/", sentiment: 'neutral' },
          { id: 6, title: "NFT market volume experiences a surge in unique buyers.", url: "https://opensea.io/blog/news/", sentiment: 'positive' },
          { id: 7, title: "Central banks explore digital currency initiatives.", url: "https://www.imf.org/en/Topics/fintech/digital-currencies", sentiment: 'neutral' },
          { id: 8, title: "Institutional investment in blockchain technology grows.", url: "https://www.coinshares.com/research", sentiment: 'positive' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching crypto news:', err);
      setError('Failed to load crypto news');

      // Fallback news if API fails
      setNewsItems([
        { id: 1, title: "Bitcoin sees slight dip after recent rally.", url: "https://coindesk.com/markets/bitcoin/", sentiment: 'negative' },
        { id: 2, title: "Ethereum gas fees remain high amidst network congestion.", url: "https://www.coingecko.com/en/coins/ethereum", sentiment: 'negative' },
        { id: 3, title: "New DeFi project launches with promising tokenomics.", url: "https://defipulse.com/", sentiment: 'positive' },
        { id: 4, title: "Major exchange announces support for new altcoin.", url: "https://www.binance.com/en/support/announcement", sentiment: 'positive' },
        { id: 5, title: "Regulatory discussions continue to impact crypto markets.", url: "https://www.reuters.com/technology/cryptocurrencies/", sentiment: 'neutral' },
        { id: 6, title: "NFT market volume experiences a surge in unique buyers.", url: "https://opensea.io/blog/news/", sentiment: 'positive' },
        { id: 7, title: "Central banks explore digital currency initiatives.", url: "https://www.imf.org/en/Topics/fintech/digital-currencies", sentiment: 'neutral' },
        { id: 8, title: "Institutional investment in blockchain technology grows.", url: "https://www.coinshares.com/research", sentiment: 'positive' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh crypto news every 5 minutes
  useEffect(() => {
    fetchCryptoNews();
    const interval = setInterval(fetchCryptoNews, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchCryptoNews]);

  return (
    <div className="news-runner-container">
      <div className="news-runner-header">
        <div className="news-runner-label">
          🚀 CRYPTO NEWS
          {loading && <span className="loading-dot">•</span>}
          {error && <span className="error-indicator">⚠️</span>}
        </div>
        <div className="news-runner-controls">
          <button onClick={fetchCryptoNews} disabled={loading} className="btn-refresh-ticker">
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {error && <div className="news-error-small">⚠️ News feed unavailable</div>}

      <div className="news-ticker">
        <div className="news-ticker-content">
          {newsItems.length > 0 ? (
            newsItems.concat(newsItems).map((newsItem, index) => ( // Duplicate for seamless loop
              <a
                key={`${newsItem.id}-${index}`}
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`news-item-link ${newsItem.sentiment}`}
              >
                <span className="news-item">
                  <span className="sentiment-icon">
                    {newsItem.sentiment === 'positive' ? '📈' :
                     newsItem.sentiment === 'negative' ? '📉' : '🔄'}
                  </span>
                  {newsItem.title}
                  <span className="news-source-tag">• {newsItem.source}</span>
                </span>
              </a>
            ))
          ) : (
            <span className="news-item loading">Loading crypto news...</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CryptoNewsRunner;

