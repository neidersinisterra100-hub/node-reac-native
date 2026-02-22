import { RequestHandler } from 'express';
import { AdminScheduleModel } from '../models/admin-schedule.model.js';

/* =========================================================
   GET ADMIN SCHEDULES (Monthly)
   ========================================================= */
export const getAdminSchedules: RequestHandler = async (req, res) => {
  try {
    const { companyId, year, month } = req.query;

    if (!companyId || !year || !month) {
      return res.status(400).json({ message: 'Faltan parámetros (companyId, year, month)' });
    }

    const schedules = await AdminScheduleModel.find({
      companyId,
      year: Number(year),
      month: Number(month),
    }).populate('adminId', 'name email'); // Populate admin info for display

    res.json(schedules);
  } catch (error) {
    console.error('Error getting admin schedules:', error);
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
};

/* =========================================================
   SET ADMIN SCHEDULE (Upsert)
   ========================================================= */
export const setAdminSchedule: RequestHandler = async (req, res) => {
  try {
    const { companyId, adminId, day, month, year, type, note, isSalesActive } = req.body;

    // Validación básica
    if (!companyId || !adminId || !day || !month || !year || !type) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    // Calcular scheduledStart para n8n (Asumimos 06:00 AM hora local o UTC según convención)
    // Para simplificar, usaremos UTC 06:00
    // year, month (1-12), day
    const scheduledStart = new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
    
    // Opcional: scheduledEnd (ej: 18:00)
    const scheduledEnd = new Date(Date.UTC(year, month - 1, day, 18, 0, 0));

    // Prepare update object
    const updateData: any = {
      type,
      note,
      scheduledStart,
      scheduledEnd,
      updatedAt: new Date(),
    };

    // Si se envía isSalesActive explícitamente, actualizarlo (para toggle manual)
    if (typeof isSalesActive === 'boolean') {
      updateData.isSalesActive = isSalesActive;
    }

    // Upsert: Busca si existe turno para ese admin en esa fecha y empresa
    console.debug('Admin schedule upsert payload:', {
      companyId,
      adminId,
      day,
      month,
      year,
      updateData,
    });

    const schedule = await AdminScheduleModel.findOneAndUpdate(
      {
        companyId,
        adminId,
        day,
        month,
        year,
      },
      {
        $set: updateData,
      },
      {
        new: true, // Retorna el documento actualizado
        upsert: true, // Crea si no existe
        setDefaultsOnInsert: true,
      }
    );

    res.json(schedule);
  } catch (error) {
    console.error('Error setting admin schedule:', error);
    res.status(500).json({ message: 'Error al guardar turno' });
  }
};
