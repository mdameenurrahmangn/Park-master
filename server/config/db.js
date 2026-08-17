const mongoose = require('mongoose');
const dns = require('dns');

// Set public DNS servers to resolve MongoDB Atlas SRV records properly on Windows only
if (process.platform === 'win32') {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
        console.warn('[ParkMaster] Failed to set DNS servers:', e.message);
    }
}

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('[ParkMaster] Database Connection Error: MONGO_URI is missing in environment variables');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[ParkMaster] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[ParkMaster] Database Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;