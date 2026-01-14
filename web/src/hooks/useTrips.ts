import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/trip.service';
import { companyService, Company } from '../services/company.service';
import { Trip } from '../types/trip';
import { useAuthStore } from '../store/authStore';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore(state => state.user);
  const selectedCompany = useAuthStore(state => state.selectedCompany);
  const selectedCompanyId = selectedCompany?._id || null;

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const canToggle = isOwner || isAdmin;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        let tripsData;
        if (selectedCompanyId) {
            // Si hay empresa seleccionada, pedir SOLO sus viajes al backend
            tripsData = await tripService.getCompanyTrips(selectedCompanyId);
        } else if (isOwner || isAdmin) {
            // Si es owner/admin y ve todo, usar endpoint de gestión
            tripsData = await tripService.getManage();
        } else {
            // Público general
            tripsData = await tripService.getAll();
        }

        const companiesData = (isOwner || isAdmin) ? await companyService.getAll() : await companyService.getPublic();

        setTrips(tripsData);
        setCompanies(companiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [isOwner, isAdmin, selectedCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    if (!canToggle) return;
    try {
        await tripService.toggleActive(id, !currentStatus);
        setTrips(prev => prev.map(t => t._id === id ? { ...t, active: !currentStatus } : t));
    } catch (error) {
        console.error("Error toggling trip status:", error);
    }
  };

  const deleteTrip = async (id: string) => {
      try {
          await tripService.delete(id);
          setTrips(prev => prev.filter(t => t._id !== id));
      } catch (error) {
          console.error("Error deleting trip:", error);
          throw error; // Re-lanzar para manejar alerta en UI si es necesario
      }
  };

  const addTrip = (newTrip: Trip) => {
      setTrips(prev => [newTrip, ...prev]);
  };

  return {
    trips,
    companies,
    loading,
    isOwner,
    isAdmin,
    canToggle,
    selectedCompanyId,
    toggleActive,
    deleteTrip,
    addTrip,
    refresh: fetchData
  };
}
