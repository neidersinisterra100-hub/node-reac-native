import mongoose from 'mongoose';
import { TripModel } from '../models/trip.model.js';
import dotenv from 'dotenv';

dotenv.config();

const count = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const c = await TripModel.countDocuments({});
    console.log('Total trips:', c);
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
};
count();
