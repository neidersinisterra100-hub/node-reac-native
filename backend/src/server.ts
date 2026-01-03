import dotenv from "dotenv";
dotenv.config();

import "./config/mongo.js";
import app from "./app.js";

// 👇 CONVERTIMOS A NUMBER
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API corriendo en el puerto:${PORT}`);
});
