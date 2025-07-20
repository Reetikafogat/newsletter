import React from "react";
import SignupForm from "../components/SignupForm";
import "./SignupPage.css";

function SignupPage() {
  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-logo">
            <div className="logo-icon">🦅</div>
            <h1>Join ElevateLetter</h1>
          </div>
          <p>Choose your plan and start receiving curated content</p>
        </div>
        
        <div className="signup-content">
          <div className="signup-form-section">
            <SignupForm />
          </div>
          
          <div className="plan-info-section">
            <h3>Plan Details</h3>
            <div className="plan-info-cards">
              <div className="plan-info-card free">
                <h4>Free Plan</h4>
                <div className="plan-price">₹0/month</div>
                <ul>
                  <li>✓ 5 articles per week</li>
                  <li>✓ Basic news categories</li>
                  <li>✓ Email notifications</li>
                  <li>✓ Standard delivery</li>
                </ul>
              </div>
              
              <div className="plan-info-card premium">
                <h4>Premium Plan</h4>
                <div className="plan-price">₹499/month</div>
                <ul>
                  <li>✓ Unlimited articles</li>
                  <li>✓ All news categories</li>
                  <li>✓ Exclusive content</li>
                  <li>✓ Priority delivery</li>
                  <li>✓ Ad-free experience</li>
                  <li>✓ Premium support</li>
                </ul>
              </div>
            </div>
            
            <div className="features-highlight">
              <h4>What's Included:</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">📰</span>
                  <span>Worldwide News</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🇮🇳</span>
                  <span>India News</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚽</span>
                  <span>Sports</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💻</span>
                  <span>Technology</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage; 