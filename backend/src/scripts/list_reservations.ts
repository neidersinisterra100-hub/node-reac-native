import mongoose from 'mongoose';
import { SeatReservationModel } from '../models/seatReservation.model.js';
import dotenv from 'dotenv';

dotenv.config();

const list = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const reservations = await SeatReservationModel.find({});
    console.log('Total reservations:', reservations.length);
    if (reservations.length > 0) {
      console.log('First 5 reservations:');
      console.log(JSON.stringify(reservations.slice(0, 5), null, 2));
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

list();
