import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

/* ─── Bloque base ─── */
function Bone({ className = '' }: { className?: string }) {
    return <StyledView className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />;
}

/* ─── Card Skeleton: simula una card con icono + 2 líneas ─── */
export function CardSkeleton() {
    return (
        <StyledView className="bg-white dark:bg-dark-surface rounded-2xl p-4 mb-3 flex-row items-center">
            <Bone className="w-12 h-12 rounded-xl mr-4" />
            <StyledView className="flex-1 space-y-2">
                <Bone className="h-4 w-3/5 rounded" />
                <Bone className="h-3 w-2/5 rounded" />
            </StyledView>
        </StyledView>
    );
}

/* ─── Lista de Cards: para rutas, viajes, tickets, empresas ─── */
export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <StyledView className="px-4 pt-3">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </StyledView>
    );
}

/* ─── Dashboard Skeleton: stats cards + list ─── */
export function DashboardSkeleton() {
    return (
        <StyledView className="px-4 pt-4 space-y-4">
            {/* Stat cards row */}
            <StyledView className="flex-row gap-3">
                <StyledView className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-5 space-y-3">
                    <Bone className="w-10 h-10 rounded-full" />
                    <Bone className="h-6 w-16 rounded" />
                    <Bone className="h-3 w-24 rounded" />
                </StyledView>
                <StyledView className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-5 space-y-3">
                    <Bone className="w-10 h-10 rounded-full" />
                    <Bone className="h-6 w-16 rounded" />
                    <Bone className="h-3 w-24 rounded" />
                </StyledView>
            </StyledView>
            {/* Section header */}
            <StyledView className="flex-row justify-between items-center mt-2">
                <Bone className="h-5 w-32 rounded" />
                <Bone className="h-4 w-20 rounded" />
            </StyledView>
            {/* Cards */}
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </StyledView>
    );
}

/* ─── Seat Grid Skeleton ─── */
export function SeatGridSkeleton({ count = 20 }: { count?: number }) {
    return (
        <StyledView className="flex-row flex-wrap justify-center gap-2.5 mt-4 px-4">
            {Array.from({ length: count }).map((_, i) => (
                <Bone key={i} className="w-[50px] h-[50px] rounded-lg" />
            ))}
        </StyledView>
    );
}

/* ─── Detail / Report Skeleton ─── */
export function DetailSkeleton() {
    return (
        <StyledView className="px-4 pt-4 space-y-4">
            <StyledView className="bg-white dark:bg-dark-surface rounded-2xl p-6 space-y-4">
                <Bone className="h-6 w-2/3 rounded" />
                <Bone className="h-4 w-1/2 rounded" />
                <StyledView className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <StyledView key={i} className="flex-row justify-between">
                            <Bone className="h-3 w-24 rounded" />
                            <Bone className="h-3 w-32 rounded" />
                        </StyledView>
                    ))}
                </StyledView>
            </StyledView>
        </StyledView>
    );
}

/* ─── Passengers Skeleton ─── */
export function PassengersSkeleton({ count = 6 }: { count?: number }) {
    return (
        <StyledView className="px-4 pt-3">
            {Array.from({ length: count }).map((_, i) => (
                <StyledView key={i} className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-3 flex-row justify-between items-center">
                    <StyledView className="space-y-2">
                        <Bone className="h-4 w-36 rounded" />
                        <Bone className="h-3 w-24 rounded" />
                    </StyledView>
                    <Bone className="h-6 w-16 rounded-full" />
                </StyledView>
            ))}
        </StyledView>
    );
}
