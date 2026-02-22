import { api } from "./api";

/* =========================================================
   TIPOS
   ========================================================= */
export interface AuditLog {
    id: string;
    action: string;
    actionLabel: string;
    entity: string;
    entityId: string;
    source: "manual" | "system" | "n8n";
    performedBy?: {
        name: string;
        email: string;
        role: string;
    };
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface AuditPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface AuditResponse {
    data: AuditLog[];
    pagination?: AuditPagination;
}

/* =========================================================
   GET /api/audit/company/:companyId
   ========================================================= */
export async function getCompanyAudit(
    companyId: string,
    page = 1,
    limit = 30
): Promise<AuditResponse> {
    if (!companyId || companyId === 'undefined') {
        console.warn('[audit.service] getCompanyAudit llamado con ID inválido:', companyId);
        return { data: [] };
    }
    const { data } = await api.get<AuditResponse>(
        `/audit/company/${companyId}`,
        { params: { page, limit } }
    );
    return data;
}

/* =========================================================
   GET /api/audit/me
   ========================================================= */
export async function getMyAudit(limit = 20): Promise<AuditLog[]> {
    const { data } = await api.get<{ data: AuditLog[] }>("/audit/me", {
        params: { limit },
    });
    return data.data;
}
