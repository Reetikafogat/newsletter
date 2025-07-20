const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Premium'],
      default: 'Free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'pending'],
      default: 'inactive'
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  payment: {
    customerId: String, // Stripe/Razorpay customer ID
    subscriptionId: String, // Payment gateway subscription ID
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'none'],
      default: 'none'
    },
    lastPaymentDate: Date,
    nextBillingDate: Date
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['Worldwide News', 'India News', 'Sports', 'Technology']
    }],
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'subscription.plan': 1 });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
  if (this.subscription.plan === 'Free') return true;
  
  return this.subscription.status === 'active' && 
         this.subscription.endDate && 
         this.subscription.endDate > new Date();
};

// Instance method to get subscription days remaining
userSchema.methods.getSubscriptionDaysRemaining = function() {
  if (this.subscription.plan === 'Free') return Infinity;
  
  if (!this.subscription.endDate) return 0;
  
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Static method to find active subscribers
userSchema.statics.findActiveSubscribers = function() {
  return this.find({
    'subscription.status': 'active',
    'subscription.endDate': { $gt: new Date() }
  });
};

// Static method to find subscribers by plan
userSchema.statics.findByPlan = function(plan) {
  return this.find({ 'subscription.plan': plan });
};

module.exports = mongoose.model('User', userSchema); 