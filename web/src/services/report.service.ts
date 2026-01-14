import api from '../lib/axios';

export interface SalesReport {
    _id: string; // Date "YYYY-MM-DD"
    totalSales: number;
    ticketsCount: number;
}

export interface OccupancyReport {
    tripId: string;
    date: string;
    capacity: number;
    sold: number;
    occupancyRate: number;
}

export const getSalesReport = async (from: string, to: string) => {
    const response = await api.get<SalesReport[]>('/reports/sales', { params: { from, to } });
    return response.data;
};

export const getOccupancyReport = async () => {
    const response = await api.get<OccupancyReport[]>('/reports/occupancy');
    return response.data;
};
