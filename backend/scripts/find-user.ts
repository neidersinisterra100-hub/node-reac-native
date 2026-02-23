import "dotenv/config";
import { connectMongo } from "../src/config/mongo.js";
import { UserModel } from "../src/models/user.model.js";

async function findUser() {
    await connectMongo();
    const user = await UserModel.findOne().sort({ createdAt: -1 });
    if (user) {
        console.log(user.email);
    } else {
        console.log("NO_USER_FOUND");
    }
    process.exit(0);
}

findUser();
