import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, FileText, Power, Trash2, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { companyService, Company, CreateCompanyWithAdminInput, CompanyCompliance } from '../services/company.service';
import { useAuthStore } from '../store/authStore';

export function Companies() {
    const navigate = useNavigate();
    const setSelectedCompany = useAuthStore(state => state.setSelectedCompany);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(state => state.user);
    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin';
    const canCreate = isOwner; // Solo owner crea empresas
    const canToggle = isOwner || isAdmin; // Admin y owner pueden activar/desactivar

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await companyService.getMyCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        if (!canToggle) return;
        try {
            await companyService.toggleCompanyActive(id, !currentStatus);
            setCompanies(companies.map(c => c._id === id ? { ...c, active: !currentStatus } : c));
        } catch (error) {
            console.error("Error toggling company:", error);
        }
    };

    // Estado del Formulario Extendido
    const [isCreating, setIsCreating] = useState(false);
    const [newCompanyData, setNewCompanyData] = useState<CreateCompanyWithAdminInput>({
        name: '',
        nit: '',
        legalRepresentative: '',
        licenseNumber: '',
        insurancePolicyNumber: '',
        // Inicializar campos de admin
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        compliance: {
            hasLegalConstitution: false,
            hasTransportLicense: false,
            hasVesselRegistration: false,
            hasCrewLicenses: false,
            hasInsurance: false,
            hasSafetyProtocols: false
        }
    });

    const handleInputChange = (field: keyof CreateCompanyWithAdminInput, value: CreateCompanyWithAdminInput[keyof CreateCompanyWithAdminInput]) => {
        setNewCompanyData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplianceChange = (field: keyof CompanyCompliance, value: boolean) => {
        setNewCompanyData(prev => ({
            ...prev,
            compliance: {
                ...prev.compliance!,
                [field]: value
            }
        }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyData.name.trim()) return;

        try {
            let response;
            // Si hay datos de admin, usamos el endpoint transaccional
            if (newCompanyData.adminEmail && newCompanyData.adminPassword) {
                response = await companyService.createCompanyWithAdmin(newCompanyData);
                // La respuesta tiene formato { company, admin, message }
                setCompanies([response.company, ...companies]);
            } else {
                // Creación simple sin admin
                const newCompany = await companyService.createCompany(newCompanyData);
                setCompanies([newCompany, ...companies]);
            }

            // Reset
            setNewCompanyData({
                name: '',
                nit: '',
                legalRepresentative: '',
                licenseNumber: '',
                insurancePolicyNumber: '',
                adminName: '',
                adminEmail: '',
                adminPassword: '',
                compliance: {
                    hasLegalConstitution: false,
                    hasTransportLicense: false,
                    hasVesselRegistration: false,
                    hasCrewLicenses: false,
                    hasInsurance: false,
                    hasSafetyProtocols: false
                }
            });
            setIsCreating(false);
        } catch (error) {
            console.error("Error creating company:", error);
            alert("Error al crear empresa. Verifica los datos.");
        }
    };

    const handleCompanyClick = (company: Company) => {
        setSelectedCompany({ _id: company._id, name: company.name });
        navigate('/routes');
    };

    const handleToggleClick = (e: React.MouseEvent, id: string, currentStatus: boolean) => {
        e.stopPropagation();
        handleToggleActive(id, currentStatus);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        handleDelete(id);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("⚠️ ¿Estás seguro de eliminar esta empresa?\n\nEsta  acción borrará también sus rutas y viajes asociados.\nNo se puede deshacer.");
        if (!confirmed) return;

        try {
            await companyService.deleteCompany(id);
            setCompanies(companies.filter(c => c._id !== id));
        } catch (error) {
            console.error("Error deleting company:", error);
            alert("Error al eliminar empresa");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dashboard-navy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Empresas</h2>
                    <p className="text-gray-500 dark:text-gray-400">Gestiona tus empresas de transporte y su cumplimiento legal</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-dashboard-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Plus size={20} />
                        <span>{isCreating ? 'Cancelar' : 'Nueva Empresa'}</span>
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Registro Legal de Empresa</h3>

                    {/* SECCIÓN DATOS EMPRESA (Existente) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial *</label>
                            <input
                                type="text"
                                value={newCompanyData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ej. NauticGo S.A."
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIT</label>
                            <input
                                type="text"
                                value={newCompanyData.nit}
                                onChange={(e) => handleInputChange('nit', e.target.value)}
                                placeholder="Ej. 900.123.456-7"
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* Agrega más campos de empresa aquí si faltan (legalRepresentative, licenseNumber, etc) */}
                    </div>

                    {/* NUEVA SECCIÓN: ADMINISTRADOR DE LA EMPRESA */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-100 dark:border-blue-800">
                        <h4 className="text-md font-semibold mb-3 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                            <Users size={18} />
                            Crear Administrador Asignado
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Admin *</label>
                                <input
                                    type="text"
                                    value={newCompanyData.adminName}
                                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                                    placeholder="Nombre Completo"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required={!!newCompanyData.adminEmail} // Requerido si escribe email
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Login) *</label>
                                <input
                                    type="email"
                                    value={newCompanyData.adminEmail}
                                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                                    placeholder="admin@empresa.com"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required={!!newCompanyData.adminName} // Requerido si escribe nombre
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                                <input
                                    type="password"
                                    value={newCompanyData.adminPassword}
                                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                                    placeholder="******"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required={!!newCompanyData.adminEmail} // Requerido si escribe email
                                />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            * Este usuario tendrá acceso exclusivo para gestionar rutas y viajes de esta empresa.
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                        <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-600" />
                            Checklist de Cumplimiento Legal
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newCompanyData.compliance?.hasLegalConstitution}
                                    onChange={(e) => handleComplianceChange('hasLegalConstitution', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Constitución Legal (Cámara/RUT)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newCompanyData.compliance?.hasTransportLicense}
                                    onChange={(e) => handleComplianceChange('hasTransportLicense', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Habilitación Transporte (Dimar/Min)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newCompanyData.compliance?.hasVesselRegistration}
                                    onChange={(e) => handleComplianceChange('hasVesselRegistration', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Matrículas de Embarcaciones al día</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newCompanyData.compliance?.hasInsurance}
                                    onChange={(e) => handleComplianceChange('hasInsurance', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Seguros Vigentes (RC/Pasajeros)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Registrar Empresa
                        </button>
                    </div>
                </form>
            )}

            {companies.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-gray-400 dark:text-gray-500" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {isOwner ? "No tienes empresas registradas" : "No hay empresas registradas por el momento"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {isOwner ? "Comienza creando tu primera empresa de transporte." : "Vuelve más tarde para ver las empresas disponibles."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <div
                            key={company._id}
                            onClick={() => handleCompanyClick(company)}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border cursor-pointer relative ${company.active ? 'border-green-500 dark:border-green-600' : 'border-transparent hover:border-blue-100 dark:hover:border-blue-900'
                                }`}
                        >
                            {/* Badge de Verificado (Legal) - INTEGRADO Y PROFESIONAL */}
                            {company.active && (
                                <div className="absolute top-4 right-14 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-green-200 dark:border-green-800">
                                    <CheckCircle size={12} strokeWidth={3} /> VERIFICADA
                                </div>
                            )}
                            {!company.active && isOwner && (
                                <div className="absolute top-4 right-14 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-orange-200 dark:border-orange-800">
                                    <AlertTriangle size={12} strokeWidth={3} /> PENDIENTE
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Building2 className="text-dashboard-navy dark:text-blue-400" size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {canToggle && (
                                        <>
                                            <button
                                                onClick={(e) => handleToggleClick(e, company._id, company.active)}
                                                title={company.active ? "Desactivar" : "Activar"}
                                                className={`p-2 rounded-full transition-all duration-200 ${company.active
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
                                                    }`}>
                                                <Power size={18} />
                                            </button>
                                            {isOwner && (
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, company._id)}
                                                    title="Eliminar"
                                                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {!canToggle && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${company.active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {company.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{company.name}</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <FileText size={16} className="text-gray-400" />
                                    <span>NIT: {company.nit || 'No registrado'}</span>
                                </div>
                                {company.licenseNumber && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <CheckCircle size={16} className="text-blue-500" />
                                        <span>Hab: {company.licenseNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
