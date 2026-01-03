import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("❌ MONGO_URI no definida en .env");
}

mongoose
  .connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) =>
    console.error("❌ Error MongoDB:", err)
  );

export default mongoose;


// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const uri = process.env.MONGO_URI || "";
// // console.log("MONGO_URI REAL =", process.env.MONGO_URI);

// mongoose.connect(uri)
//   .then(() => console.log("✅ Conectado a MongoDB Atlas"))
//   .catch(err => console.error("❌ Error MongoDB:", err));

// export default mongoose;
