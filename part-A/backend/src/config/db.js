import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
};

