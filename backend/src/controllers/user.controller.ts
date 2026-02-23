import { RequestHandler } from "express";
import { UserModel } from "../models/user.model.js";
import { encrypt, decrypt, maskIdentification } from "../utils/crypto.util.js";

/**
 * GET /api/users/profile
 * Returns the current user's profile data.
 * Sensitive data like ID is masked.
 */
export const getProfile: RequestHandler = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "No autenticado" });

        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const userObj = user.toObject();

        // Security: Mask ID if encrypted
        if (userObj.identificationNumber) {
            try {
                const plainId = decrypt(userObj.identificationNumber);
                userObj.identificationNumber = maskIdentification(plainId);
            } catch (e) {
                userObj.identificationNumber = "Error al desencriptar";
            }
        }

        // Remove password for security
        delete userObj.password;

        return res.json(userObj);
    } catch (error: any) {
        console.error("❌ [getProfile] Error:", error);
        return res.status(500).json({ message: "Error al obtener perfil" });
    }
};

/**
 * PUT /api/users/profile
 * Updates the current user's profile.
 */
export const updateProfile: RequestHandler = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "No autenticado" });

        const {
            name,
            identificationNumber,
            phone,
            birthDate,
            address,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (birthDate) updateData.birthDate = new Date(birthDate);
        if (address) updateData.address = address;
        if (emergencyContactName) updateData.emergencyContactName = emergencyContactName;
        if (emergencyContactPhone) updateData.emergencyContactPhone = emergencyContactPhone;

        // Encrypt ID number if provided
        if (identificationNumber) {
            updateData.identificationNumber = encrypt(identificationNumber);
        }

        // Check if profile is now complete
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Merge old data with new to check completness
        const mergedData = {
            identificationNumber: identificationNumber || user.identificationNumber,
            phone: phone || user.phone,
            birthDate: birthDate || user.birthDate,
            address: address || user.address,
            emergencyContactName: emergencyContactName || user.emergencyContactName,
            emergencyContactPhone: emergencyContactPhone || user.emergencyContactPhone,
        };

        const isComplete = !!(
            mergedData.identificationNumber &&
            mergedData.phone &&
            mergedData.birthDate &&
            mergedData.address &&
            mergedData.emergencyContactName &&
            mergedData.emergencyContactPhone
        );

        updateData.isProfileComplete = isComplete;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        return res.json({
            message: "Perfil actualizado correctamente",
            user: updatedUser,
            isProfileComplete: isComplete
        });
    } catch (error: any) {
        console.error("❌ [updateProfile] Error:", error);
        return res.status(500).json({ message: "Error al actualizar perfil" });
    }
};
