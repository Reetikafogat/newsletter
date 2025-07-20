const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  plan: {
    type: String,
    enum: ['Free', 'Premium'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  gateway: {
    paymentId: String, // Payment gateway's payment ID
    orderId: String,   // Payment gateway's order ID
    transactionId: String, // Our internal transaction ID
    signature: String  // For verification (Razorpay)
  },
  subscription: {
    subscriptionId: String, // Payment gateway subscription ID
    planId: String,        // Plan ID from payment gateway
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  billing: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  metadata: {
    description: String,
    notes: String,
    tags: [String]
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    gatewayRefundId: String
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'gateway.paymentId': 1 });
paymentSchema.index({ 'gateway.orderId': 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ 'subscription.subscriptionId': 1 });

// Virtual for payment amount in human format
paymentSchema.virtual('amountFormatted').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount / 100); // Assuming amount is in paise/cents
});

// Virtual for payment status color
paymentSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    refunded: 'orange'
  };
  return colors[this.status] || 'gray';
});

// Static method to find successful payments
paymentSchema.statics.findSuccessful = function() {
  return this.find({ status: 'completed' });
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find payments by status
paymentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find payments by date range
paymentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
    return acc;
  }, {});
};

// Instance method to mark as completed
paymentSchema.methods.markCompleted = function(gatewayData = {}) {
  this.status = 'completed';
  this.gateway = { ...this.gateway, ...gatewayData };
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(amount, reason, gatewayRefundId) {
  this.status = 'refunded';
  this.refund = {
    amount: amount || this.amount,
    reason,
    processedAt: new Date(),
    gatewayRefundId
  };
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema); 