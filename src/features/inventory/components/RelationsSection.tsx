// components/ui/RelationsSection.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { colors } from '@/lib/config/colors';
import { InventoryItem, Relation } from '@/lib/types';
import RelationBadge from '@/components/ui/RelationBadge'; // <-- Este es el componente que también vamos a cambiar
import BudgetSelector from '@/features/budget/components/panels/BudgetSelector';
import InventoryApiClient from '@/lib/api/inventory.api';

import { Receipt, FileText, ClipboardList, LucideIcon } from 'lucide-react';

export type RelationService = 'BUDGET' | 'BILL' | 'TASK';

export interface RelationConfig {
  service: RelationService;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

export const RELATION_CONFIGS: RelationConfig[] = [
  { service: 'BUDGET', label: 'Budget', icon: Receipt, enabled: true },
  { service: 'BILL', label: 'Bills', icon: FileText, enabled: true },
  { service: 'TASK', label: 'Tasks', icon: ClipboardList, enabled: true },
];

interface RelationsSectionProps {
  item: InventoryItem;
  onRelationsUpdate: (newRelations: Relation[]) => void;
}

export default function RelationsSection({ item, onRelationsUpdate }: RelationsSectionProps) {
  const { user } = useAuth();
  const [showBudgetSelector, setShowBudgetSelector] = useState(false);
  const [isCreatingRelation, setIsCreatingRelation] = useState(false);

  // ... (TODA TU LÓGICA: getRelation, handleBudgetRelation, handleRemoveRelation, etc. se mantiene igual) ...
  // Helper: Encontrar relación por servicio
  const getRelation = (service: RelationConfig['service']) => {
    return item?.relations?.find(rel => rel.relatedService === service);
  };

  // Crear relación con Budget
  const handleBudgetRelation = async (budgetElementId: string) => {
    if (!item || !user) return;
    setIsCreatingRelation(true);
    try {
      const newRelation = await InventoryApiClient.createRelation({
        inventoryItemId: item.id,
        relatedService: 'BUDGET',
        relatedEntityId: budgetElementId,
        createdById: user.id,
      });
      const updatedRelations = [...(item.relations || []), newRelation];
      onRelationsUpdate(updatedRelations); // Notifica al padre
      setShowBudgetSelector(false);
    } catch (error) {
      console.error('Error creating budget relation:', error);
      alert('Error al crear la relación.');
    } finally {
      setIsCreatingRelation(false);
    }
  };

  // Eliminar relación
  const handleRemoveRelation = async (relationId: string, serviceName: string) => {
    if (!item || !item.relations) return;
    const confirmed = confirm(`¿Estás seguro de eliminar la relación con ${serviceName}?`);
    if (!confirmed) return;
    try {
      // await InventoryApiClient.deleteRelation(relationId); // Llama a tu API para eliminar
      const updatedRelations = item.relations.filter(rel => rel.id !== relationId);
      onRelationsUpdate(updatedRelations); // Notifica al padre
    } catch (error) {
      console.error('Error deleting relation:', error);
      alert('Error al eliminar la relación.');
    }
  };

  // Placeholders para Bills y Tasks
  const handleBillRelation = async () => alert('Selector de Bills próximamente');
  const handleTaskRelation = async () => alert('Selector de Tasks próximamente');

  // Determinar la acción correcta para onAction basado en el servicio
  const getOnAction = (config: RelationConfig, relation?: Relation) => {
    if (relation) {
      return () => console.log(`Ver ${config.label}:`, relation.relatedEntityId);
    } else {
      switch (config.service) {
        case 'BUDGET': return () => setShowBudgetSelector(true);
        case 'BILL': return handleBillRelation;
        case 'TASK': return handleTaskRelation;
        default: return () => {};
      }
    }
  };


  return (
    <div>
<h3
  className="inline-block text-xs font-semibold uppercase tracking-wider mb-2 
             bg-clip-text text-transparent"
  style={{
    backgroundImage: colors.gradients.relationBar,
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
  }}
>
  Relaciones
</h3>
        
        {/* 💎 Wrapper para Borde Gradiente 💎 */}
        <div 
            className="rounded-xl p-0.5" // p-0.5 es el "ancho del borde"
            style={{ 
                backgroundImage: colors.gradients.relationBar,
            }}
        >
          {/* Contenedor Interior Blanco */}
          <div 
            className="rounded-[10px] bg-white px-4 py-3" // rounded-[10px] es < que rounded-xl
          >
            {!showBudgetSelector ? (
              <div className="space-y-1"> {/* Contenedor de las filas */}
                {RELATION_CONFIGS.filter(config => config.enabled).map((config) => {
                  const relation = getRelation(config.service);
                  return (
                    <RelationBadge // <-- Este es el nuevo componente de fila
                      key={config.service}
                      icon={config.icon}
                      label={config.label}
                      relationCode={relation?.cachedCode || undefined}
                      relationName={relation?.cachedName || undefined}
                      isLinked={!!relation}
                      onAction={getOnAction(config, relation)}
                      onRemove={relation ? () => handleRemoveRelation(relation.id, config.label) : undefined}
                      // No se necesita 'isLast'
                    />
                  );
                })}
              </div>
            ) : (
              // Renderiza el selector de Budget si está activo
              <BudgetSelector
                projectId={item.projectId as string}
                currentBudgetElementId={getRelation('BUDGET')?.relatedEntityId}
                onSelect={handleBudgetRelation}
                onCancel={() => setShowBudgetSelector(false)}
              />
            )}
          </div>
        </div>
    </div>
  );
}