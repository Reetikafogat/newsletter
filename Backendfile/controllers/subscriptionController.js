const User = require('../models/User');
const Payment = require('../models/Payment');
const { validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// @desc    Subscribe user to newsletter
// @route   POST /api/subscriptions/subscribe
// @access  Public
exports.subscribe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { name, email, plan = 'Free' } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update subscription
      user.name = name;
      user.subscription.plan = plan;
      
      if (plan === 'Free') {
        user.subscription.status = 'active';
        user.subscription.startDate = new Date();
        user.subscription.endDate = null;
        user.subscription.autoRenew = false;
      } else {
        user.subscription.status = 'pending';
        user.subscription.startDate = null;
        user.subscription.endDate = null;
        user.subscription.autoRenew = false;
      }
      
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(32).toString('hex'), // Temporary password
        subscription: {
          plan,
          status: plan === 'Free' ? 'active' : 'pending',
          startDate: plan === 'Free' ? new Date() : null,
          endDate: null,
          autoRenew: false
        }
      });
    }

    // If Premium plan, create payment intent
    if (plan === 'Premium') {
      try {
        const paymentIntent = await paymentService.createPaymentIntent({
          amount: 49900, // ₹499 in paise
          currency: 'INR',
          user: user._id,
          plan: 'Premium',
          description: 'ElevateLetter Premium Subscription'
        });

        return res.status(200).json({
          success: true,
          message: 'Subscription created successfully',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            subscription: user.subscription
          },
          paymentUrl: paymentIntent.paymentUrl,
          paymentId: paymentIntent.paymentId
        });
      } catch (paymentError) {
        console.error('Payment creation failed:', paymentError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment. Please try again.'
        });
      }
    }

    // For Free plan, send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name, plan);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Subscription created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user subscription details
// @route   GET /api/subscriptions/me
// @access  Private
exports.getMySubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get payment history
    const payments = await Payment.findByUser(user._id).limit(5);

    res.status(200).json({
      success: true,
      subscription: user.subscription,
      preferences: user.preferences,
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amountFormatted,
        status: payment.status,
        createdAt: payment.createdAt,
        plan: payment.plan
      })),
      daysRemaining: user.getSubscriptionDaysRemaining(),
      isActive: user.isSubscriptionActive()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription preferences
// @route   PUT /api/subscriptions/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { categories, frequency, emailNotifications } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (categories) user.preferences.categories = categories;
    if (frequency) user.preferences.frequency = frequency;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade to Premium
// @route   POST /api/subscriptions/upgrade
// @access  Private
exports.upgradeToPremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.subscription.plan === 'Premium' && user.subscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'User already has an active Premium subscription'
      });
    }

    // Create payment intent
    try {
      const paymentIntent = await paymentService.createPaymentIntent({
        amount: 49900, // ₹499 in paise
        currency: 'INR',
        user: user._id,
        plan: 'Premium',
        description: 'ElevateLetter Premium Upgrade'
      });

      // Update user subscription status
      user.subscription.status = 'pending';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Payment intent created successfully',
        paymentUrl: paymentIntent.paymentUrl,
        paymentId: paymentIntent.paymentId
      });
    } catch (paymentError) {
      console.error('Payment creation failed:', paymentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.subscription.plan === 'Free') {
      return res.status(400).json({
        success: false,
        message: 'Free subscriptions cannot be cancelled'
      });
    }

    // Cancel subscription with payment gateway
    if (user.payment.subscriptionId) {
      try {
        await paymentService.cancelSubscription(user.payment.subscriptionId);
      } catch (cancelError) {
        console.error('Payment gateway cancellation failed:', cancelError);
        // Continue with local cancellation even if gateway fails
      }
    }

    // Update local subscription
    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;
    await user.save();

    // Send cancellation email
    try {
      await emailService.sendCancellationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Cancellation email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: user.subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate subscription
// @route   POST /api/subscriptions/reactivate
// @access  Private
exports.reactivateSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.subscription.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not cancelled'
      });
    }

    // Create new payment intent for reactivation
    try {
      const paymentIntent = await paymentService.createPaymentIntent({
        amount: 49900, // ₹499 in paise
        currency: 'INR',
        user: user._id,
        plan: 'Premium',
        description: 'ElevateLetter Premium Reactivation'
      });

      user.subscription.status = 'pending';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Payment intent created for reactivation',
        paymentUrl: paymentIntent.paymentUrl,
        paymentId: paymentIntent.paymentId
      });
    } catch (paymentError) {
      console.error('Payment creation failed:', paymentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription statistics (Admin)
// @route   GET /api/subscriptions/stats
// @access  Private/Admin
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ 'subscription.plan': 'Free' });
    const premiumUsers = await User.countDocuments({ 'subscription.plan': 'Premium' });
    const activeSubscriptions = await User.countDocuments({ 'subscription.status': 'active' });
    const pendingSubscriptions = await User.countDocuments({ 'subscription.status': 'pending' });
    const cancelledSubscriptions = await User.countDocuments({ 'subscription.status': 'cancelled' });

    // Get recent subscriptions
    const recentSubscriptions = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email subscription.createdAt subscription.plan');

    // Get payment statistics
    const paymentStats = await Payment.getPaymentStats();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        freeUsers,
        premiumUsers,
        activeSubscriptions,
        pendingSubscriptions,
        cancelledSubscriptions,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0
      },
      recentSubscriptions,
      paymentStats
    });
  } catch (error) {
    next(error);
  }
}; 