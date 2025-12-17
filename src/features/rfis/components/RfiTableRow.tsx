"use client";

import { colors } from '@/lib/config/colors';
import { Calendar, DollarSign, Clock, MessageCircle, Paperclip } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { RFI, RFIPriority, RFIStatus } from '@/lib/types';

interface RfiTableRowProps {
  rfi: RFI;
  onViewRfi: (rfiId: string) => void;
  onRefresh: () => void;
}

export default function RfiTableRow({ rfi, onViewRfi, onRefresh }: RfiTableRowProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getDaysRemaining = (dateRequired: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const required = new Date(dateRequired);
    required.setHours(0, 0, 0, 0);
    const diffTime = required.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return colors.coral.dark; // Vencido
    if (days === 0) return colors.peach.dark; // Vence hoy
    if (days <= 3) return colors.peach.medium; // Próximo a vencer
    return colors.gray[600]; // Normal
  };

  const getPriorityConfig = (priority: RFIPriority) => {
    const configs = {
      LOW: { bg: colors.mint.lighter, text: colors.mint.darkest, label: 'Baja', icon: '🟢' },
      MEDIUM: { bg: '#FEF3C7', text: '#92400E', label: 'Media', icon: '🟡' },
      HIGH: { bg: colors.peach.light, text: colors.peach.darkest, label: 'Alta', icon: '🟠' },
      CRITICAL: { bg: colors.coral.light, text: colors.coral.darkest, label: 'Urgente', icon: '🔴' }

    };
    return configs[priority];
  };

    const getStatusConfig = (status: RFIStatus) => {
    const configs: Record<RFIStatus, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: colors.gray[100], text: colors.gray[600], label: 'Borrador' },
      OPEN: { bg: colors.blue.lightest, text: colors.blue.primary, label: 'Abierto' },
      RESPONDED: { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente' },
      CLOSED: { bg: colors.mint.lighter, text: colors.mint.darkest, label: 'Cerrado' },
      VOID: { bg: colors.gray[100], text: colors.gray[600], label: 'Anulado' },
      PENDING_OFFICIAL: { bg: colors.gray[100], text: colors.gray[600], label: 'Pendiente' }
    };
    return configs[status];
  };

  const daysRemaining = getDaysRemaining(rfi.dueDate);
  const priorityConfig = getPriorityConfig(rfi.priority);
  const statusConfig = getStatusConfig(rfi.status);
  const isMyBall = rfi.ballInCourtId === currentUserId;
  const isOverdue = daysRemaining < 0 && rfi.status !== 'CLOSED' && rfi.status !== 'VOID';

  return (
    <tr
      onClick={() => onViewRfi(rfi.id)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      style={{
        backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : undefined
      }}
    >
      {/* # - RFI NUMBER */}
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: colors.gray[900] }}>
            {rfi.rfiNumber}
          </span>
          {isOverdue && (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-bold"
              style={{
                backgroundColor: colors.coral.light,
                color: colors.coral.darkest
              }}
            >
              VENCIDO
            </span>
          )}
        </div>
      </td>

      {/* TÍTULO */}
      <td className="p-3 max-w-xs">
        <p className="text-sm font-medium truncate" style={{ color: colors.gray[900] }}>
          {rfi.title}
        </p>
        {rfi.location && (
          <p className="text-xs mt-0.5" style={{ color: colors.gray[500] }}>
            📍 {rfi.location}
          </p>
        )}
      </td>

      {/* BALL IN COURT */}
      <td className="p-3">
        <div className="flex items-center gap-2">
          {isMyBall ? (
            <div
              className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              style={{
                backgroundColor: colors.blue.lightest,
                color: colors.blue.primary
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.blue.primary }} />
              Tu turno
            </div>
          ) : (
            <span className="text-sm" style={{ color: colors.gray[600] }}>
              {rfi.ballInCourtId || '—'}
            </span>
          )}
        </div>
      </td>

      {/* PRIORIDAD */}
      <td className="p-3 text-center">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: priorityConfig.bg,
            color: priorityConfig.text
          }}
        >
          {priorityConfig.icon} {priorityConfig.label}
        </span>
      </td>

      {/* ESTADO */}
      <td className="p-3 text-center">
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: statusConfig.bg,
            color: statusConfig.text
          }}
        >
          {statusConfig.label}
        </span>
      </td>

      {/* ASIGNADO A */}
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              backgroundColor: colors.gray[200],
              color: colors.gray[700]
            }}
          >
            {rfi.assigneeId?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: colors.gray[900] }}>
              {rfi.assigneeId || '—'}
            </p>
            <p className="text-xs" style={{ color: colors.gray[500] }}>
              {rfi.assigneeId || ''}
            </p>
          </div>
        </div>
      </td>

      {/* FECHA LÍMITE */}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Calendar size={14} style={{ color: colors.gray[400] }} />
          <span className="text-sm" style={{ color: colors.gray[600] }}>
            {new Date(rfi.dueDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </span>
        </div>
      </td>

      {/* DÍAS RESTANTES */}
      <td className="p-3 text-right">
        <span
          className="text-sm font-semibold"
          style={{ color: getDaysColor(daysRemaining) }}
        >
          {daysRemaining < 0
            ? `${Math.abs(daysRemaining)}d atrás`
            : daysRemaining === 0
            ? 'Hoy'
            : `${daysRemaining}d`}
        </span>
      </td>

      {/* IMPACTO */}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {rfi.scheduleImpact && (
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs"
              style={{
                backgroundColor: colors.peach.light,
                color: colors.peach.darkest
              }}
              title={`Impacto: ${rfi.scheduleDays} días`}
            >
              <Clock size={12} />
              <span className="font-medium">{rfi.scheduleDays}d</span>
            </div>
          )}
          {rfi.costImpact && (
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs"
              style={{
                backgroundColor: colors.coral.light,
                color: colors.coral.darkest
              }}
              title={`Impacto: $${rfi.costAmount?.toLocaleString()}`}
            >
              <DollarSign size={12} />
              <span className="font-medium">
                ${(rfi.costAmount || 0) >= 1000 ? `${Math.round((rfi.costAmount || 0) / 1000)}k` : rfi.costAmount}
              </span>
            </div>
          )}
          {!rfi.scheduleImpact && !rfi.costImpact && (
            <span className="text-xs" style={{ color: colors.gray[400] }}>—</span>
          )}
        </div>
      </td>

      {/* ACTIVIDAD (Comentarios y Adjuntos) */}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-3">
          {/* Comentarios */}
          <div
            className="flex items-center gap-1"
            title={`${rfi.responses?.length || 0} comentarios`}
          >
            <MessageCircle size={14} style={{ color: colors.gray[400] }} />
            <span className="text-xs font-medium" style={{ color: colors.gray[600] }}>
              {rfi.responses?.length || 0}
            </span>
          </div>

          {/* Adjuntos */}
          <div
            className="flex items-center gap-1"
            title={`${rfi.attachments?.length || 0} adjuntos`}
          >
            <Paperclip size={14} style={{ color: colors.gray[400] }} />
            <span className="text-xs font-medium" style={{ color: colors.gray[600] }}>
              {rfi.attachments?.length || 0}
            </span>
          </div>

          {/* Respuesta Oficial */}
          {rfi.responses?.some(r => r.isOfficial) && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: colors.mint.lighter
              }}
              title="Tiene respuesta oficial"
            >
              <span className="text-xs">✓</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}