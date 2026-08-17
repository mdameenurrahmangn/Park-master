// NO dotenv, NO fancy config - just pure connection test
const mongoose = require('mongoose');

// PASTE THE EXACT STRING FROM ATLAS HERE (no modifications)
const URI = "mongodb+srv://mohammedameenurrahman43_db_user:NFayUtZKtxcIgtl9@parkmaster-cluster.be0w0un.mongodb.net/?appName=ParkMaster-Cluster";

console.log('🔌 Connecting with minimal config...');

mongoose.connect(URI, {
  serverSelectionTimeoutMS: 30000
})
.then(async () => {
  console.log('✅ Connected!');
  console.log('DB:', mongoose.connection.name);
  await mongoose.disconnect();
  console.log('🎉 Test passed!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Failed:', err.message);
  console.error('Code:', err.code);
  process.exit(1);
});