// components/ui/RelationBadge.tsx
"use client";

import { colors } from '@/lib/config/colors';
import { LucideIcon, Trash2, Link as LinkIcon, Plus } from 'lucide-react'; // <-- Importar Plus

interface RelationBadgeProps {
  icon: LucideIcon;
  label: string;
  relationCode?: string;
  relationName?: string;
  isLinked: boolean;
  onAction?: () => void; // Acción para "Add" o "Ver"
  onRemove?: () => void; // Acción para "Eliminar"
}

/**
 * 💎 Componente Refactorizado 💎
 * Ahora es una "RelationRow" (Fila de Relación).
 * Abandona el layout de timeline por un flex horizontal limpio.
 */
export default function RelationBadge({
  icon: Icon,
  label,
  relationCode,
  relationName,
  isLinked,
  onAction,
  onRemove,
}: RelationBadgeProps) {
  
  return (
    <div className="flex items-center justify-between py-2 min-h-[40px]">
      
      {/* Parte Izquierda: Icono y Label */}
      <div className="flex items-center gap-2.5">
        <Icon
          size={16}
          style={{ color: colors.gray[500] }}
          strokeWidth={2}
        />
        <span className="text-sm font-medium" style={{ color: colors.gray[700] }}>
          {label}
        </span>
      </div>

      {/* Parte Derecha: Acciones o Badge */}
      <div className="flex items-center gap-1.5">
        {isLinked && (relationName || relationCode) ? (
          <>
            {/* Badge con gradiente (Tu código) */}
            <div
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-opacity hover:opacity-90"
              style={{
                backgroundImage: colors.gradients.relationBar,
                borderRadius: '5px'
              }}
              title={`Ver ${label}: ${relationName}`}
            >
              <LinkIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
              {/* NOTA DE SENIOR: Texto gradiente sobre fondo gradiente es ilegible. 
                Cambiado a 'text-white' para accesibilidad. 
              */}
              <span className="text-xs font-bold text-white">
                {relationCode ? `${relationCode}` : relationName}
              </span>
            </div>

            {/* Botón de eliminar (Tu código, con estilo más limpio) */}
            {onRemove && (
              <button
                onClick={onRemove}
                className="w-7 h-7 flex items-center justify-center rounded-[5px] transition-colors bg-gray-100 hover:bg-red-100"
                title="Eliminar relación"
              >
                <Trash2 size={15} className="text-red-500" />
              </button>
            )}
          </>
        ) : (
          <>
            {/* Estado sin relación (Estilo maqueta: texto simple) */}
            <span
              className="text-sm"
              style={{ color: colors.gray[500] }}
            >
              No relacionada
            </span>

            {/* Botón Add (Estilo maqueta: + Add) */}
            <button
              onClick={onAction}
              className="text-sm font-semibold px-2 py-1 rounded-[5px] transition-colors flex items-center gap-1"
               style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
               }}
               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[200]}
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
            >
              <Plus size={14} />
              Add
            </button>
          </>
        )}
      </div>
    </div>
  );
}