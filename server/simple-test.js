const mongoose = require('mongoose');

// Hardcode your URI here for testing (remove after)
const URI = "mongodb://cluster0-shard-00-00.y2mrcxd.mongodb.net:27017,cluster0-shard-00-01.y2mrcxd.mongodb.net:27017,cluster0-shard-00-02.y2mrcxd.mongodb.net:27017/parkmaster?replicaSet=atlas-xxxxxx&ssl=true&authSource=admin&retryWrites=true&w=majority&username=parkmaster_admin&password=AmeenMca221385";

console.log('Connecting to Atlas...');

mongoose.connect(URI, {
  serverSelectionTimeoutMS: 10000 // 10 second timeout
})
.then(() => {
  console.log('✅ SUCCESS! Connected to MongoDB Atlas');
  return mongoose.disconnect();
})
.then(() => {
  console.log('Disconnected. Test complete.');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.error('Error code:', err.code);
  console.error('Error name:', err.name);
  process.exit(1);
});