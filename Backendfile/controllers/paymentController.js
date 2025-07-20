const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, plan, description } = req.body;

    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      user: req.user.id,
      plan,
      description
    });

    res.status(200).json({
      success: true,
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify-razorpay
// @access  Public
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    const isValid = await paymentService.verifyRazorpayPayment(paymentId, orderId, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment by order ID
    const payment = await Payment.findOne({ 'gateway.orderId': orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Process successful payment
    const result = await paymentService.processSuccessfulPayment(payment._id, {
      paymentId,
      orderId,
      signature
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook/razorpay
// @access  Public
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'subscription.activated':
        await handleSubscriptionActivated(payload);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// @desc    Stripe webhook
// @route   POST /api/payments/webhook/stripe
// @access  Public
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleStripeInvoiceSucceeded(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await paymentService.getUserPaymentHistory(req.user.id);

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentDetails(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private
exports.refundPayment = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this payment'
      });
    }

    const refund = await paymentService.refundPayment(req.params.id, amount, reason);

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: refund
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for webhook handling
async function handlePaymentCaptured(payload) {
  const { payment } = payload;
  
  const dbPayment = await Payment.findOne({ 'gateway.paymentId': payment.id });
  if (dbPayment) {
    await paymentService.processSuccessfulPayment(dbPayment._id, {
      paymentId: payment.id,
      orderId: payment.order_id,
      signature: payment.signature
    });
  }
}

async function handlePaymentFailed(payload) {
  const { payment } = payload;
  
  const dbPayment = await Payment.findOne({ 'gateway.paymentId': payment.id });
  if (dbPayment) {
    await paymentService.processFailedPayment(dbPayment._id, {
      code: 'payment_failed',
      message: 'Payment failed',
      details: payment
    });
  }
}

async function handleSubscriptionActivated(payload) {
  const { subscription } = payload;
  
  const user = await User.findOne({ 'payment.subscriptionId': subscription.id });
  if (user) {
    user.subscription.status = 'active';
    user.subscription.startDate = new Date(subscription.start_at * 1000);
    user.subscription.endDate = new Date(subscription.end_at * 1000);
    await user.save();
  }
}

async function handleSubscriptionCancelled(payload) {
  const { subscription } = payload;
  
  const user = await User.findOne({ 'payment.subscriptionId': subscription.id });
  if (user) {
    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;
    await user.save();
  }
}

async function handleStripePaymentSucceeded(paymentIntent) {
  const dbPayment = await Payment.findOne({ 'gateway.paymentId': paymentIntent.id });
  if (dbPayment) {
    await paymentService.processSuccessfulPayment(dbPayment._id, {
      paymentId: paymentIntent.id,
      customerId: paymentIntent.customer
    });
  }
}

async function handleStripePaymentFailed(paymentIntent) {
  const dbPayment = await Payment.findOne({ 'gateway.paymentId': paymentIntent.id });
  if (dbPayment) {
    await paymentService.processFailedPayment(dbPayment._id, {
      code: 'payment_failed',
      message: 'Payment failed',
      details: paymentIntent
    });
  }
}

async function handleStripeInvoiceSucceeded(invoice) {
  // Handle subscription renewal
  const user = await User.findOne({ 'payment.customerId': invoice.customer });
  if (user) {
    user.payment.lastPaymentDate = new Date();
    user.payment.nextBillingDate = new Date(invoice.next_payment_attempt * 1000);
    await user.save();
  }
} 