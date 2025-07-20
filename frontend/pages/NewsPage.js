import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./NewsPage.css";

// Mock news data - in a real app, this would come from an API
const mockNewsData = {
  "Worldwide News": [
    {
      id: 1,
      title: "Global Climate Summit Reaches Historic Agreement",
      summary: "World leaders have agreed on ambitious new climate targets at the COP28 summit in Dubai, marking a significant step forward in global climate action.",
      content: "The landmark agreement includes commitments to triple renewable energy capacity by 2030 and phase out fossil fuels by 2050. Over 190 countries participated in the negotiations, which lasted two weeks...",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      author: "Sarah Johnson",
      publishedAt: "2024-01-15T10:30:00Z",
      readTime: "5 min read",
      category: "Worldwide News"
    },
    {
      id: 2,
      title: "Tech Giants Announce AI Safety Partnership",
      summary: "Leading technology companies have formed a new alliance to ensure responsible development of artificial intelligence technologies.",
      content: "The partnership, which includes major players like OpenAI, Google, and Microsoft, aims to establish industry-wide safety standards for AI development...",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop",
      author: "Michael Chen",
      publishedAt: "2024-01-15T09:15:00Z",
      readTime: "4 min read",
      category: "Worldwide News"
    }
  ],
  "India News": [
    {
      id: 3,
      title: "India's Digital Payment Revolution Continues",
      summary: "UPI transactions reach new heights as India leads the world in digital payment adoption.",
      content: "The Unified Payments Interface (UPI) has processed over 10 billion transactions in December 2023, marking a 60% increase from the previous year...",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      author: "Priya Sharma",
      publishedAt: "2024-01-15T08:45:00Z",
      readTime: "3 min read",
      category: "India News"
    },
    {
      id: 4,
      title: "Startup Ecosystem Thrives in Bangalore",
      summary: "Bangalore continues to be the startup capital of India with record-breaking funding in 2023.",
      content: "The city's startup ecosystem has attracted over $15 billion in funding this year, with fintech and edtech sectors leading the growth...",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
      author: "Rahul Verma",
      publishedAt: "2024-01-15T07:30:00Z",
      readTime: "6 min read",
      category: "India News"
    }
  ],
  "Sports": [
    {
      id: 5,
      title: "Cricket World Cup 2024: India vs Australia Final",
      summary: "India and Australia set to face off in the most anticipated cricket match of the year.",
      content: "The final match of the Cricket World Cup 2024 will be played at the iconic Melbourne Cricket Ground, with both teams in excellent form...",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      author: "David Warner",
      publishedAt: "2024-01-15T06:20:00Z",
      readTime: "4 min read",
      category: "Sports"
    },
    {
      id: 6,
      title: "Premier League: Title Race Heats Up",
      summary: "Manchester City and Arsenal battle for the top spot as the season reaches its climax.",
      content: "With just 10 games remaining, the Premier League title race is the closest it has been in years...",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      author: "James Wilson",
      publishedAt: "2024-01-15T05:10:00Z",
      readTime: "3 min read",
      category: "Sports"
    }
  ],
  "Technology": [
    {
      id: 7,
      title: "Quantum Computing Breakthrough Announced",
      summary: "Scientists achieve quantum supremacy with new 1000-qubit processor.",
      content: "A team of researchers has successfully demonstrated quantum supremacy with a processor containing over 1000 qubits...",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop",
      author: "Dr. Emily Zhang",
      publishedAt: "2024-01-15T04:00:00Z",
      readTime: "7 min read",
      category: "Technology"
    },
    {
      id: 8,
      title: "Electric Vehicle Sales Surge Globally",
      summary: "EV adoption accelerates as major automakers announce new electric models.",
      content: "Electric vehicle sales have increased by 40% globally in 2023, with Tesla, BYD, and Volkswagen leading the market...",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      author: "Lisa Thompson",
      publishedAt: "2024-01-15T03:30:00Z",
      readTime: "5 min read",
      category: "Technology"
    }
  ]
};

function NewsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newsData, setNewsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Worldwide News", "India News", "Sports", "Technology"];

  useEffect(() => {
    // Simulate API call to fetch news data
    const fetchNews = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsData(mockNewsData);
      setLoading(false);
    };

    fetchNews();
  }, []);

  // Filter news based on selected category and search query
  const getFilteredNews = () => {
    let filteredNews = [];
    
    if (selectedCategory === "All") {
      Object.values(newsData).forEach(categoryNews => {
        filteredNews = [...filteredNews, ...categoryNews];
      });
    } else {
      filteredNews = newsData[selectedCategory] || [];
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filteredNews = filteredNews.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleArticleClick = (article) => {
    // In a real app, this would navigate to a detailed article page
    console.log('Article clicked:', article.title);
    // For now, we'll just show an alert
    alert(`Reading: ${article.title}\n\n${article.content}`);
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const filteredNews = getFilteredNews();

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="news-header-content">
          <div className="news-title">
            <h1>📰 Daily News</h1>
            <p>Stay informed with the latest updates from around the world</p>
          </div>
          <div className="news-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button 
              className="back-to-dashboard"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="news-container">
        <div className="news-sidebar">
          <div className="category-filter">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="user-info-card">
            <h3>Welcome back, {user?.name}!</h3>
            <p>Your plan: <strong>{user?.subscription?.plan || 'Free'}</strong></p>
            <p>Articles today: <strong>{filteredNews.length}</strong></p>
          </div>
        </div>

        <div className="news-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading today's news...</p>
            </div>
          ) : (
            <>
              <div className="news-header-mobile">
                <h2>{selectedCategory === "All" ? "All News" : selectedCategory}</h2>
                <p>{filteredNews.length} articles found</p>
              </div>

              {filteredNews.length === 0 ? (
                <div className="no-news">
                  <div className="no-news-icon">📭</div>
                  <h3>No articles found</h3>
                  <p>Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="news-grid">
                  {filteredNews.map(article => (
                    <div 
                      key={article.id} 
                      className="news-card"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="news-card-image">
                        <img src={article.image} alt={article.title} />
                        <div className="news-card-category">{article.category}</div>
                      </div>
                      <div className="news-card-content">
                        <h3 className="news-card-title">{article.title}</h3>
                        <p className="news-card-summary">{article.summary}</p>
                        <div className="news-card-meta">
                          <span className="news-card-author">By {article.author}</span>
                          <span className="news-card-time">{formatDate(article.publishedAt)}</span>
                          <span className="news-card-read-time">{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsPage; 