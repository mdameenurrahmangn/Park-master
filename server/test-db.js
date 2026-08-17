const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection to:', process.env.MONGO_URI.replace(/:[^:]*@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED:', err.message);
    console.error('Error Code:', err.code);
    process.exit(1);
  });