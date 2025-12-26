import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('❌ MONGODB_URI is not defined in .env.local');
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
