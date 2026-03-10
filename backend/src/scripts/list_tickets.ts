import mongoose from 'mongoose';
import { TicketModel } from '../models/ticket.model.js';
import dotenv from 'dotenv';

dotenv.config();

const list = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tickets = await TicketModel.find({});
    console.log('Total tickets:', tickets.length);
    if (tickets.length > 0) {
      console.log('First 5 tickets:');
      console.log(JSON.stringify(tickets.slice(0, 5), null, 2));
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

list();
