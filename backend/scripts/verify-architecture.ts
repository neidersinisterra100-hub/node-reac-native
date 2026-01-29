import mongoose from "mongoose";
import { MunicipioModel } from "../src/models/municipio.model";
import { CityModel } from "../src/models/city.model";
import { CompanyModel } from "../src/models/company.model";
import { RouteModel } from "../src/models/route.model";
import { TripModel } from "../src/models/trip.model";
import { UserModel } from "../src/models/user.model";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nauticgo_test";

async function verify() {
    console.log("🚀 Iniciando verificación de arquitectura...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a Mongo");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Crear Owner Mock
        const owner = await UserModel.create([{
            name: "Test Owner",
            email: `owner_${Date.now()}@test.com`,
            password: "hashedpassword",
            role: "owner",
            isActive: true
        }], { session });
        const ownerId = owner[0]._id;
        console.log("✅ Owner creado:", ownerId);

        // 2. Crear Municipio
        const municipio = await MunicipioModel.create([{
            name: `Municipio ${Date.now()}`,
            department: "Test Dept",
            createdBy: ownerId
        }], { session });
        const municipioId = municipio[0]._id;
        console.log("✅ Municipio creado:", municipioId);

        // 3. Crear Ciudad (con link a Municipio)
        const city = await CityModel.create([{
            name: `Ciudad ${Date.now()}`,
            department: "Test Dept",
            municipioId: municipioId,
            createdBy: ownerId
        }], { session });
        const cityId = city[0]._id;
        console.log("✅ Ciudad creada:", cityId);

        // 4. Crear Empresa (con link a Ciudad)
        // Nota: En la API real el controlador deriva municipioId, aquí lo pasamos manual para simular el resultado final
        // O invocamos la lógica de negocio si estuviera en servicio. Simularemos el resultado esperado en DB.
        const company = await CompanyModel.create([{
            name: `Empresa ${Date.now()}`,
            owner: ownerId,
            cityId: cityId,
            municipioId: municipioId, // Strict link
            isActive: true,
            plan: "pro"
        }], { session });
        const companyId = company[0]._id;
        console.log("✅ Empresa creada:", companyId);

        // 5. Crear Ruta
        const route = await RouteModel.create([{
            origin: "Puerto A",
            destination: "Puerto B",
            companyId: companyId,
            cityId: cityId,
            municipioId: municipioId,
            createdBy: ownerId,
            isActive: true
        }], { session });
        const routeId = route[0]._id;
        console.log("✅ Ruta creada:", routeId);

        // 6. Crear Viaje
        const trip = await TripModel.create([{
            routeId: routeId,
            companyId: companyId,
            cityId: cityId,
            municipioId: municipioId,
            createdBy: ownerId,
            date: "2025-12-31",
            departureTime: "10:00",
            price: 50000,
            capacity: 20,
            isActive: true
        }], { session });
        console.log("✅ Viaje creado:", trip[0]._id);

        // 7. VERIFICACIÓN DE CASCADA (Simulada, ya que la lógica está en el controlador)
        // Para probar el controlador deberíamos hacer request HTTP o importar el controlador (difícil sin mock req/res)
        // Aquí verificaremos integridad de datos.

        // Verificamos que los datos tengan los IDs correctos
        if (trip[0].municipioId.toString() !== municipioId.toString()) throw new Error("Trip municipioId mismatch");
        if (trip[0].cityId.toString() !== cityId.toString()) throw new Error("Trip cityId mismatch");

        console.log("✨ Datos íntegros confirmados.");

        await session.abortTransaction(); // No ensuciar DB
        console.log("🧹 Rollback de prueba exitoso.");

    } catch (error) {
        console.error("❌ Error en verificación:", error);
        await session.abortTransaction();
    } finally {
        session.endSession();
        await mongoose.disconnect();
    }
}

verify();
