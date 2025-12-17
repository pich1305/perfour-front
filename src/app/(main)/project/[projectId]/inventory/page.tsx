"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import InventoryApiClient from '@/lib/api/inventory.api';
import InventoryTable from '@/features/inventory/components/InventoryTable';
import type { InventoryItem } from '@/lib/types';
import { useDebounce } from 'use-debounce'; // Para optimizar la búsqueda
import { useRouter, useParams } from 'next/navigation';
import InventoryItemViewPanel from '@/features/inventory/components/InventoryItemViewPanel';
import toast from 'react-hot-toast';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import CreateItemPanel from '@/features/inventory/components/CreateItemPanel';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';

// Instala use-debounce: npm install use-debounce

// export default function InventoryPage({ params }: { params: { projectId: string } }) {
export default function InventoryPage() {
  const { confirm } = useConfirmDialog(); // <-- 2. Obtén la función 'confirm'
  const { user } = useAuth(); // <-- 3. Obtén el usuario
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, take: 10, totalItems: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Espera 500ms antes de buscar

  // --- Lógica para obtener datos ---
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    const response = await InventoryApiClient.getProjectInventory({
      projectId: projectId,
      page: pagination.page,
      take: pagination.take,
      name: debouncedSearchTerm,
    });
    setItems(response.items);
    setPagination(prev => ({ ...prev, totalItems: response.itemCount }));
    setIsLoading(false);
  }, [params.projectId, pagination.page, pagination.take, debouncedSearchTerm]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      await InventoryApiClient.deleteItem(item.id);
      toast.success(`Item "${item.name}" eliminado.`);
      setItems(currentItems => currentItems.filter(i => i.id !== item.id));
    } catch (error) {
      toast.error("No se pudo eliminar el item.");
      // Relanzamos el error para que el popover local pueda reaccionar
      throw error;
    }
  };

  const handleDuplicateItem = async (itemId: string) => {
    try {
      // Asume que este método existe en tu API client
      // await InventoryApiClient.cloneItem(itemId); 
      toast.success("Item duplicado (función pendiente en API).");
      // await fetchInventory(); // Vuelve a cargar todo para ver el item duplicado
    } catch (error) {
      toast.error("No se pudo duplicar el item.");
    }
  }
  const handleItemCreated = () => {
    setIsCreatePanelOpen(false);
    fetchInventory(); // Refresca la lista
  };

  return (
    <div className="px-6 py-2 space-y-2">
      {/* Header con búsqueda y filtros */}
      <div className="flex justify-between items-center">

        <div className="flex items-center gap-4"> {/* Añadimos 'gap-4' para separar el título del buscador */}

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800">Inventario de Obra</h2>

          {/* Buscador y Filtro */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 py-2 px-3 border rounded-lg text-sm font-medium hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* --- 2. EL BOTÓN AHORA ES EL ÚNICO ELEMENTO A LA DERECHA --- */}
        <button 
          onClick={() => setIsCreatePanelOpen(true)}
          className="inline-flex items-center gap-2 py-2 px-3.5 bg-violet-50 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-100"
        >
          <Plus size={16} />
          Añadir Item
        </button>
      </div>

      {/* Tabla de Inventario */}
      <InventoryTable
        items={items}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        onViewItem={(itemId) => setViewingItemId(itemId)}
        onDeleteItem={handleDeleteItem}
        onDuplicateItem={handleDuplicateItem}
      />
      <InventoryItemViewPanel
        isOpen={!!viewingItemId}
        itemId={viewingItemId!} // El '!' indica que estamos seguros de que no será null si isOpen es true
        onClose={() => setViewingItemId(null)}
      />
      <CreateItemPanel
        isOpen={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
        onItemCreated={handleItemCreated}
        projectId={projectId}
        createdById={user?.id || ''} // Pasa el ID del usuario
      />
    </div>
  );
}