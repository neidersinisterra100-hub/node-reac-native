import { MercadoPagoConfig } from "mercadopago";
import dotenv from "dotenv";
dotenv.config();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export default mpClient;


// backend/src/config/mercadopago.ts
// import mercadopago from "mercadopago";

// dotenv.config(); // Carga variables de entorno desde .env

// Configuración del access token
// mercadopago.configurations.setAccessToken(
//   process.env.MP_ACCESS_TOKEN || ""
// );

// export default mercadopago;


// import mercadopago from "mercadopago";
// import dotenv from "dotenv";

// dotenv.config();

// mercadopago.configurations.setAccessToken(
//   process.env.MP_ACCESS_TOKEN || ""
// );

// export default mercadopago;
