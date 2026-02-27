import "dotenv/config";
import mongoose, { Types } from "mongoose";
// import { connectMongo } from "../src/config/mongo.js";
import { UserModel } from "../src/models/user.model.js";
import { CompanyModel } from "../src/models/company.model.js";

async function fixLinkage() {
    try {
        // Usar directConnection=true evita que Mongoose intente
        // descubrir el Replica Set usando nombres de host internos de Docker (como 'mongo' o 'mongo-dev')
        const url = "mongodb://127.0.0.1:27017/nauticgo?directConnection=true";
        console.log(`Connecting to ${url}...`)
        await mongoose.connect(url);
        console.log("✅ [Fix] Connected to MongoDB");

        const userId = "699fbb7a85b03eff200c0815"; // Neider
        const companyId = "699fbc5a85b03eff200c0861"; // NAUTICGO S.A.S
        const oldOwnerId = "6997b6a6b1c37656d0d21f61";

        // 1. Link Company to new User
        const companyUpdate = await CompanyModel.findByIdAndUpdate(
            companyId,
            {
                $set: { owner: new Types.ObjectId(userId) },
            },
            { new: true }
        );

        if (companyUpdate) {
            console.log("✅ [Fix] Updated Company owner to Neider (Correct ID)");
        } else {
            console.log("❌ [Fix] Company not found");
        }

        // 2. Link User to Company and ensure role is owner
        const userUpdate = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    companyId: new Types.ObjectId(companyId),
                    role: "owner",
                },
            },
            { new: true }
        );

        if (userUpdate) {
            console.log("✅ [Fix] Updated Neider's companyId and role");
        } else {
            console.log("❌ [Fix] User Neider not found");
        }

        // 3. Transfer ownership of trips
        const tripUpdate = await mongoose.connection.collection("trips").updateMany(
            { createdBy: new Types.ObjectId(oldOwnerId) },
            { $set: { createdBy: new Types.ObjectId(userId) } }
        );
        console.log(`✅ [Fix] Updated ${tripUpdate.modifiedCount} trips`);

        // 4. Transfer ownership of routes
        const routeUpdate = await mongoose.connection.collection("routes").updateMany(
            { createdBy: new Types.ObjectId(oldOwnerId) },
            { $set: { createdBy: new Types.ObjectId(userId) } }
        );
        console.log(`✅ [Fix] Updated ${routeUpdate.modifiedCount} routes`);

        console.log("👋 [Fix] Finished linking IDs");
        process.exit(0);
    } catch (error) {
        console.error("❌ [Fix] Error linking IDs:", error);
        process.exit(1);
    }
}

fixLinkage();
