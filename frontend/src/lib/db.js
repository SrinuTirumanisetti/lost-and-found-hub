import mongoose from 'mongoose';

// MongoDB connection URI, reads from .env or uses a default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostfound';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Caching the connection to reuse it across multiple requests
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If a connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Recommended option
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection promise to resolve and store the connection
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the promise and re-throw the error
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 