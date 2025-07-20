const mongoose = require('mongoose');
require('dotenv').config();

async function testSetup() {
  console.log('🔧 Testing backend setup...\n');

  // Test environment variables
  console.log('📋 Environment Variables:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`- PORT: ${process.env.PORT || 'not set'}`);
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI || 'not set'}`);
  console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
  console.log(`- FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}\n`);

  // Test database connection
  console.log('🗄️  Testing database connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elevateletter', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection successful!\n');

    // Test User model
    const User = require('./models/User');
    console.log('👤 Testing User model...');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCollectionExists = collections.some(col => col.name === 'users');
    console.log(`- Users collection exists: ${userCollectionExists ? '✅' : '❌'}`);

    // Count existing users
    const userCount = await User.countDocuments();
    console.log(`- Existing users: ${userCount}`);

    console.log('\n🎉 Backend setup test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend: cd ../frontend && npm start');
    console.log('3. Test registration and login functionality');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your MONGODB_URI in .env file');
    console.log('3. If using MongoDB Atlas, check your connection string');
  } finally {
    await mongoose.disconnect();
  }
}

testSetup(); 