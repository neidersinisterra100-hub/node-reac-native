import { api } from "./api";

export interface UserProfileUpdate {
    name?: string;
    identificationNumber?: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export const getProfile = async (unmask = false) => {
    const { data } = await api.get(`/users/profile${unmask ? "?unmask=true" : ""}`);
    return data;
};

export const updateProfile = async (profileData: UserProfileUpdate) => {
    const { data } = await api.put("/users/profile", profileData);
    return data;
};
