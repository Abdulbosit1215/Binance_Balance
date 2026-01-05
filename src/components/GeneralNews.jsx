import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GeneralNews.css';

function GeneralNews() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);

  const categories = [
    'all', 'business', 'technology', 'sports', 'health', 'science', 'entertainment'
  ];

  // Fetch news from API
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:3001/api/news/general');
      const articles = response.data.map((article, index) => ({
        id: article.url || index,
        title: article.title || 'No title',
        content: article.description || 'No description available',
        category: categorizeArticle(article),
        url: article.url || '#',
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage
      }));

      setNewsArticles(articles);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Using fallback content.');

      // Fallback news if API fails
      setNewsArticles([
        { id: 1, title: 'Global Markets React to Economic Data', content: 'Stock markets saw mixed reactions today as investors digest the latest economic indicators...', category: 'business', url: "https://www.reuters.com/markets/global-markets-wrapup/", source: 'Reuters' },
        { id: 2, title: 'Tech Giants Announce New Innovations', content: 'Leading tech companies unveiled their latest products and services at major industry events...', category: 'technology', url: "https://techcrunch.com/", source: 'TechCrunch' },
        { id: 3, title: 'Political Debate Heats Up Ahead of Election', content: 'Candidates discussed key issues in a lively debate covering economy, foreign policy, and social issues...', category: 'general', url: "https://www.bbc.com/news/world-us-canada", source: 'BBC News' },
        { id: 4, title: 'New Study on Climate Change Impacts', content: 'Scientists presented findings on rising global temperatures and environmental challenges...', category: 'science', url: "https://www.nytimes.com/section/climate", source: 'NYTimes' },
        { id: 5, title: 'Sports World Celebrates Championship Win', content: 'The team clinched the title in a thrilling match that went down to the final moments...', category: 'sports', url: "https://www.espn.com/", source: 'ESPN' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Categorize articles based on content
  const categorizeArticle = (article) => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();

    if (title.includes('tech') || title.includes('software') || title.includes('app') || title.includes('digital')) return 'technology';
    if (title.includes('business') || title.includes('market') || title.includes('economy') || title.includes('stock')) return 'business';
    if (title.includes('sport') || title.includes('football') || title.includes('game') || title.includes('tournament')) return 'sports';
    if (title.includes('health') || title.includes('medical') || title.includes('disease')) return 'health';
    if (title.includes('science') || title.includes('research') || title.includes('study')) return 'science';
    if (title.includes('entertainment') || title.includes('movie') || title.includes('music') || title.includes('celebrity')) return 'entertainment';

    return 'general';
  };

  // Filter news based on keyword and category
  const filteredNews = newsArticles.filter(article => {
    const matchesKeyword = filterKeyword.trim() === '' ||
      article.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      article.content.toLowerCase().includes(filterKeyword.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  // Auto-refresh news every 10 minutes
  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <div className="general-news-container">
      <div className="news-header">
        <h2>General News</h2>
        <div className="news-controls">
          <div className="news-refresh">
            <button onClick={fetchNews} disabled={loading} className="btn-refresh-news">
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
            {lastUpdate && (
              <span className="last-updated">Updated: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="news-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search news..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="news-search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="news-error">⚠️ {error}</div>}

      <div className="news-grid">
        {loading ? (
          <div className="news-loading">
            <div className="loading-spinner"></div>
            <p>Loading latest news...</p>
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.slice(0, 12).map(article => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
              <div className="news-card">
                {article.imageUrl && (
                  <div className="news-image">
                    <img src={article.imageUrl} alt={article.title} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="news-content">
                  <h3>{article.title}</h3>
                  <p>{article.content}</p>
                  <div className="news-meta">
                    <span className={`news-category ${article.category}`}>{article.category}</span>
                    <span className="news-source">{article.source}</span>
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="no-news">
            <div className="no-news-icon">📰</div>
            <p>No news articles found matching your search.</p>
            <button onClick={() => { setFilterKeyword(''); setSelectedCategory('all'); }} className="btn-reset">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneralNews;

