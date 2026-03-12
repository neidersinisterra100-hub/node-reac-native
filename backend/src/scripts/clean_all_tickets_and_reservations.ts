import mongoose from 'mongoose';
import { SeatReservationModel } from '../models/seatReservation.model.js';
import { TicketModel } from '../models/ticket.model.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanAll = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const resCount = await SeatReservationModel.countDocuments({});
    const ticketCount = await TicketModel.countDocuments({});
    
    console.log(\Found \ reservations and \ tickets.\);

    if (resCount > 0) {
      const result = await SeatReservationModel.deleteMany({});
      console.log(\Deleted \ reservations.\);
    }
    
    if (ticketCount > 0) {
      const result = await TicketModel.deleteMany({});
      console.log(\Deleted \ tickets.\);
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanAll();
