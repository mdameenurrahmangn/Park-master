const mongoose = require('mongoose');
const dns = require('dns');

// Set public DNS servers to resolve MongoDB Atlas SRV records properly on Windows
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('[ParkMaster] Failed to set DNS servers:', e.message);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 8+ doesn't need these, but good for explicit clarity
            // useNewUrlParser: true, 
            // useUnifiedTopology: true,
        });

        console.log(`[ParkMaster] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[ParkMaster] Database Connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;