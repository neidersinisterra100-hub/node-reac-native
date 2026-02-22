import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { styled } from "nativewind";
import { ListSkeleton } from "../../components/ui/Skeletons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
    Building2,
    Route,
    Ship,
    Ticket,
    Calendar,
    ChevronLeft,
    Clock,
    User,
    AlertCircle,
    Filter,
} from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import { getCompanyAudit, AuditLog } from "../../services/audit.service";
import { RootStackParamList } from "../../navigation/types";

const StyledView = styled(View);
const StyledText = styled(Text);

type AuditRouteProp = RouteProp<RootStackParamList, "Audit">;

/* =========================================================
   ICONO POR ENTIDAD
   ========================================================= */
function EntityIcon({ entity, size = 20 }: { entity: string; size?: number }) {
    const iconProps = { size, strokeWidth: 2 };
    if (entity === "company") return <Building2 {...iconProps} color="#818CF8" />;
    if (entity === "route") return <Route     {...iconProps} color="#34D399" />;
    if (entity === "trip") return <Ship      {...iconProps} color="#60A5FA" />;
    if (entity === "ticket") return <Ticket    {...iconProps} color="#FBBF24" />;
    if (entity === "schedule") return <Calendar  {...iconProps} color="#A78BFA" />;
    return <AlertCircle {...iconProps} color="#94A3B8" />;
}

/* =========================================================
   COLOR DE FONDO SEGÚN ENTIDAD
   ========================================================= */
function entityBg(entity: string): string {
    const map: Record<string, string> = {
        company: "bg-indigo-50 dark:bg-indigo-900/20",
        route: "bg-emerald-50 dark:bg-emerald-900/20",
        trip: "bg-blue-50 dark:bg-blue-900/20",
        ticket: "bg-amber-50 dark:bg-amber-900/20",
        schedule: "bg-purple-50 dark:bg-purple-900/20",
    };
    return map[entity] ?? "bg-slate-50 dark:bg-dark-bg";
}

/* =========================================================
   FILTROS
   ========================================================= */
const FILTERS = [
    { label: "Todo", value: "" },
    { label: "Empresa", value: "company" },
    { label: "Rutas", value: "route" },
    { label: "Viajes", value: "trip" },
    { label: "Tickets", value: "ticket" },
];

/* =========================================================
   PANTALLA PRINCIPAL
   ========================================================= */
export default function AuditScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<AuditRouteProp>();
    const { companyId, companyName } = route.params || {};

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filtered, setFiltered] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilter, setActiveFilter] = useState("");

    const loadLogs = useCallback(async (pageNum = 1, reset = false) => {
        try {
            if (!companyId || companyId === 'undefined') {
                setLoading(false);
                return;
            }
            if (pageNum === 1) setLoading(true);
            const resp = await getCompanyAudit(companyId, pageNum, 30);
            const newLogs = resp.data ?? [];
            setLogs(prev => reset ? newLogs : [...prev, ...newLogs]);
            setHasMore(resp.pagination ? pageNum < resp.pagination.pages : false);
        } catch (e) {
            console.error("[AuditScreen] error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [companyId]);

    useEffect(() => { loadLogs(1, true); }, [loadLogs]);

    // Aplicar filtro local
    useEffect(() => {
        if (!activeFilter) {
            setFiltered(logs);
        } else {
            setFiltered(logs.filter(l => l.entity === activeFilter));
        }
    }, [logs, activeFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        loadLogs(1, true);
    };

    const onEndReached = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadLogs(nextPage);
    };

    /* =========================================================
       ITEM DE TIMELINE
       ========================================================= */
    const renderItem = ({ item, index }: { item: AuditLog; index: number }) => {
        const isLast = index === filtered.length - 1;
        const date = item.createdAt
            ? format(parseISO(item.createdAt), "d MMM yyyy · HH:mm", { locale: es })
            : "—";

        return (
            <StyledView className="flex-row">
                {/* LÍNEA VERTICAL */}
                <StyledView className="items-center mr-3" style={{ width: 40 }}>
                    <StyledView className={`rounded-full p-2 ${entityBg(item.entity)}`}>
                        <EntityIcon entity={item.entity} />
                    </StyledView>
                    {!isLast && (
                        <StyledView
                            className="flex-1 bg-slate-200"
                            style={{ width: 2, marginTop: 4 }}
                        />
                    )}
                </StyledView>

                {/* CONTENIDO */}
                <StyledView
                    className={`flex-1 bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-border/50 ${!isLast ? "mb-4" : ""}`}
                >
                    {/* ACCIÓN */}
                    <StyledText className="font-bold text-slate-800 dark:text-dark-text text-sm">
                        {item.actionLabel}
                    </StyledText>

                    {/* METADATA relevante */}
                    {item.metadata?.routeName && (
                        <StyledText className="text-xs text-slate-500 mt-1">
                            Ruta: {item.metadata.routeName}
                        </StyledText>
                    )}
                    {item.metadata?.tripDate && (
                        <StyledText className="text-xs text-slate-500 mt-1">
                            Fecha del viaje: {item.metadata.tripDate}
                        </StyledText>
                    )}
                    {item.metadata?.seatNumber && (
                        <StyledText className="text-xs text-slate-500 mt-1">
                            Asiento: #{item.metadata.seatNumber}
                        </StyledText>
                    )}

                    {/* FOOTER */}
                    <StyledView className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <StyledView className="flex-row items-center">
                            <User size={12} color="#94A3B8" />
                            <StyledText className="ml-1 text-[11px] text-slate-400">
                                {(item.performedBy as any)?.name ?? "Sistema"}
                            </StyledText>
                        </StyledView>
                        <StyledView className="flex-row items-center">
                            <Clock size={12} color="#94A3B8" />
                            <StyledText className="ml-1 text-[11px] text-slate-400">
                                {date}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </StyledView>
        );
    };

    return (
        <AppContainer>
            <AppHeader
                title={companyName ? `Auditoría · ${companyName}` : "Auditoría"}
                showBack
                neon
                showAvatar={false}
            />

            {/* FILTROS */}
            <StyledView className="flex-row px-4 py-3 gap-2">
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.value}
                        onPress={() => setActiveFilter(f.value)}
                        className={`px-3 py-1.5 rounded-full border ${activeFilter === f.value
                            ? "bg-nautic-primary border-nautic-primary"
                            : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border"
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${activeFilter === f.value ? "text-white" : "text-slate-600 dark:text-dark-text-muted"
                                }`}
                        >
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </StyledView>

            {loading ? (
                <ListSkeleton count={6} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 100,
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={
                        <StyledView className="items-center justify-center mt-20">
                            <Filter size={40} color={activeFilter ? "#94A3B8" : "#CBD5E1"} />
                            <StyledText className="mt-4 text-slate-400 dark:text-slate-500 text-center">
                                No hay registros de auditoría{"\n"}para esta empresa todavía.
                            </StyledText>
                        </StyledView>
                    }
                    ListFooterComponent={
                        hasMore ? (
                            <StyledView className="py-6 items-center">
                                <ActivityIndicator size="small" color="#0B4F9C" />
                            </StyledView>
                        ) : null
                    }
                />
            )}
        </AppContainer>
    );
}
