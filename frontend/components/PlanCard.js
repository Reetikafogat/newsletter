import React from "react";
import { useNavigate } from "react-router-dom";

function PlanCard({ plan }) {
  const navigate = useNavigate();
  
  const isPremium = plan.name === "Premium";
  
  return (
    <div className={`plan-card ${isPremium ? 'premium' : 'free'}`}>
      <div className="plan-header">
        <h3>{plan.name} Plan</h3>
        <div className="plan-price">
          {plan.price === 0 ? "Free" : `₹${plan.price}/month`}
        </div>
      </div>
      
      <div className="plan-benefits">
        <h4>What's included:</h4>
        <ul>
          {plan.benefits.map((benefit, index) => (
            <li key={index}>
              <span className="checkmark">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="plan-features">
        <h4>Key Features:</h4>
        <ul>
          {plan.features.map((feature, index) => (
            <li key={index}>
              <span className="feature-dot">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        className={`plan-button ${isPremium ? 'premium-btn' : 'free-btn'}`}
        onClick={() => navigate("/signup")}
      >
        {isPremium ? "Get Premium" : "Start Free"}
      </button>
    </div>
  );
}

export default PlanCard; 