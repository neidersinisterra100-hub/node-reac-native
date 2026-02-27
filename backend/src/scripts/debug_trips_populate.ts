import mongoose from 'mongoose';
import { TripModel } from '../models/trip.model.js';
import dotenv from 'dotenv';

dotenv.config();

const debug = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const trips = await TripModel.find({ isActive: true })
      .populate({
        path: 'routeId',
        select: 'origin destination isActive',
      })
      .populate({
        path: 'companyId',
        select: 'name',
      })
      .limit(5)
      .lean();

    console.log('Trips found:', trips.length);
    trips.forEach((t, i) => {
      console.log(\Trip \:\);
      console.log('  ID:', t._id);
      console.log('  Route:', JSON.stringify(t.routeId, null, 2));
      console.log('  Company:', JSON.stringify(t.companyId, null, 2));
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debug();
