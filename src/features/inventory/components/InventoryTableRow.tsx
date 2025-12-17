"use client";

import type { InventoryItem, InventoryStatus } from '@/lib/types';
import { Star, ArrowUpRightSquare, Copy, Trash2, Clock, PackageCheck, PackageOpen, XCircle, AlertCircle } from 'lucide-react';
import ActionMenu, { MenuItem } from '@/components/ui/Popup/ActionMenu';
import { RefObject, useRef, useState } from 'react';
import DeleteConfirmationPopover from '@/components/ui/Popup/DeleteConfirmationPopover';

const StatusBadge = ({ status }: { status: InventoryStatus }) => {
    const config = {
        COMPLETED: { text: 'Completed', icon: PackageCheck, className: 'bg-green-100 text-green-700' },
        PARTIAL: { text: 'Partial', icon: PackageOpen, className: 'bg-indigo-100 text-indigo-700' },
        PENDING: { text: 'Pending', icon: Clock, className: 'bg-blue-100 text-blue-700' },
        OVERDELIVERED: { text: 'Overdelivered', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
        CANCELLED: { text: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };
    const current = config[status] || { text: status, icon: AlertCircle, className: 'bg-gray-100 text-gray-700' };
    const Icon = current.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${current.className}`}>
            <Icon size={14} />
            {current.text}
        </span>
    );
};

const formatNumber = (numericString: string) => {
    const number = parseFloat(numericString);
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    });
};

interface InventoryTableRowProps {
    item: InventoryItem;
    onViewItem: (itemId: string) => void;
    onDeleteItem: (item: InventoryItem) => void;
    onDuplicateItem: (itemId: string) => void;
}

export default function InventoryTableRow({ item, onViewItem, onDeleteItem, onDuplicateItem }: InventoryTableRowProps) {
    const pending = parseFloat(item.quantityExpected) - parseFloat(item.quantityReceived);
    const isOverdue = item.expectedDeliveryDate && new Date(item.expectedDeliveryDate) < new Date() && item.status !== 'COMPLETED';
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const actionsContainerRef = useRef<HTMLDivElement>(null);

    const menuItems: MenuItem[] = [
        {
            label: 'Open item details',
            icon: ArrowUpRightSquare,
            onClick: () => onViewItem(item.id),
        },
        {
            label: 'Duplicate item',
            icon: Copy,
            onClick: () => onDuplicateItem(item.id),
        },
        {
            label: 'Delete item',
            icon: Trash2,
            onClick: (e) => {
                e?.stopPropagation(); // Prevenir que se abra el item
                setIsConfirmOpen(true);
            },
            className: 'text-red-600 hover:bg-red-50',
        },
    ];

    const handleConfirmDelete = () => {
        onDeleteItem(item);
        setIsConfirmOpen(false);
    };

    return (
        <>
            <tr
                className="hover:bg-gray-50 divide-x divide-gray-100 cursor-pointer"
                onClick={() => onViewItem(item.id)}
            >
                <td className="p-3 font-bold text-gray-800">{item.name}</td>
                <td className="p-3 text-gray-600 text-center">{item.unitOfMeasure}</td>
                <td className="p-3 font-mono text-gray-700 text-right">{formatNumber(item.quantityExpected)}</td>
                <td className="p-3 font-mono text-gray-700 text-right">{formatNumber(item.quantityReceived)}</td>
                <td className={`p-3 font-mono text-right font-bold ${pending > 0 ? 'text-red-400' : 'text-gray-700'}`}>
                    {formatNumber(String(pending))}
                </td>
                <td className="p-3 text-center"><StatusBadge status={item.status} /></td>
                <td className="p-3 text-gray-600 text-center">
                    <div className="flex items-center justify-center gap-2">
                        {item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                </td>
                <td className="p-3 text-gray-600">{item.supplier}</td>
                <td className="p-3">
                    <div 
                        ref={actionsContainerRef}
                        className="flex justify-center items-center gap-2 text-gray-500"
                    >
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                /* lógica de favorito */ 
                            }} 
                            className="p-1 rounded-md hover:bg-gray-100"
                        >
                            <Star size={16} />
                        </button>
                        <ActionMenu items={menuItems} />
                    </div>
                </td>
            </tr>

            {/* Popover de confirmación */}
            <DeleteConfirmationPopover
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                triggerRef={actionsContainerRef as RefObject<HTMLElement>}
                title="¿Eliminar item?"
                description={`El item "${item.name}" será eliminado permanentemente.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />
        </>
    );
}
// "use client";

// import type { InventoryItem, InventoryStatus } from '@/lib/types';
// import { Star, ArrowUpRightSquare, Copy, Trash2, Clock, PackageCheck, PackageOpen, XCircle, AlertCircle } from 'lucide-react';
// import ActionMenu, { MenuItem } from '@/components/ui/Popup/ActionMenu';

// // --- Componentes y funciones de ayuda (movidos aquí para ser autónomos) ---

// const StatusBadge = ({ status }: { status: InventoryStatus }) => {
//   const config = {
//     COMPLETED: { text: 'Completed', icon: PackageCheck, className: 'bg-green-100 text-green-700' },
//     PARTIAL: { text: 'Partial', icon: PackageOpen, className: 'bg-indigo-100 text-indigo-700' },
//     PENDING: { text: 'Pending', icon: Clock, className: 'bg-blue-100 text-blue-700' },
//     OVERDELIVERED: { text: 'Overdelivered', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
//     CANCELLED: { text: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-700' },
//   };
//   const current = config[status] || { text: status, icon: AlertCircle, className: 'bg-gray-100 text-gray-700' };
//   const Icon = current.icon;

//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${current.className}`}>
//       <Icon size={14} />
//       {current.text}
//     </span>
//   );
// };

// const formatNumber = (numericString: string) => {
//   const number = parseFloat(numericString);
//   if (isNaN(number)) return '0';
//   return number.toLocaleString('es-ES', {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 3,
//   });
// };

// // --- Props del componente de fila ---
// interface InventoryTableRowProps {
//   item: InventoryItem;
//   onViewItem: (itemId: string) => void;
//   onDeleteItem: (itemId: string) => void;
//   onDuplicateItem: (itemId: string) => void;
// }

// export default function InventoryTableRow({ item, onViewItem, onDeleteItem, onDuplicateItem }: InventoryTableRowProps) {
//   const pending = parseFloat(item.quantityExpected) - parseFloat(item.quantityReceived);
//   const isOverdue = item.expectedDeliveryDate && new Date(item.expectedDeliveryDate) < new Date() && item.status !== 'COMPLETED';

//   // Define los items del menú para esta fila específica
//   const menuItems: MenuItem[] = [
//     {
//       label: 'Open item details',
//       icon: ArrowUpRightSquare,
//       onClick: () => onViewItem(item.id),
//     },
//     {
//       label: 'Duplicate item',
//       icon: Copy,
//       onClick: () => onDuplicateItem(item.id),
//     },
//     {
//       label: 'Delete item',
//       icon: Trash2,
//       onClick: () => onDeleteItem(item.id),
//       className: 'text-red-600',
//     },
//   ];

//   return (
//     <tr 
//       className="hover:bg-gray-50 divide-x divide-gray-100 cursor-pointer" 
//       onClick={() => onViewItem(item.id)}
//     >
//       <td className="p-3 font-bold text-gray-800">{item.name}</td>
//       <td className="p-3 text-gray-600 text-center">{item.unitOfMeasure}</td> 
//       <td className="p-3 font-mono text-gray-700 text-right">{formatNumber(item.quantityExpected)}</td> 
//       <td className="p-3 font-mono text-gray-700 text-right">{formatNumber(item.quantityReceived)}</td> 
//       <td className={`p-3 font-mono text-right font-bold ${pending > 0 ? 'text-red-400' : 'text-gray-700'}`}>
//         {formatNumber(String(pending))}
//       </td>
//       <td className="p-3 text-center"><StatusBadge status={item.status} /></td> 
//       <td className="p-3 text-gray-600 text-center"> 
//         <div className="flex items-center justify-center gap-2">
//             {item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
//         </div>
//       </td>
//       <td className="p-3 text-gray-600">{item.supplier}</td>
//       <td className="p-3">
//         <div className="flex justify-center items-center gap-2 text-gray-500">
//           <button onClick={(e) => { e.stopPropagation(); /* lógica de favorito */ }} className="p-1 rounded-md hover:bg-gray-100">
//             <Star size={16} />
//           </button>
//           <ActionMenu items={menuItems} />
//         </div>
//       </td>
//     </tr>
//   );
// }