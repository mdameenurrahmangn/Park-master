const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGO_URI;

console.log('Testing SRV connection to Atlas...');
console.log('URI (sanitized):', URI.replace(/:[^:]*@/, ':****@'));

// Connect with SRV format - mongoose handles DNS resolution
mongoose.connect(URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds for DNS resolution
  socketTimeoutMS: 45000,
})
.on('connected', () => console.log('🔗 Mongoose connected event'))
.on('error', err => console.error('❌ Error:', err.message))
.on('timeout', () => console.error('⏱ Connection timeout'));

mongoose.connection.once('open', async () => {
  console.log('✅ SUCCESS: Connected to MongoDB Atlas via SRV!');
  console.log('Database:', mongoose.connection.name);
  
  // Try to list collections to verify access
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));
  } catch (err) {
    console.log('ℹ Could not list collections (normal for new DB):', err.message);
  }
  
  await mongoose.disconnect();
  console.log('🔌 Disconnected. Test complete.');
  process.exit(0);
});

// Fallback timeout
setTimeout(() => {
  console.error('⏱ No connection after 35 seconds - giving up');
  process.exit(1);
}, 35000);