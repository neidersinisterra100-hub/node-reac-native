import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CityModel } from './models/city.model.js';
import { MunicipioModel } from './models/municipio.model.js';

dotenv.config();

async function debugCity() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('CONNECTED');

        const cities = await CityModel.find({ name: /barbara/i });
        console.log('Cities found:', JSON.stringify(cities, null, 2));

        if (cities.length > 0) {
            const munis = await MunicipioModel.find({ _id: { $in: cities.map(c => c.municipioId) } });
            console.log('Related Municipios:', JSON.stringify(munis, null, 2));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugCity();
