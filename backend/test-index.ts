import mongoose from "mongoose";
import { SeatReservationModel } from "./src/models/seatReservation.model.js";

async function test() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nauticgo");
    const tripId = new mongoose.Types.ObjectId("699fd33f74096db06c4e4de5");

    console.log("Emptying DB...");
    await SeatReservationModel.deleteMany({});

    console.log("Inserting User 1...");
    try {
        await SeatReservationModel.create({
            tripId,
            seatNumber: 1,
            userId: new mongoose.Types.ObjectId("699fcbea85b03eff200c0986"), // user 1
            expiresAt: new Date(Date.now() + 5 * 60000)
        });
        console.log("User 1 inserted cleanly.");
    } catch (err) {
        console.log("User 1 error:", err.message);
    }

    console.log("Inserting User 2...");
    try {
        await SeatReservationModel.create({
            tripId,
            seatNumber: 1,
            userId: new mongoose.Types.ObjectId("69a0a3c2a04f7b33c26b6060"), // user 2
            expiresAt: new Date(Date.now() + 5 * 60000)
        });
        console.log("User 2 inserted cleanly! WARNING: UNIQUE INDEX IS BROKEN!");
    } catch (err) {
        if (err.code === 11000) {
            console.log("User 2 blocked by 11000 properly! INDEX WORKS.");
        } else {
            console.log("User 2 got other error:", err.message);
        }
    }

    const count = await SeatReservationModel.countDocuments();
    console.log("Total records:", count);
    process.exit(0);
}

test();
