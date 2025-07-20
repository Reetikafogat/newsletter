import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignupForm() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    plan: "Free" 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the auth context
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <label>
        Name:
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Email:
        <input 
          name="email" 
          type="email" 
          value={form.email} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Password:
        <input 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          required 
          minLength="6"
        />
      </label>
      <label>
        Plan:
        <select name="plan" value={form.plan} onChange={handleChange}>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
        </select>
      </label>
      {authError && <div className="error">{authError}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
}

export default SignupForm; 