"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, Star, MoreVertical } from 'lucide-react';
import { BudgetApiClient } from '@/lib/api/budget.api';
import type { Budget, BudgetComment } from '@/lib/types';

interface BudgetViewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
}

// Componente para mostrar un campo de detalle
const DetailItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-gray-900">{children}</dd>
  </div>
);

// Componente para las "píldoras" de estado/tipo
const StatusPill = ({ text, colorClass }: { text: string, colorClass: string }) => {
  if (!text || text === 'null') return <span className="text-gray-500">-</span>; // Manejo para valores nulos/vacios
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colorClass}`}>
      {text}
    </span>
  );
};


export default function BudgetViewPanel({ isOpen, onClose, budgetId }: BudgetViewPanelProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments'); // Nuevo estado para las pestañas

  useEffect(() => {
    if (isOpen && !budget) {
      const fetchBudgetDetails = async () => {
        setIsLoading(true);
        try {
          const data = await BudgetApiClient.getBudgetById(budgetId);
          setBudget(data);
        } catch (error) {
          console.error("Error al cargar los detalles del presupuesto:", error);
          // onClose(); // Cierra si hay error, o muestra un mensaje de error en UI
        } finally {
          setIsLoading(false);
        }
      };
      fetchBudgetDetails();
    }
  }, [isOpen, budgetId, budget, onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reinicia el estado cuando se cierra el panel para recargar la próxima vez
      setBudget(null);
      setIsLoading(true);
      setActiveTab('comments'); // Vuelve a la pestaña de comentarios por defecto
    }
  }, [isOpen]);

  // Helper para determinar las clases de color de las píldoras (puedes expandirlo)
  const getPillColor = (type: string | undefined): { text: string, bg: string } => {
    switch (type) {
      case 'CLIENT': return { text: 'text-green-800', bg: 'bg-green-100' };
      case 'PROVIDER': return { text: 'text-orange-800', bg: 'bg-orange-100' };
      case 'INTERNAL': return { text: 'text-red-800', bg: 'bg-red-100' };
      case 'GENERAL': return { text: 'text-blue-800', bg: 'bg-blue-100' };
      case 'OTHER': return { text: 'text-gray-800', bg: 'bg-gray-100' };
      case 'DRAFT': return { text: 'text-gray-800', bg: 'bg-gray-100' };
      case 'APPROVED': return { text: 'text-purple-800', bg: 'bg-purple-100' };
      case 'UNDER_REVIEW': return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
      case 'USD': return { text: 'text-gray-800', bg: 'bg-gray-100' };
      case 'PYG': return { text: 'text-gray-800', bg: 'bg-gray-100' };
      default: return { text: 'text-gray-800', bg: 'bg-gray-100' };
    }
  };
  
  // Función para formatear el total (asumiendo que viene como string "0.00")
  const formatTotalAmount = (amount: string | undefined): string => {
    if (!amount) return '$ 0.00';
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '$ 0.00';
      return `$ ${num.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (e) {
      return '$ 0.00';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end p-4"> {/* Añadimos padding al inset */}
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Panel Lateral */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg bg-gray-50 rounded-2xl shadow-xl flex flex-col max-h-full" /* Añadimos rounded-2xl */
          >
            {/* Header del Panel */}
            <div className="flex items-center p-4 border-b bg-white rounded-t-2xl flex-shrink-0">
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
                <button className="p-1 rounded-full hover:bg-gray-100 ml-2"><Expand size={18}/></button>
                <h2 className="mx-auto text-sm font-semibold text-gray-700">Budget Info</h2>
                <button className="p-1 rounded-full hover:bg-gray-100"><Star size={20}/></button>
                <button className="p-1 rounded-full hover:bg-gray-100 ml-2"><MoreVertical size={20}/></button>
            </div>
            
            {/* Contenido (con scroll) */}
            <div className="flex-grow overflow-y-auto p-6 bg-white rounded-b-2xl">
              {isLoading ? (
                <div className="text-center py-10 text-gray-500">Cargando detalles del presupuesto...</div>
              ) : (
                <div className="space-y-8">
                  <h1 className="text-2xl font-bold text-gray-900">{budget?.name || 'Presupuesto sin Nombre'}</h1>

                  {/* Sección de Detalles en 2 columnas */}
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <DetailItem label="Budget Type">
                      {budget?.budgetType && (
                        <StatusPill text={budget.budgetType} colorClass={`${getPillColor(budget.budgetType).bg} ${getPillColor(budget.budgetType).text}`} />
                      )}
                    </DetailItem>
                    <DetailItem label="Created By">Enzo Benza</DetailItem> {/* Esto debería venir del backend */}
                    
                    <DetailItem label="Currency">
                      {budget?.currency && (
                        <StatusPill text={budget.currency} colorClass={`${getPillColor(budget.currency).bg} ${getPillColor(budget.currency).text}`} />
                      )}
                    </DetailItem>
                    <DetailItem label="Created At">
                      {budget?.createdAt ? new Date(budget.createdAt).toLocaleString('es-PY') : '-'}
                    </DetailItem>
                    
                    <DetailItem label="Status">
                      {budget?.status && (
                        <StatusPill text={budget.status} colorClass={`${getPillColor(budget.status).bg} ${getPillColor(budget.status).text}`} />
                      )}
                    </DetailItem>
                    <DetailItem label="Updated At">
                      {budget?.updatedAt ? new Date(budget.updatedAt).toLocaleString('es-PY') : '-'}
                    </DetailItem>

                    <DetailItem label="Total Amount">
                      {formatTotalAmount(budget?.totalBudgetAmount.toString())}
                    </DetailItem>
                    <DetailItem label="Approved by">
                      {/* Aquí deberías buscar el nombre del usuario por approvedById */}
                      {budget?.approvedById ? budget.approvedById : '-'} 
                    </DetailItem>
                    <DetailItem label="Approved At">
                      {budget?.approvedAt ? new Date(budget.approvedAt).toLocaleString('es-PY') : '-'}
                    </DetailItem>
                     <DetailItem label="Approved Signature">
                        {budget?.approvedSignatureUrl ? <a href={budget.approvedSignatureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Firma</a> : '-'}
                    </DetailItem>
                  </dl>

                  {/* Descripción */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-sm text-gray-700">{budget?.description || 'Sin descripción.'}</p>
                  </div>
                  
                  {/* --- SECCIÓN DE PESTAÑAS: COMENTARIOS / ACTIVIDAD --- */}
                  <div className="border-t pt-6">
                    <div className="flex space-x-4 mb-4 border-b pb-2">
                      <button 
                        onClick={() => setActiveTab('comments')}
                        className={`text-sm font-medium pb-2 ${activeTab === 'comments' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Comments
                      </button>
                      <button 
                        onClick={() => setActiveTab('activity')}
                        className={`text-sm font-medium pb-2 ${activeTab === 'activity' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        All Activity
                      </button>
                    </div>

                    {/* Contenido de la pestaña activa */}
                    {activeTab === 'comments' && (
                      <div className="space-y-4">
                        {budget?.comments && budget.comments.length > 0 ? (
                            budget.comments.map((comment: BudgetComment) => (
                                <div key={comment.id} className="flex items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex-shrink-0 flex items-center justify-center text-xs font-bold mr-3">YT</div>
                                    <div>
                                        <p className="text-sm">
                                            <span className="font-semibold text-gray-900">Yuki Tsunoda</span> {/* Esto debería ser dinámico */}
                                            <span className="text-gray-500 ml-2 text-xs">{new Date(comment.createdAt).toLocaleString('es-PY')}</span>
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">{comment.commentText}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No hay comentarios para este presupuesto.</p>
                        )}
                        {/* Input para nuevo comentario */}
                        <div className="mt-6 flex items-start">
                          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div> {/* Icono de usuario */}
                          <div className="w-full">
                            <textarea rows={2} placeholder="Add a comment" className="w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                            <div className="text-right mt-2">
                              <button className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">Comment</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'activity' && (
                      <div className="space-y-4">
                        {/* Actividad hardcodeada por ahora */}
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-yellow-200 text-yellow-800 flex-shrink-0 flex items-center justify-center text-xs font-bold mr-3">MV</div>
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold text-gray-900">Budget Created</span>
                              <span className="text-gray-500 ml-2 text-xs">2 hours ago</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">By Max Verstappen The One.</p>
                          </div>
                        </div>
                        {/* Puedes añadir más actividades aquí */}
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex-shrink-0 flex items-center justify-center text-xs font-bold mr-3">EB</div>
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold text-gray-900">Description Updated</span>
                              <span className="text-gray-500 ml-2 text-xs">1 hour ago</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">Description changed from "Old description" to "New description".</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}