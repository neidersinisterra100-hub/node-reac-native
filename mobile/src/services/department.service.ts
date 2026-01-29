import { api } from './api';
import { Department, CreateDepartmentInput } from '../types/department';

export const departmentService = {
    getAll: async (activeOnly: boolean = true) => {
        const params = activeOnly ? { active: 'true' } : {};
        const response = await api.get<any[]>('/departments', { params });
        return response.data.map(d => ({
            ...d,
            id: d.id || d._id, // Ensure id exists
            _id: d._id || d.id
        })) as Department[];
    },

    create: async (data: CreateDepartmentInput) => {
        const response = await api.post<Department>('/departments', data);
        return response.data;
    },

    toggleActive: async (id: string, isActive: boolean) => {
        const response = await api.patch<Department>(`/departments/${id}/toggle`, { isActive });
        return response.data;
    }
};
