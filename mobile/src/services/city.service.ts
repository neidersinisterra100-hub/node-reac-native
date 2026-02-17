import { api } from "./api";

export interface City {
    _id: string;
    name: string;
    department: string;
    isActive: boolean;
      // 🔑 CLAVE
  municipio: string | { _id: string; name?: string };
}

export const getAllCities = async (): Promise<City[]> => {
    const { data } = await api.get<any[]>("/cities");
    return data.map(c => ({
        ...c,
        id: c.id || c._id,
        _id: c._id || c.id,
        departmentId: c.departmentId || (typeof c.department === 'object' ? c.department._id : '') || "",
        municipioId: c.municipioId || (typeof c.municipio === 'object' ? c.municipio._id : '') || "",
    })) as City[];
};

export const createCity = async (name: string, department: string, departmentId: string, municipioId: string): Promise<City> => {
    const { data } = await api.post<City>("/cities", { name, department, departmentId, municipioId });
    return data;
};
