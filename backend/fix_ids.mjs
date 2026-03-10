import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/nauticgo?replicaSet=rs0';

// Minimal Schemas
const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const CompanySchema = new mongoose.Schema({}, { strict: false, collection: 'companies' });

const UserModel = mongoose.model('User', UserSchema);
const CompanyModel = mongoose.model('Company', CompanySchema);

async function fixLinkage() {
    try {
        // Try both mongo-dev and localhost
        console.log('⏳ Connecting to MongoDB...');
        try {
            await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        } catch (e) {
            console.log('⚠️ Failed to connect to 127.0.0.1, trying mongo-dev...');
            await mongoose.connect('mongodb://mongo-dev:27017/nauticgo?replicaSet=rs0', { serverSelectionTimeoutMS: 2000 });
        }

        console.log('✅ Connected to MongoDB');

        const userId = '699fbb7a85b03eff200c0815'; // Neider
        const companyId = '699fbc5a85b03eff200c0861'; // NAUTICGO S.A.S
        const oldOwnerId = '6997b6a6b1c37656d0d21f61';

        // 1. Link Company to new User
        const companyUpdate = await CompanyModel.findByIdAndUpdate(companyId, {
            $set: { owner: new mongoose.Types.ObjectId(userId) }
        }, { new: true });

        if (companyUpdate) {
            console.log('✅ Updated Company owner to Neider');
        } else {
            console.log('❌ Company not found');
        }

        // 2. Link User to Company
        const userUpdate = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                companyId: new mongoose.Types.ObjectId(companyId),
                role: 'owner'
            }
        }, { new: true });

        if (userUpdate) {
            console.log('✅ Updated Neider\'s companyId and role');
        } else {
            console.log('❌ User Neider not found');
        }

        // 3. Update any trips or routes
        const tripUpdate = await mongoose.connection.collection('trips').updateMany(
            { createdBy: new mongoose.Types.ObjectId(oldOwnerId) },
            { $set: { createdBy: new mongoose.Types.ObjectId(userId) } }
        );
        console.log(`✅ Updated ${tripUpdate.modifiedCount} trips to be owned by Neider`);

        const routeUpdate = await mongoose.connection.collection('routes').updateMany(
            { createdBy: new mongoose.Types.ObjectId(oldOwnerId) },
            { $set: { createdBy: new mongoose.Types.ObjectId(userId) } }
        );
        console.log(`✅ Updated ${routeUpdate.modifiedCount} routes to be owned by Neider`);

        await mongoose.disconnect();
        console.log('👋 Done');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixLinkage();
