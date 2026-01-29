import { api } from "./api";

export interface Municipio {
    _id: string;
    name: string;
    department: string;
    departmentId: string;
    isActive: boolean;
}

export const getAllMunicipios = async (active?: boolean): Promise<Municipio[]> => {
    const params = active !== undefined ? { active } : {};
    const { data } = await api.get<any[]>("/municipios", { params });
    return data.map(m => ({
        ...m,
        id: m.id || m._id,
        _id: m._id || m.id,
        departmentId: m.departmentId || (typeof m.department === 'object' ? m.department._id : '') || "",
    })) as Municipio[];
};

export const createMunicipio = async (name: string, department: string, departmentId: string): Promise<Municipio> => {
    const { data } = await api.post<Municipio>("/municipios", { name, department, departmentId });
    return data;
};

export const toggleMunicipioActive = async (id: string, isActive: boolean): Promise<Municipio> => {
    const { data } = await api.patch<Municipio>(`/municipios/${id}/toggle`, { isActive });
    return data;
};
