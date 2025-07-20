import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";

function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-logo">
            <div className="logo-icon">🦅</div>
            <h1>Welcome, {user.name}!</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="dashboard-content">
          <div className="user-info-section">
            <h2>Your Account Information</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Personal Details</h3>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email Verified:</span>
                  <span className="value">
                    {user.isEmailVerified ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <h3>Subscription Details</h3>
                <div className="info-item">
                  <span className="label">Plan:</span>
                  <span className="value">{user.subscription?.plan || "Free"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">{user.subscription?.status || "inactive"}</span>
                </div>
                {user.subscription?.startDate && (
                  <div className="info-item">
                    <span className="label">Start Date:</span>
                    <span className="value">
                      {new Date(user.subscription.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {user.subscription?.endDate && (
                  <div className="info-item">
                    <span className="label">End Date:</span>
                    <span className="value">
                      {new Date(user.subscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="info-card">
                <h3>Preferences</h3>
                <div className="info-item">
                  <span className="label">Categories:</span>
                  <span className="value">
                    {user.preferences?.categories?.length > 0 
                      ? user.preferences.categories.join(", ")
                      : "None selected"
                    }
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Frequency:</span>
                  <span className="value">{user.preferences?.frequency || "weekly"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email Notifications:</span>
                  <span className="value">
                    {user.preferences?.emailNotifications ? "✅ Enabled" : "❌ Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-button primary" onClick={() => navigate("/news")}>
                📰 Read News
              </button>
              <button className="action-button secondary">
                Update Profile
              </button>
              <button className="action-button secondary">
                Change Password
              </button>
              <button className="action-button secondary">
                Manage Subscription
              </button>
              <button className="action-button secondary">
                View Newsletter History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage; 