import dotenv from "dotenv";
dotenv.config();

import "./config/mongo";
import app from "./app.js";

// 👇 CONVERTIMOS A NUMBER
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API corriendo en el puerto:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


// server.ts
// import dotenv from "dotenv";
// dotenv.config();

// console.log("JWT_SECRET:", process.env.JWT_SECRET);


// import app from "./app";
// import "./config/mongo";

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`🚀 API corriendo en http://localhost:${PORT}`);
// });
