import mongoose from 'mongoose';
import { SeatReservationModel } from '../models/seatReservation.model.js';
import dotenv from 'dotenv';

dotenv.config();

const clean = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await SeatReservationModel.countDocuments({});
    console.log(`Found ${count} active seat reservations.`);

    if (count > 0) {
      const result = await SeatReservationModel.deleteMany({});
      console.log(`Deleted ${count} reservations.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clean();
