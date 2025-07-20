import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlanCard from "../components/PlanCard";
import "./HomePage.css";

const plans = [
  {
    name: "Free",
    price: 0,
    benefits: [
      "Weekly newsletter",
      "Basic news updates",
      "Limited articles per month",
      "Standard email delivery"
    ],
    features: ["5 articles per week", "Basic news categories", "Email notifications"]
  },
  {
    name: "Premium",
    price: 499,
    benefits: [
      "All Free benefits",
      "Unlimited articles",
      "Exclusive content",
      "Priority email delivery",
      "Monthly Q&A sessions",
      "Ad-free experience"
    ],
    features: ["Unlimited articles", "All news categories", "Exclusive interviews", "Early access to content", "Premium support"]
  },
];

const newsCategories = [
  {
    title: "Worldwide News",
    description: "Stay updated with global events, politics, and international affairs from around the world.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
    color: "#dc2626"
  },
  {
    title: "India News",
    description: "Latest updates on Indian politics, economy, technology, and social developments.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    color: "#dc2626"
  },
  {
    title: "Sports",
    description: "Comprehensive coverage of cricket, football, tennis, and other major sports events.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    color: "#dc2626"
  },
  {
    title: "Technology",
    description: "Latest tech trends, startup news, and innovations in the digital world.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    color: "#dc2626"
  }
];

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">🦅</div>
            <h1 className="logo">ElevateLetter</h1>
          </div>
          <div className="header-buttons">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">Welcome, {user?.name}!</span>
                <button className="btn-dashboard" onClick={handleDashboard}>Dashboard</button>
                <button className="btn-news" onClick={() => navigate("/news")}>📰 News</button>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
                <button className="btn-signup" onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Elevate Your Knowledge</h1>
          <p>Get curated news, insights, and exclusive content delivered directly to your inbox. Join thousands of readers who trust ElevateLetter for their daily dose of knowledge.</p>
          {isAuthenticated ? (
            <button className="cta-button" onClick={handleDashboard}>
              Go to Dashboard
            </button>
          ) : (
            <button className="cta-button" onClick={() => navigate("/signup")}>
              Start Your Journey
            </button>
          )}
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop" alt="ElevateLetter" />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <h2>Why Choose ElevateLetter?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">📰</div>
            <h3>Curated Content</h3>
            <p>Hand-picked articles from reliable sources, saving you time and ensuring quality.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Daily Updates</h3>
            <p>Fresh content delivered to your inbox every day, keeping you always informed.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Personalized</h3>
            <p>Content tailored to your interests and reading preferences.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Read comfortably on any device, anywhere, anytime.</p>
          </div>
        </div>
      </section>
      
      {/* News Categories */}
      <section className="news-categories">
        <h2>What You'll Get</h2>
        <div className="categories-grid">
          {newsCategories.map((category, index) => (
            <div key={index} className="category-card" style={{ borderTopColor: category.color }}>
              <div className="category-image">
                <img src={category.image} alt={category.title} />
              </div>
              <div className="category-content">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section">
        <h2>Choose Your Plan</h2>
        <p className="plans-subtitle">Start with our free plan and upgrade anytime</p>
        <div className="plans-container">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
        <div className="plan-comparison">
          <h3>Plan Comparison</h3>
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="feature">Features</div>
              <div className="free">Free</div>
              <div className="premium">Premium</div>
            </div>
            <div className="comparison-row">
              <div className="feature">Articles per week</div>
              <div className="free">5</div>
              <div className="premium">Unlimited</div>
            </div>
            <div className="comparison-row">
              <div className="feature">News categories</div>
              <div className="free">Basic</div>
              <div className="premium">All</div>
            </div>
            <div className="comparison-row">
              <div className="feature">Exclusive content</div>
              <div className="free">❌</div>
              <div className="premium">✅</div>
            </div>
            <div className="comparison-row">
              <div className="feature">Ad-free experience</div>
              <div className="free">❌</div>
              <div className="premium">✅</div>
            </div>
            <div className="comparison-row">
              <div className="feature">Priority support</div>
              <div className="free">❌</div>
              <div className="premium">✅</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">🦅</div>
              <h4>ElevateLetter</h4>
            </div>
            <p>Your trusted source for curated news and insights.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#plans">Plans</a></li>
              {isAuthenticated ? (
                <>
                  <li><a href="/dashboard">Dashboard</a></li>
                  <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </>
              ) : (
                <>
                  <li><a href="/signup">Sign Up</a></li>
                  <li><a href="/login">Login</a></li>
                </>
              )}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@elevateletter.com</p>
            <p>Phone: +91 1234567890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ElevateLetter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage; 