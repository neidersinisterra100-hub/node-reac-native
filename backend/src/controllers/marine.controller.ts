import { Request, Response } from 'express';
import { MarineService } from '../services/marine.service.js';

export class MarineController {
    static async getWeather(req: Request, res: Response) {
        try {
            const { lat, lon } = req.query;

            // Allow null/undefined, MarineService handles defaults
            const latitude = lat ? Number(lat) : undefined;
            const longitude = lon ? Number(lon) : undefined;

            const data = await MarineService.getCurrentWeather(latitude, longitude);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getTides(req: Request, res: Response) {
        try {
            const { lat, lon } = req.query;

            // Allow null/undefined, MarineService handles defaults
            const latitude = lat ? Number(lat) : undefined;
            const longitude = lon ? Number(lon) : undefined;

            const data = await MarineService.getTideInfo(latitude, longitude);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
