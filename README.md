# newsletter
# 📧 ElevateLetter - Modern Newsletter Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-green.svg)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-black.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack newsletter subscription platform built with modern web technologies. ElevateLetter provides user authentication, subscription management, payment processing, and curated content delivery with a beautiful, responsive interface.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration/Login** with JWT token authentication
- **User Dashboard** with account information and preferences
- **Password Security** with bcrypt hashing
- **Session Management** with persistent login state

### 💳 Subscription & Payment
- **Multiple Subscription Plans** (Free & Premium)
- **Payment Integration** with Stripe and Razorpay
- **Subscription Management** with status tracking
- **Payment History** and billing information

### 📰 Content Management
- **Newsletter Creation** and management
- **Content Curation** with category-based filtering
- **News Feed** with real-time updates
- **Email Notifications** with Nodemailer integration

### 🎨 User Experience
- **Responsive Design** that works on all devices
- **Modern UI/UX** with clean, intuitive interface
- **Real-time Updates** with React state management
- **Loading States** and error handling

### 🔒 Security & Performance
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** with express-validator
- **Helmet.js** for security headers
- **MongoDB** with Mongoose ODM

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Stripe/Razorpay** - Payment processing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features
- **Context API** - State management
- **Fetch API** - HTTP requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elevateletter.git
   cd elevateletter
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   ```

3. **Configure Environment Variables**
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/elevateletter
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=your_stripe_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Start Backend Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
elevateletter/
├── backend/
│   ├── controllers/          # API controllers
│   │   ├── authController.js
│   │   ├── newsletterController.js
│   │   ├── paymentController.js
│   │   └── subscriptionController.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Newsletter.js
│   │   └── Payment.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── newsletterRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── subscriptionRoutes.js
│   ├── services/            # Business logic
│   │   ├── emailService.js
│   │   └── paymentService.js
│   ├── utils/               # Utility functions
│   ├── app.js              # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── PlanCard.js
│   │   │   └── SignupForm.js
│   │   ├── context/         # React contexts
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── NewsPage.js
│   │   │   └── SuccessPage.js
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── styles/          # Global styles
│   │   │   └── main.css
│   │   └── App.js           # Main app component
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Newsletters
- `GET /api/newsletters` - Get all newsletters
- `POST /api/newsletters` - Create newsletter
- `GET /api/newsletters/:id` - Get specific newsletter
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## 🎯 Usage Guide

### For Users
1. **Browse Plans** - Visit the homepage to see available subscription plans
2. **Create Account** - Sign up with your email and choose a plan
3. **Complete Payment** - Securely pay for premium features
4. **Access Dashboard** - Manage your subscription and preferences
5. **Read Newsletters** - Access curated content based on your interests

### For Developers
1. **Clone Repository** - Get the latest code
2. **Set Environment** - Configure your development environment
3. **Run Tests** - Ensure everything works correctly
4. **Make Changes** - Add features or fix bugs
5. **Submit PR** - Contribute to the project

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku/ Railway/ DigitalOcean)
1. Set production environment variables
2. Configure MongoDB Atlas
3. Set up proper JWT secrets
4. Use PM2 for process management

### Frontend Deployment (Netlify/ Vercel)
1. Build the application: `npm run build`
2. Deploy the `build` folder
3. Update API base URL for production
4. Configure environment variables

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify environment variables are set
- Ensure port 5000 is available

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure API_BASE_URL is correct

**Authentication issues:**
- Clear browser localStorage
- Check JWT token expiration
- Verify user credentials

**Payment processing errors:**
- Check Stripe/Razorpay credentials
- Verify webhook endpoints
- Ensure proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing frontend library
- [Express.js](https://expressjs.com/) for the robust backend framework
- [MongoDB](https://mongodb.com/) for the flexible database
- [Stripe](https://stripe.com/) and [Razorpay](https://razorpay.com/) for payment processing

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@elevateletter.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/elevateletter/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/elevateletter/wiki)

---

⭐ **Star this repository if you found it helpful!**
