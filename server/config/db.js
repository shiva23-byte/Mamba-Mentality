const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4, // Force IPv4 to avoid IPv6 TLS issues
    });

    console.log(`\x1b[36m[MongoDB]\x1b[0m Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`\x1b[31m[MongoDB]\x1b[0m Connection error:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`\x1b[33m[MongoDB]\x1b[0m Disconnected. Attempting reconnect...`);
    });

    return conn;
  } catch (error) {
    console.error(`\x1b[31m[MongoDB]\x1b[0m Failed to connect:`, error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
