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

        // Drop legacy unique indexes on aadharNumber and phone if present in DB collection
        try {
            const memberCollection = conn.connection.collection('members');
            const indexes = await memberCollection.indexes();
            if (indexes.some(idx => idx.name === 'aadharNumber_1')) {
                await memberCollection.dropIndex('aadharNumber_1');
                console.log('[ParkMaster] Successfully dropped legacy aadharNumber_1 unique index');
            }
            if (indexes.some(idx => idx.name === 'phone_1')) {
                await memberCollection.dropIndex('phone_1');
                console.log('[ParkMaster] Successfully dropped legacy phone_1 unique index');
            }
        } catch (idxError) {
            console.warn('[ParkMaster] Index check/cleanup notice:', idxError.message);
        }
    } catch (error) {
        console.error(`[ParkMaster] Database Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;