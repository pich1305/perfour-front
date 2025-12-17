// components/budget/BudgetElementTree.tsx
"use client";

import { useState } from 'react';
import { ChevronRight, ChevronDown, Package, FolderOpen, Folder } from 'lucide-react';
import { BudgetElementRelatedNode } from '@/lib/types/budget-related';
import { colors } from '@/lib/config/colors';

interface BudgetElementTreeProps {
  nodes: BudgetElementRelatedNode[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

export default function BudgetElementTree({ 
  nodes, 
  selectedItemId, 
  onSelectItem 
}: BudgetElementTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          level={0}
          selectedItemId={selectedItemId}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: BudgetElementRelatedNode;
  level: number;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

function TreeNode({ node, level, selectedItemId, onSelectItem }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isItem = node.elementLevel === 'ITEM';
  const isSelected = selectedItemId === node.id;

  // Solo los ITEMS son seleccionables
  const isSelectable = isItem;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    if (isSelectable) {
      onSelectItem(node.id);
    }
  };

  // Iconos según el nivel
  const getIcon = () => {
    if (node.elementLevel === 'CATEGORY') {
      return isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />;
    }
    if (node.elementLevel === 'SUBCATEGORY') {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    return <Package size={16} />;
  };

  // Estilos según el nivel
  const getStyles = () => {
    const baseStyles = {
      paddingLeft: `${level * 24 + 8}px`,
      cursor: hasChildren || isSelectable ? 'pointer' : 'default',
    };

    if (isSelected) {
      return {
        ...baseStyles,
        backgroundColor: colors.blue.lightest,
        borderLeft: `3px solid ${colors.blue.primary}`,
      };
    }

    return baseStyles;
  };

  // Peso de fuente según nivel
  const getFontWeight = () => {
    if (node.elementLevel === 'CATEGORY') return 'font-bold';
    if (node.elementLevel === 'SUBCATEGORY') return 'font-semibold';
    return 'font-medium';
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg transition-colors
          ${isSelectable ? 'hover:bg-gray-50' : ''}
          ${hasChildren && !isSelectable ? 'hover:bg-gray-50' : ''}
        `}
        style={getStyles()}
      >
        {/* Chevron para expandir/colapsar (solo si tiene hijos) */}
        {hasChildren && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown size={16} style={{ color: colors.gray[500] }} />
            ) : (
              <ChevronRight size={16} style={{ color: colors.gray[500] }} />
            )}
          </div>
        )}

        {/* Icono del elemento */}
        <div 
          className="flex-shrink-0" 
          style={{ color: isSelected ? colors.blue.primary : colors.gray[600] }}
        >
          {getIcon()}
        </div>

        {/* Nombre del elemento */}
        <span 
          className={`flex-1 text-sm ${getFontWeight()}`}
          style={{ 
            color: isSelected ? colors.blue.primary : colors.gray[800] 
          }}
        >
          {node.name}
        </span>

        {/* Badge de tipo (solo para ITEMS) */}
        {isItem && (
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: node.type === 'PRODUCT' ? colors.mint.lightest : colors.lavender.lightest,
              color: node.type === 'PRODUCT' ? colors.mint.dark : colors.lavender.dark,
            }}
          >
            {node.type === 'PRODUCT' ? 'Producto' : 'Servicio'}
          </span>
        )}

        {/* Indicador de selección */}
        {isSelected && (
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.blue.primary }}
          />
        )}
      </div>

      {/* Hijos (recursivo) */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      )}
    </>
  );
}