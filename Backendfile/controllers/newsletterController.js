const Newsletter = require('../models/Newsletter');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// @desc    Get all newsletters
// @route   GET /api/newsletter
// @access  Public
exports.getNewsletters = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    const premium = req.query.premium === 'true';
    const search = req.query.search;

    const skip = (page - 1) * limit;
    const filter = { status: 'published' };

    if (category) filter.category = category;
    if (featured) filter.featured = true;
    if (premium) filter.premium = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const newsletters = await Newsletter.find(filter)
      .populate('author', 'name')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletter by ID
// @route   GET /api/newsletter/:id
// @access  Public
exports.getNewsletterById = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('author', 'name email');

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    // Check if user can access premium content
    if (newsletter.premium && (!req.user || req.user.subscription.plan !== 'Premium')) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this content'
      });
    }

    // Increment view count
    await newsletter.incrementViews();

    res.status(200).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create newsletter
// @route   POST /api/newsletter
// @access  Private/Admin
exports.createNewsletter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const newsletterData = {
      ...req.body,
      author: req.user.id
    };

    const newsletter = await Newsletter.create(newsletterData);

    res.status(201).json({
      success: true,
      message: 'Newsletter created successfully',
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update newsletter
// @route   PUT /api/newsletter/:id
// @access  Private/Admin
exports.updateNewsletter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    // Check if user is the author or admin
    if (newsletter.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this newsletter'
      });
    }

    const updatedNewsletter = await Newsletter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Newsletter updated successfully',
      data: updatedNewsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete newsletter
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
exports.deleteNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    // Check if user is the author or admin
    if (newsletter.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this newsletter'
      });
    }

    await Newsletter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Newsletter deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish newsletter
// @route   POST /api/newsletter/:id/publish
// @access  Private/Admin
exports.publishNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    // Check if user is the author or admin
    if (newsletter.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this newsletter'
      });
    }

    newsletter.status = 'published';
    newsletter.publishDate = new Date();
    await newsletter.save();

    res.status(200).json({
      success: true,
      message: 'Newsletter published successfully',
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send newsletter to subscribers
// @route   POST /api/newsletter/:id/send
// @access  Private/Admin
exports.sendNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    if (newsletter.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Newsletter must be published before sending'
      });
    }

    // Get subscribers based on newsletter category and premium status
    let subscribers;
    if (newsletter.premium) {
      subscribers = await User.find({
        'subscription.plan': 'Premium',
        'subscription.status': 'active',
        'preferences.emailNotifications': true
      });
    } else {
      subscribers = await User.find({
        'subscription.status': 'active',
        'preferences.emailNotifications': true,
        $or: [
          { 'preferences.categories': newsletter.category },
          { 'preferences.categories': { $exists: false } }
        ]
      });
    }

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const batch of batches) {
      try {
        await emailService.sendBulkNewsletter(batch, newsletter);
        sentCount += batch.length;
      } catch (error) {
        console.error('Batch email failed:', error);
        failedCount += batch.length;
      }
    }

    // Update newsletter delivery stats
    newsletter.delivery.sent = sentCount;
    newsletter.delivery.failed = failedCount;
    await newsletter.save();

    res.status(200).json({
      success: true,
      message: `Newsletter sent to ${sentCount} subscribers`,
      data: {
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletters by category
// @route   GET /api/newsletter/category/:category
// @access  Public
exports.getNewslettersByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsletters = await Newsletter.findByCategory(category)
      .populate('author', 'name')
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments({
      category,
      status: 'published',
      publishDate: { $lte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured newsletters
// @route   GET /api/newsletter/featured
// @access  Public
exports.getFeaturedNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.findFeatured()
      .populate('author', 'name')
      .limit(5);

    res.status(200).json({
      success: true,
      data: newsletters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get premium newsletters
// @route   GET /api/newsletter/premium
// @access  Private
exports.getPremiumNewsletters = async (req, res, next) => {
  try {
    if (!req.user || req.user.subscription.plan !== 'Premium') {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required'
      });
    }

    const newsletters = await Newsletter.findPremium()
      .populate('author', 'name')
      .limit(10);

    res.status(200).json({
      success: true,
      data: newsletters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment newsletter views
// @route   POST /api/newsletter/:id/view
// @access  Public
exports.incrementViews = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    await newsletter.incrementViews();

    res.status(200).json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletter statistics
// @route   GET /api/newsletter/stats/:id
// @access  Private/Admin
exports.getNewsletterStats = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found'
      });
    }

    // Check if user is the author or admin
    if (newsletter.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this newsletter stats'
      });
    }

    const stats = {
      views: newsletter.analytics.views,
      shares: newsletter.analytics.shares,
      likes: newsletter.analytics.likes,
      deliveryRate: newsletter.deliveryRate,
      openRate: newsletter.openRate,
      sent: newsletter.delivery.sent,
      delivered: newsletter.delivery.delivered,
      opened: newsletter.delivery.opened,
      clicked: newsletter.delivery.clicked,
      failed: newsletter.delivery.failed
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}; 