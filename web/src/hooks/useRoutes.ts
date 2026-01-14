import { useState, useEffect, useCallback } from 'react';
import { routeService, Route } from '../services/route.service';
import { companyService, Company } from '../services/company.service';
import { useAuthStore } from '../store/authStore';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore(state => state.user);
  const setSelectedCompany = useAuthStore(state => state.setSelectedCompany);
  const selectedCompany = useAuthStore(state => state.selectedCompany);
  const selectedCompanyId = selectedCompany?._id || null;

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const canToggle = isOwner || isAdmin;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const routesPromise = routeService.getAll();
        const companiesPromise = (isOwner || isAdmin) ? companyService.getAll() : companyService.getPublic();

        const [routesData, companiesData] = await Promise.all([
            routesPromise,
            companiesPromise
        ]);
        setRoutes(routesData);
        setCompanies(companiesData);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  }, [isOwner, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Preselección de empresa
  useEffect(() => {
    if (loading) return;
    
    if (isOwner && companies.length > 0) {
        const isSelectedValid = selectedCompanyId && companies.some(c => c._id === selectedCompanyId);
        
        if (!selectedCompanyId || !isSelectedValid) {
            setSelectedCompany({ _id: companies[0]._id, name: companies[0].name });
        }
    }
  }, [isOwner, companies, selectedCompanyId, setSelectedCompany, loading]);

  const toggleActive = async (routeId: string, currentStatus: boolean) => {
    if (!canToggle) return; 
    try {
        await routeService.toggleActive(routeId, !currentStatus);
        setRoutes(prev => prev.map(r => r._id === routeId ? { ...r, active: !currentStatus } : r));
    } catch (error) {
        console.error("Error toggling route status:", error);
    }
  };

  const deleteRoute = async (id: string) => {
      try {
          await routeService.delete(id);
          setRoutes(prev => prev.filter(r => r._id !== id));
      } catch (error) {
          console.error("Error deleting route:", error);
          throw error;
      }
  };

  const addRoute = (newRoute: Route) => {
      setRoutes(prev => {
          const exists = prev.some(r => r._id === newRoute._id);
          if (exists) return prev;
          return [newRoute, ...prev];
      });
  };

  return {
    routes,
    companies,
    loading,
    isOwner,
    isAdmin,
    canToggle,
    selectedCompanyId,
    selectedCompany,
    toggleActive,
    deleteRoute,
    addRoute,
    refresh: fetchData
  };
}
