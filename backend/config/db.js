import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Database connected successfully`.yellow.bold);
  } catch (error) {
    logger.info(`Database connection failed: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;
