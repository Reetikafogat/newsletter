const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Newsletter title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Newsletter content is required']
  },
  summary: {
    type: String,
    required: [true, 'Newsletter summary is required'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Worldwide News', 'India News', 'Sports', 'Technology', 'General'],
    required: [true, 'Category is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  premium: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  imageUrl: {
    type: String,
    default: null
  },
  delivery: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
newsletterSchema.index({ status: 1, publishDate: -1 });
newsletterSchema.index({ category: 1, status: 1 });
newsletterSchema.index({ author: 1, status: 1 });
newsletterSchema.index({ featured: 1, status: 1 });
newsletterSchema.index({ premium: 1, status: 1 });

// Virtual for reading time in human format
newsletterSchema.virtual('readTimeFormatted').get(function() {
  if (this.readTime < 1) return 'Less than 1 min';
  if (this.readTime === 1) return '1 min read';
  return `${this.readTime} min read`;
});

// Virtual for delivery rate
newsletterSchema.virtual('deliveryRate').get(function() {
  if (this.delivery.sent === 0) return 0;
  return Math.round((this.delivery.delivered / this.delivery.sent) * 100);
});

// Virtual for open rate
newsletterSchema.virtual('openRate').get(function() {
  if (this.delivery.delivered === 0) return 0;
  return Math.round((this.delivery.opened / this.delivery.delivered) * 100);
});

// Static method to find published newsletters
newsletterSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    publishDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

// Static method to find newsletters by category
newsletterSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    status: 'published',
    publishDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

// Static method to find featured newsletters
newsletterSchema.statics.findFeatured = function() {
  return this.find({ 
    featured: true,
    status: 'published',
    publishDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

// Static method to find premium newsletters
newsletterSchema.statics.findPremium = function() {
  return this.find({ 
    premium: true,
    status: 'published',
    publishDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

// Instance method to increment view count
newsletterSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Instance method to increment delivery stats
newsletterSchema.methods.incrementDelivery = function(type) {
  if (this.delivery[type] !== undefined) {
    this.delivery[type] += 1;
  }
  return this.save();
};

module.exports = mongoose.model('Newsletter', newsletterSchema); 