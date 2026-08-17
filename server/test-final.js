const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('URI (sanitized):', URI.replace(/:[^:]*@/, ':****@'));
console.log('Mongoose version:', require('mongoose').version);

async function testConnection() {
  try {
    // Connect with modern Mongoose (returns Promise)
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds for DNS
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Try to list collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📦 Collections:', collections.map(c => c.name).join(', ') || '(none yet)');
    } catch (err) {
      console.log('ℹ Collections check:', err.message);
    }
    
    // Disconnect cleanly
    await mongoose.disconnect();
    console.log('🔌 Disconnected. Test complete! 🎉');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code || 'N/A');
    
    // Helpful debugging tips
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS Issue: Hostname not found');
      console.error('   → Check cluster hostname in Atlas');
      console.error('   → Try: nslookup parkmaster-cluster.be0w0un.mongodb.net');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Network Issue: Connection refused');
      console.error('   → Check Atlas Network Access (0.0.0.0/0)');
      console.error('   → Wait 2 minutes after adding IP');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Auth Issue: Wrong username/password');
      console.error('   → Verify credentials in Atlas Database Access');
      console.error('   → Check password case-sensitivity');
    }
    
    process.exit(1);
  }
}

testConnection();