# ElevateLetter Backend

A comprehensive Node.js backend for the ElevateLetter newsletter subscription service with payment integration, email services, and user management.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Account locking for security

- **Subscription Management**
  - Free and Premium plans
  - Subscription lifecycle management
  - User preferences and categories

- **Payment Integration**
  - Razorpay integration (primary)
  - Stripe integration (alternative)
  - Payment verification and webhooks
  - Refund processing

- **Email Services**
  - Welcome emails
  - Newsletter delivery
  - Email verification
  - Password reset emails
  - Beautiful HTML templates

- **Newsletter Management**
  - CRUD operations for newsletters
  - Category-based organization
  - Premium content management
  - Analytics and tracking

- **Security Features**
  - Rate limiting
  - Input validation
  - CORS protection
  - Helmet security headers

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - Database connection string
   - JWT secret key
   - Email credentials
   - Payment gateway keys

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | No (default: 587) |
| `EMAIL_USER` | SMTP username | Yes |
| `EMAIL_PASS` | SMTP password | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Optional |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional |

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "plan": "Free"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Subscription Endpoints

#### Subscribe to Newsletter
```http
POST /api/subscriptions/subscribe
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "Premium"
}
```

#### Get Subscription Details
```http
GET /api/subscriptions/me
Authorization: Bearer <token>
```

#### Update Preferences
```http
PUT /api/subscriptions/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "categories": ["Worldwide News", "Technology"],
  "frequency": "weekly",
  "emailNotifications": true
}
```

### Payment Endpoints

#### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 49900,
  "currency": "INR",
  "plan": "Premium"
}
```

#### Verify Razorpay Payment
```http
POST /api/payments/verify-razorpay
Content-Type: application/json

{
  "paymentId": "pay_xxx",
  "orderId": "order_xxx",
  "signature": "signature_xxx"
}
```

### Newsletter Endpoints

#### Get All Newsletters
```http
GET /api/newsletter?page=1&limit=10&category=Technology
```

#### Get Newsletter by ID
```http
GET /api/newsletter/:id
```

#### Create Newsletter (Admin)
```http
POST /api/newsletter
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Latest Tech Trends",
  "content": "Full newsletter content...",
  "summary": "Brief summary of the newsletter",
  "category": "Technology",
  "readTime": 5,
  "featured": true,
  "premium": false,
  "tags": ["tech", "trends"]
}
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  subscription: {
    plan: String (Free/Premium),
    status: String (active/inactive/cancelled/pending),
    startDate: Date,
    endDate: Date,
    autoRenew: Boolean
  },
  payment: {
    customerId: String,
    subscriptionId: String,
    paymentMethod: String,
    lastPaymentDate: Date,
    nextBillingDate: Date
  },
  preferences: {
    categories: [String],
    frequency: String,
    emailNotifications: Boolean
  },
  isEmailVerified: Boolean,
  lastLogin: Date
}
```

### Newsletter Model
```javascript
{
  title: String,
  content: String,
  summary: String,
  category: String,
  author: ObjectId (ref: User),
  status: String (draft/scheduled/published/archived),
  publishDate: Date,
  featured: Boolean,
  premium: Boolean,
  readTime: Number,
  delivery: {
    sent: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    failed: Number
  },
  analytics: {
    views: Number,
    shares: Number,
    likes: Number
  }
}
```

### Payment Model
```javascript
{
  user: ObjectId (ref: User),
  amount: Number,
  currency: String,
  plan: String,
  paymentMethod: String,
  status: String,
  gateway: {
    paymentId: String,
    orderId: String,
    transactionId: String,
    signature: String
  },
  subscription: {
    subscriptionId: String,
    planId: String,
    interval: String,
    startDate: Date,
    endDate: Date,
    autoRenew: Boolean
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers for HTTP responses
- **Account Locking**: Automatic account lockout after failed attempts

## 📧 Email Templates

The backend includes beautiful HTML email templates for:
- Welcome emails
- Email verification
- Password reset
- Newsletter delivery
- Subscription cancellation

## 💳 Payment Integration

### Razorpay (Primary)
- Order creation
- Payment verification
- Webhook handling
- Subscription management

### Stripe (Alternative)
- Payment intents
- Customer management
- Subscription handling
- Webhook processing

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
- Use strong JWT secrets
- Configure production MongoDB
- Set up production email service
- Configure payment gateway production keys
- Enable HTTPS
- Set up proper CORS origins

## 📊 Monitoring & Analytics

- Request logging with Morgan
- Error tracking and handling
- Newsletter delivery analytics
- Payment success/failure tracking
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: info@elevateletter.com
- Documentation: [API Docs](link-to-docs)
- Issues: [GitHub Issues](link-to-issues) 