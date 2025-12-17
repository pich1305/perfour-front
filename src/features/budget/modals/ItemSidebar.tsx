import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ItemSidebarProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
  formatCurrency?: (amount: number) => string;
}

const sidebarVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const editableFields = [
  'name',
  'description',
  'unitOfMeasure',
  'quantity',
  'unitPrice',
];

const displayOrder = [
  'name',
  'description',
  'unitOfMeasure',
  'quantity',
  'unitPrice',
  'total_amount',
];

const fieldLabels: Record<string, string> = {
  name: 'Nombre',
  description: 'Descripción',
  unitOfMeasure: 'Unidad',
  quantity: 'Cantidad',
  unitPrice: 'Precio Unitario',
  totalAmount: 'Total',
};

const ItemSidebar: React.FC<ItemSidebarProps> = ({ item, isOpen, onClose, onSave, formatCurrency }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [editedItem, setEditedItem] = useState<any>(item);

  // Sincronizar el estado local cuando cambia el item
  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  // Cerrar al hacer click fuera y guardar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (editedItem && JSON.stringify(editedItem) !== JSON.stringify(item)) {
          onSave(editedItem);
        }
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, onSave, editedItem, item]);

  // Guardar y cerrar al hacer click en la X
  const handleClose = () => {
    if (editedItem && JSON.stringify(editedItem) !== JSON.stringify(item)) {
      onSave(editedItem);
    }
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setEditedItem((prev: any) => {
      const updatedItem = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? Number(value) : Number(updatedItem.quantity || 0);
        const unitPrice = field === 'unitPrice' ? Number(value) : Number(updatedItem.unitPrice || 0);
        updatedItem.totalAmount = quantity * unitPrice;
      }
      return updatedItem;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            className="relative w-full max-w-md h-full bg-white shadow-xl p-6 overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Detalle del Item</h2>
            {editedItem ? (
              <div className="space-y-2">
                {[
                  ...displayOrder,
                  ...Object.keys(editedItem).filter(
                    (k) => !displayOrder.includes(k)
                  ),
                ].map((key) => {
                  const value = editedItem[key];
                  if (value === undefined) return null;

                  return (
                    <div key={key} className="flex flex-col border-b pb-2 mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {fieldLabels[key] || key}
                      </span>
                      {key === 'totalAmount' ? (
                        <span className="text-sm text-gray-800 break-all mt-1 font-bold">
                          {formatCurrency
                            ? formatCurrency(Number(value) || 0)
                            : String(value)}
                        </span>
                      ) : editableFields.includes(key) ? (
                        key === 'description' ? (
                          <textarea
                            className="text-sm text-gray-800 border rounded px-2 py-1 mt-1 resize-none"
                            value={
                              typeof value === 'string' ||
                              typeof value === 'number'
                                ? value
                                : ''
                            }
                            onChange={(e) => handleChange(key, e.target.value)}
                            rows={2}
                          />
                        ) : key === 'quantity' || key === 'unitPrice' ? (
                          <input
                            type="number"
                            className="text-sm text-gray-800 border rounded px-2 py-1 mt-1"
                            value={
                              typeof value === 'string' ||
                              typeof value === 'number'
                                ? value
                                : ''
                            }
                            onChange={(e) =>
                              handleChange(
                                key,
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            min={0}
                            step={key === 'quantity' ? '1' : '0.01'}
                          />
                        ) : (
                          <input
                            type="text"
                            className="text-sm text-gray-800 border rounded px-2 py-1 mt-1"
                            value={
                              typeof value === 'string' ||
                              typeof value === 'number'
                                ? value
                                : ''
                            }
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                        )
                      ) : (
                        <span className="text-sm text-gray-800 break-all mt-1">
                          {String(value)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500">No hay datos del item.</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemSidebar; 