export interface Department {
    _id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateDepartmentInput {
    name: string;
}
