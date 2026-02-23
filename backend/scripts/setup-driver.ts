import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../src/models/user.model.js";
import { DriverProfileModel } from "../src/models/driverProfile.model.js";
import { VehicleModel, VehicleType } from "../src/models/vehicle.model.js";
import { connectMongo } from "../src/config/mongo.js";

const email = process.argv[2];

if (!email) {
    console.error("❌ Por favor proporciona un email: npm run setup-driver info@email.com");
    process.exit(1);
}

async function setup() {
    try {
        await connectMongo();
        console.log("📡 Conectado a MongoDB...");

        // 1. Buscar usuario
        const user = await UserModel.findOne({ email });
        if (!user) {
            console.error(`❌ Usuario no encontrado: ${email}`);
            process.exit(1);
        }

        // 2. Cambiar rol a driver
        user.role = "driver" as any;
        await user.save();
        console.log(`✅ Rol de usuario actualizado a 'driver' para: ${email}`);

        // 3. Crear Vehículo por defecto
        const vehicle = await VehicleModel.findOneAndUpdate(
            { ownerId: user._id },
            {
                brand: "Toyota",
                model: "Corolla",
                plate: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
                color: "Blanco",
                type: VehicleType.STANDARD,
                ownerId: user._id,
                active: true
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Vehículo configurado: ${vehicle.brand} ${vehicle.model} (${vehicle.plate})`);

        // 4. Crear Perfil de Conductor
        const driverProfile = await DriverProfileModel.findOneAndUpdate(
            { userId: user._id },
            {
                userId: user._id,
                vehicleId: vehicle._id,
                isOnline: true,
                isAvailable: true,
                rating: 5.0,
                currentLocation: {
                    type: "Point",
                    coordinates: [-77.665, 2.77194] // Timbiquí, Cauca
                }
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Perfil de conductor activado.`);

        console.log("\n🚀 ¡TODO LISTO! El usuario ya puede aceptar viajes en la App.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en el setup:", error);
        process.exit(1);
    }
}

setup();
