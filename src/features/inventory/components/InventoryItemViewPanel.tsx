"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Expand,
    Star,
    MoreVertical,
    Truck,
    Package,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    ClipboardList,
    Receipt,
    XCircle,
    TrendingUp,
    FileText,
    Plus, // <--- Importado
    MessageSquare, // <--- Importado
    Info // <--- Importado (para notas)
} from 'lucide-react';
import InventoryApiClient from '@/lib/api/inventory.api';
import { InventoryItem, InventoryStatus, Reception, Relation } from '@/lib/types';
import { colors } from '@/lib/config/colors';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import RelationsSection from './RelationsSection';


interface InventoryItemViewPanelProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
}


const DetailItem = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-baseline py-1.5">
        <span className="text-sm text-gray-500 w-[140px] flex-shrink-0">
            {label}
        </span>
        <span className="text-sm font-semibold text-gray-800 pl-4">
            {children}
        </span>
    </div>
);

/**
 * 💎 StatusBadge (Sin cambios)
 * Este componente ya funcionaba bien.
 */
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = () => {
        if (status === InventoryStatus.COMPLETED) {
            return {
                bg: colors.status.completed.bg,
                text: colors.status.completed.text,
                border: colors.status.completed.border,
                icon: <CheckCircle2 size={14} />,
                label: 'Completo'
            };
        }
        if (status === InventoryStatus.PARTIAL) {
            return {
                bg: colors.status.partial.bg,
                text: colors.status.partial.text,
                border: colors.status.partial.border,
                icon: <Clock size={14} />,
                label: 'Parcial'
            };
        }
         if (status === InventoryStatus.OVERDELIVERED) {
            return {
                bg: colors.status.overdelivered.bg,
                text: colors.status.overdelivered.text,
                border: colors.status.overdelivered.border,
                icon: <TrendingUp size={14} />,
                label: 'Sobrentrega'
            };
        }
        if (status === InventoryStatus.CANCELLED) {
            return {
                bg: colors.status.cancelled.bg,
                text: colors.status.cancelled.text,
                border: colors.status.cancelled.border,
                icon: <XCircle size={14} />,
                label: 'Cancelado'
            };
        }
        return {
            bg: colors.status.pending.bg,
            text: colors.status.pending.text,
            border: colors.status.pending.border,
            icon: <Clock size={14} />,
            label: 'Pendiente'
        };
    };

    const config = getStatusConfig();
    
    // El estilo del mockup es más sutil, ajustamos a eso:
    return (
         <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-sm"
            style={{
                backgroundColor: config.bg,
                color: config.text,
            }}
        >
            {config.icon}
            {config.label}
        </span>
    );
};

/**
 * 💎 NUEVO ProgressSummary (Estilo Maqueta)
 * Rediseñado para coincidir con la maqueta.
 * Incluye el nuevo botón minimalista "Add".
 */
const ProgressSummary = ({
    received,
    expected,
    unit,
    onAddReception
}: {
    received: number;
    expected: number;
    unit: string;
    onAddReception: () => void;
}) => {
    // Lógica de cálculo consistente
    const percentage = expected > 0 ? (received / expected) * 100 : 0;
    const pending = expected - received;

    return (
        <div className="space-y-3">
            {/* 1. Header con CTA */}
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                    Progreso de Recepción
                </h3>
                <button
                    onClick={onAddReception}
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Registrar nueva recepción"
                >
                    <Plus size={16} className="text-gray-600" />
                </button>
            </div>

            {/* 2. Stats */}
            <div className="flex justify-between items-baseline text-sm">
                <span className="font-medium text-gray-700">
                    <span className="font-bold text-lg" style={{ color: colors.mint.medium }}>
                        {received.toLocaleString('es-ES')}
                    </span>
                    {' '}/ {expected.toLocaleString('es-ES')} {unit}
                </span>
                {pending > 0 && (
                    <span className="font-semibold" style={{ color: colors.peach.dark }}>
                        {pending.toLocaleString('es-ES')} pend.
                    </span>
                )}
            </div>

            {/* 3. Progress Bar */}
            <div
                className="relative h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.lavender.pale }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute h-full" // Sin rounded-full para bordes rectos
                    style={{ background: colors.gradients.progressBar }}
                />
            </div>

            {/* 4. Percentage Label */}
            <div className="text-right">
                <span className="text-sm font-semibold" style={{ color: colors.blue.primary }}>
                    {percentage.toFixed(0)}% recibido
                </span>
            </div>
        </div>
    );
};


const ReceptionLog = ({
    reception,
    isLast
}: {
    reception: Reception;
    isLast?: boolean;
}) => (
    <div className="relative pl-7 pb-6">
        {/* Línea vertical */}
        {!isLast && (
            <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-gray-200" />
        )}

        {/* Punto del timeline (icono de check) */}
        <div
            className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ 
                backgroundColor: isLast ? colors.mint.lighter : colors.gray[200] 
            }} 
        >
            <CheckCircle2 
                size={16} 
                style={{ 
                    color: isLast ? colors.mint.darkest : colors.gray[500] 
                }} 
            />
        </div>

        {/* Contenido */}
        <div className="pl-4">
            {/* Header: Cantidad y Fecha */}
            <div className="flex justify-between items-center mb-2.5">
                <span 
                    className="text-base font-semibold" 
                    style={{ color: colors.mint.darkest }}
                >
                    {parseFloat(reception.quantityReceived).toLocaleString('es-ES')} unidades
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(reception.receivedDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {/* Metadata: Remito y Usuario */}
            <div className="space-y-1.5 text-xs text-gray-600">
                {reception.quantityReceived && ( // TODO: Asumo que esto es Remito
                    <p className="flex items-center gap-2">
                        <Receipt size={12} className="text-gray-400" />
                        Remito: {reception.quantityReceived}
                    </p>
                )}
                {reception.createdById && (
                    <p className="flex items-center gap-2">
                        <User size={12} className="text-gray-400" />
                        Recibió: {reception.createdById}
                    </p>
                )}
            </div>

            {/* Nota de Recepción */}
            {reception.notes && (
                <div 
                    className="mt-2.5 flex items-start gap-2.5 text-xs p-2.5 rounded-md"
                    style={{ 
                        backgroundColor: colors.lavender.lightest, 
                        color: colors.blue.primary 
                    }}
                >
                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                    <span className="italic">{reception.notes}</span>
                </div>
            )}
        </div>
    </div>
);


// ============================================================================
// COMPONENTE PRINCIPAL (Layout de 2 Columnas)
// ============================================================================

export default function InventoryItemViewPanel({
    isOpen,
    itemId,
    onClose
}: InventoryItemViewPanelProps) {
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    
    // ... (Lógica de fetching y state sin cambios) ...
    useEffect(() => {
        if (isOpen && itemId) {
            const fetchItemDetails = async () => {
                setIsLoading(true);
                try {
                    const data = await InventoryApiClient.getInventoryItemById(itemId);
                    setItem(data);
                } catch (error) {
                    console.error('Error fetching item:', error);
                    setItem(null);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchItemDetails();
        }
    }, [isOpen, itemId]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setItem(null), 300);
        }
    }, [isOpen]);

    const handleRelationsUpdate = (newRelations: Relation[]) => {
        if (item) {
            setItem({ ...item, relations: newRelations });
        }
    };

    // Placeholder para la nueva acción de recepción
    const handleRegisterReception = () => {
        console.log('Abriendo modal/panel para registrar recepción...');
        // Aquí llamarías al modal o panel de registro
    };

    // Helper para formatear fechas como en la maqueta (incluyendo hora)
    const formatFullDate = (dateString: string | Date) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }) + ' hrs';
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop"
                    />

                    {/* Panel (Más ancho para las 2 columnas) */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full" // <-- max-w-4xl (más ancho)
                    >
                        {/* ----------------------------------- */}
                        {/* HEADER (Panel)                      */}
                        {/* ----------------------------------- */}
                        <div
                            className="flex items-center px-4 py-2 border-b rounded-t-2xl border-gray-200 bg-gray-50 flex-shrink-0"
                        >
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-200/60 transition-colors"
                            >
                                <X size={20} className="text-gray-700" />
                            </button>
                            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors ml-2">
                                <Expand size={18} className="text-gray-700" />
                            </button>
                            <h2
                                className="mx-auto text-sm font-semibold uppercase tracking-wide"
                                style={{ color: colors.gray[500] }}
                            >
                                Product Info
                            </h2>
                            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors">
                                <Star size={20} className="text-gray-700" />
                            </button>
                            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors ml-2">
                                <MoreVertical size={20} className="text-gray-700" />
                            </button>
                        </div>

                        {/* ----------------------------------- */}
                        {/* CONTENIDO (Scrolleable)             */}
                        {/* ----------------------------------- */}
                        <div className="flex-grow overflow-y-auto p-6">
                            {isLoading || !item ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center py-20">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                                            style={{ borderColor: colors.blue.primary }}
                                        />
                                        <p style={{ color: colors.gray[500] }}>Cargando información...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* TÍTULO Y ESTADO (Full Width) */}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h1
                                                className="text-3xl font-bold leading-tight"
                                                style={{ color: colors.blue.primary }}
                                            >
                                                {item.name}
                                            </h1>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div
                                            className="w-full h-px mb-2"
                                            style={{ backgroundColor: colors.gray[200] }} // o usa Tailwind: bg-gray-200
                                        />
                                    {/* ------------------------- */}
                                    {/* INICIO DEL GRID 2-COL   */}
                                    {/* ------------------------- */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-2">

                                        {/* COLUMNA IZQUIERDA (Detalles y Relaciones) */}
                                        <div className="md:col-span-2 space-y-6">
                                            
                                            {/* Sección Detalles */}
                                            <div>
                                                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3">
                                                    Detalles
                                                </h3>
                                                <DetailItem label="Internal Code">
                                                    {item.internalCode || '-'}
                                                </DetailItem>
                                                <DetailItem label="Categoría">
                                                    {item.category || '-'}
                                                </DetailItem>
                                                <DetailItem label="Tipo">
                                                    {item.productType || '-'}
                                                </DetailItem>
                                                <DetailItem label="Proveedor">
                                                    {item.supplier || '-'}
                                                </DetailItem>
                                                <DetailItem label="Expected Delivery">
                                                    {formatFullDate(item.expectedDeliveryDate || '')}
                                                </DetailItem>
                                                <DetailItem label="Creado por">
                                                    {item.createdById || 'Usuario'}
                                                </DetailItem>
                                                <DetailItem label="Creado el">
                                                    {formatFullDate(item.createdAt)}
                                                </DetailItem>
                                                 <DetailItem label="Actualizado el">
                                                    {formatFullDate(item.updatedAt)}
                                                </DetailItem>
                                            </div>

                                            {/* Sección Descripción */}
                                            {item.description && (
                                                <div>
                                                    <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                                                        Description
                                                    </h3>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Sección Relaciones (Placeholder) */}
                                            <RelationsSection
                                                item={item}
                                                onRelationsUpdate={handleRelationsUpdate}
                                            />
                                        </div>

                                        {/* COLUMNA DERECHA (Progreso e Historial) */}
                                        <div className="md:col-span-2"
                                                style={{ backgroundColor: colors.gray[100] }}
                                                >
                                            <div 
                                                className=" rounded-lg p-5 space-y-6"
                                            >
                                                {/* Sección Progreso */}
                                                <ProgressSummary
                                                    received={parseFloat(item.quantityReceived)}
                                                    expected={parseFloat(item.quantityExpected)}
                                                    unit={item.unitOfMeasure}
                                                    onAddReception={handleRegisterReception}
                                                />

                                                {/* Sección Historial */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                                                            Historial de Recepción
                                                        </h3>
                                                        <span
                                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                            style={{
                                                                backgroundColor: colors.gray[200],
                                                                color: colors.gray[600]
                                                            }}
                                                        >
                                                            {item.receptions?.length || 0} {item.receptions?.length === 1 ? 'recepción' : 'recepciones'}
                                                        </span>
                                                    </div>

                                                    {item.receptions && item.receptions.length > 0 ? (
                                                        <div>
                                                            {item.receptions
                                                                .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()) // <-- Ordenar por fecha
                                                                .map((reception, index, arr) => (
                                                                <ReceptionLog
                                                                    key={reception.id}
                                                                    reception={reception}
                                                                    isLast={index === arr.length - 1} // <-- Marcar el último
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <Truck
                                                                className="mx-auto mb-3"
                                                                size={32}
                                                                style={{ color: colors.gray[300] }}
                                                            />
                                                            <p className="text-sm" style={{ color: colors.gray[500] }}>
                                                                No se han registrado recepciones
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                                    
                                    {/* ------------------------- */}
                                    {/* FIN DEL GRID 2-COL        */}
                                    {/* ------------------------- */}
                                </>
                            )}
                        </div>
                        
                        {/* ----------------------------------- */}
                        {/* (Footer "sticky" ELIMINADO)         */}
                        {/* ----------------------------------- */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}