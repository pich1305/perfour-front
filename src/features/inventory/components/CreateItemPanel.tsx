"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, Star, MoreVertical, ChevronDown, AlertCircle } from 'lucide-react';
import InventoryApiClient from '@/lib/api/inventory.api';
import type { CreateInventoryItemDto } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast';
import { colors } from '@/lib/config/colors';

// ============================================================================
// DATOS: CATEGORÍAS, TIPOS Y UNIDADES
// ============================================================================

const CATEGORIES = [
  'Mampostería',
  'Estructura',
  'Acabados',
  'Instalaciones',
  'Carpintería',
  'Pintura',
  'Pisos y Revestimientos',
  'Techos',
  'Sanitarios',
  'Electricidad',
  'Otro'
] as const;

const CATEGORY_TYPES: Record<string, string[]> = {
  'Mampostería': ['Ladrillo común', 'Ladrillo visto', 'Bloque de hormigón', 'Bloque cerámico', 'Otro'],
  'Estructura': ['Hierro redondo', 'Hierro aletado', 'Malla sima', 'Columnas', 'Vigas', 'Otro'],
  'Acabados': ['Revoque', 'Yeso', 'Enduido', 'Estuco', 'Molduras', 'Otro'],
  'Instalaciones': ['Caños PVC', 'Caños PPR', 'Cables eléctricos', 'Conductos', 'Accesorios', 'Otro'],
  'Carpintería': ['Puertas', 'Ventanas', 'Marcos', 'Madera', 'Herrajes', 'Otro'],
  'Pintura': ['Látex', 'Esmalte', 'Barniz', 'Imprimación', 'Entonador', 'Otro'],
  'Pisos y Revestimientos': ['Cerámicos', 'Porcelanatos', 'Piedras', 'Pisos flotantes', 'Alfombras', 'Otro'],
  'Techos': ['Chapas', 'Tejas', 'Membrana', 'Canaletas', 'Aislantes', 'Otro'],
  'Sanitarios': ['Inodoros', 'Lavatorios', 'Duchas', 'Grifería', 'Accesorios', 'Otro'],
  'Electricidad': ['Cables', 'Caños', 'Llaves', 'Tomas', 'Luminarias', 'Otro']
};

const UNITS = [
  'Unidades',
  'Metros (m)',
  'Metros cuadrados (m²)',
  'Metros cúbicos (m³)',
  'Kilogramos (kg)',
  'Toneladas (ton)',
  'Litros (L)',
  'Bolsas',
  'Cajas',
  'Rollos',
  'Otro'
] as const;

// ============================================================================
// COMPONENTES DE FORMULARIO
// ============================================================================

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hasError?: boolean;
}

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

const FormInput = ({ label, name, value, onChange, placeholder = "", type = "text", required = false, hasError = false }: FormInputProps) => (
  <div>
    <label 
      htmlFor={name} 
      className="block text-xs uppercase tracking-wide mb-2" 
      style={{ color: hasError ? colors.coral.dark : colors.gray[400] }}
    >
      {label} {required && <span style={{ color: hasError ? colors.coral.dark : colors.gray[900] }}>*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-base rounded-lg transition-colors"
      style={{
        backgroundColor: colors.gray[50],
        border: `1px solid ${hasError ? colors.coral.dark : colors.gray[200]}`,
        color: colors.gray[900]
      }}
      onFocus={(e) => {
        e.target.style.borderColor = hasError ? colors.coral.dark : colors.gray[900];
        e.target.style.backgroundColor = '#FFFFFF';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = hasError ? colors.coral.dark : colors.gray[200];
        e.target.style.backgroundColor = colors.gray[50];
      }}
    />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder = "" }: FormTextareaProps) => (
  <div>
    <label 
      htmlFor={name} 
      className="block text-xs uppercase tracking-wide mb-2" 
      style={{ color: colors.gray[400] }}
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full px-3 py-2.5 text-base rounded-lg transition-colors resize-none"
      style={{
        backgroundColor: colors.gray[50],
        border: `1px solid ${colors.gray[200]}`,
        color: colors.gray[900]
      }}
      onFocus={(e) => {
        e.target.style.borderColor = colors.gray[900];
        e.target.style.backgroundColor = '#FFFFFF';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.gray[200];
        e.target.style.backgroundColor = colors.gray[50];
      }}
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, options, placeholder = "", required = false, disabled = false, hasError = false }: FormSelectProps) => (
  <div>
    <label 
      htmlFor={name} 
      className="block text-xs uppercase tracking-wide mb-2" 
      style={{ color: hasError ? colors.coral.dark : colors.gray[400] }}
    >
      {label} {required && <span style={{ color: hasError ? colors.coral.dark : colors.gray[900] }}>*</span>}
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-base rounded-lg transition-colors appearance-none"
        style={{
          backgroundColor: disabled ? colors.gray[100] : colors.gray[50],
          border: `1px solid ${hasError ? colors.coral.dark : colors.gray[200]}`,
          color: value ? colors.gray[900] : colors.gray[400],
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = hasError ? colors.coral.dark : colors.gray[900];
            e.target.style.backgroundColor = '#FFFFFF';
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.target.style.borderColor = hasError ? colors.coral.dark : colors.gray[200];
            e.target.style.backgroundColor = colors.gray[50];
          }
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown 
        size={16} 
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: colors.gray[400] }}
      />
    </div>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface CreateItemPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
  projectId: string;
  createdById: string;
}

export default function CreateItemPanel({ 
  isOpen, 
  onClose, 
  onItemCreated, 
  projectId, 
  createdById 
}: CreateItemPanelProps) {
  const [formData, setFormData] = useState<Omit<CreateInventoryItemDto, 'projectId' | 'createdById'>>({
    name: '',
    unitOfMeasure: '',
    quantityExpected: 0,
    description: '',
    category: '',
    productType: '',
    supplier: '',
    expectedDeliveryDate: null,
    orderedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [customUnit, setCustomUnit] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customType, setCustomType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    unitOfMeasure: false,
    quantityExpected: false
  });

  const availableTypes = formData.category && formData.category !== 'Otro' && CATEGORY_TYPES[formData.category]
    ? CATEGORY_TYPES[formData.category]
    : ['Otro'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
      ...(name === 'category' ? { productType: '' } : {})
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (name === 'name' || name === 'unitOfMeasure' || name === 'quantityExpected') {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
      setShowValidationError(false);
    }

    if (name === 'unitOfMeasure' && value !== 'Otro') setCustomUnit('');
    if (name === 'category' && value !== 'Otro') {
      setCustomCategory('');
      setCustomType('');
    }
    if (name === 'productType' && value !== 'Otro') setCustomType('');
  };

  const handleSubmit = async () => {
    // ============================================
    // VALIDAR CAMPOS REQUERIDOS
    // ============================================
    const errors = {
      name: !formData.name || !formData.name.trim(),
      unitOfMeasure: !formData.unitOfMeasure || (formData.unitOfMeasure === 'Otro' && !customUnit.trim()),
      quantityExpected: !formData.quantityExpected || formData.quantityExpected <= 0
    };

    setFieldErrors(errors);

    // Si hay errores, mostrar mensaje y detener
    if (errors.name || errors.unitOfMeasure || errors.quantityExpected) {
      setShowValidationError(true);
      // Ocultar mensaje después de 4 segundos
      setTimeout(() => setShowValidationError(false), 4000);
      return;
    }

    // Validar campos "Otro"
    if (formData.category === 'Otro' && !customCategory.trim()) {
      toast.error('Especifica la categoría personalizada');
      return;
    }

    if (formData.productType === 'Otro' && !customType.trim()) {
      toast.error('Especifica el tipo de producto personalizado');
      return;
    }

    // ============================================
    // CREAR ITEM
    // ============================================
    const finalUnit = formData.unitOfMeasure === 'Otro' ? customUnit : formData.unitOfMeasure;
    const finalCategory = formData.category === 'Otro' ? customCategory : formData.category;
    const finalType = formData.productType === 'Otro' ? customType : formData.productType;
    
    setIsLoading(true);
    try {
      const payload: CreateInventoryItemDto = {
        ...formData,
        unitOfMeasure: finalUnit,
        category: finalCategory,
        productType: finalType,
        projectId,
        createdById,
        quantityExpected: Number(formData.quantityExpected) || 0,
      };

      await InventoryApiClient.createItem(payload);
      
      
      // ============================================
      // RESETEAR FORMULARIO
      // ============================================
      setFormData({
        name: '',
        unitOfMeasure: '',
        quantityExpected: 0,
        description: '',
        category: '',
        productType: '',
        supplier: '',
        expectedDeliveryDate: null,
        orderedDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      
      setCustomUnit('');
      setCustomCategory('');
      setCustomType('');
      setFieldErrors({ name: false, unitOfMeasure: false, quantityExpected: false });
      setShowValidationError(false);
      
      onItemCreated();
    } catch (error) {
      console.error('Error al crear item:', error);
      toast.error('Error al crear el item. Por favor intenta de nuevo.', {
        duration: 4000,
        style: {
          background: colors.coral.light,
          color: colors.coral.darkest,
          border: `1px solid ${colors.coral.medium}`,
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-full"
          >
            {/* HEADER */}
            <div
              className="flex items-center px-4 py-2 border-b rounded-t-2xl flex-shrink-0"
              style={{
                backgroundColor: colors.gray[50],
                borderColor: colors.gray[200]
              }}
            >
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/60 transition-colors"
              >
                <X size={20} style={{ color: colors.gray[700] }} />
              </button>
              <button className="p-1 rounded-full hover:bg-white/60 transition-colors ml-2">
                <Expand size={18} style={{ color: colors.gray[700] }} />
              </button>
              <h2
                className="mx-auto text-sm font-semibold uppercase tracking-wide"
                style={{ color: colors.gray[500] }}
              >
                Nuevo Item
              </h2>
              <button className="p-1 rounded-full hover:bg-white/60 transition-colors">
                <Star size={20} style={{ color: colors.gray[700] }} />
              </button>
              <button className="p-1 rounded-full hover:bg-white/60 transition-colors ml-2">
                <MoreVertical size={20} style={{ color: colors.gray[700] }} />
              </button>
            </div>

            {/* FORMULARIO */}
            <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Sección 1: Información básica */}
              <div className="space-y-4">
                <FormInput 
                  label="Nombre" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Ej: Ladrillo Visto - Tipo C"
                  required
                  hasError={fieldErrors.name}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormSelect
                      label="Unidad"
                      name="unitOfMeasure"
                      value={formData.unitOfMeasure}
                      onChange={handleChange}
                      options={UNITS}
                      placeholder="Selecciona unidad"
                      required
                      hasError={fieldErrors.unitOfMeasure}
                    />
                    {formData.unitOfMeasure === 'Otro' && (
                      <input
                        type="text"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="Especifica la unidad"
                        className="w-full px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: colors.gray[50],
                          border: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[900]
                        }}
                      />
                    )}
                  </div>

                  <FormInput 
                    label="Cantidad" 
                    name="quantityExpected" 
                    value={formData.quantityExpected} 
                    onChange={handleChange} 
                    type="number"
                    placeholder="0"
                    required
                    hasError={fieldErrors.quantityExpected}
                  />
                </div>

                <FormTextarea 
                  label="Descripción" 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                  placeholder="Detalles del producto..."
                />
              </div>

              <div className="h-px" style={{ backgroundColor: colors.gray[200] }} />

              {/* Sección 2: Clasificación */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormSelect
                      label="Categoría"
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      options={CATEGORIES}
                      placeholder="Selecciona categoría"
                    />
                    {formData.category === 'Otro' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Especifica la categoría"
                        className="w-full px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: colors.gray[50],
                          border: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[900]
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormSelect
                      label="Tipo"
                      name="productType"
                      value={formData.productType || ''}
                      onChange={handleChange}
                      options={availableTypes}
                      placeholder="Selecciona tipo"
                      disabled={!formData.category}
                    />
                    {formData.productType === 'Otro' && (
                      <input
                        type="text"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Especifica el tipo"
                        className="w-full px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: colors.gray[50],
                          border: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[900]
                        }}
                      />
                    )}
                  </div>
                </div>

                <FormInput 
                  label="Proveedor" 
                  name="supplier" 
                  value={formData.supplier || ''} 
                  onChange={handleChange} 
                  placeholder="Cerámica Paraguaya S.A."
                />
              </div>

              <div className="h-px" style={{ backgroundColor: colors.gray[200] }} />

              {/* Sección 3: Fechas */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput 
                    label="Fecha de Pedido" 
                    name="orderedDate" 
                    value={formData.orderedDate || ''} 
                    onChange={handleChange} 
                    type="date"
                  />
                  <FormInput 
                    label="Entrega Prevista" 
                    name="expectedDeliveryDate" 
                    value={formData.expectedDeliveryDate || ''} 
                    onChange={handleChange} 
                    type="date"
                  />
                </div>

                <FormTextarea 
                  label="Notas" 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  placeholder="Instrucciones especiales..."
                />
              </div>
            </div>

            {/* FOOTER */}
            <div 
              className="px-6 py-4 border-t flex-shrink-0 space-y-3"
              style={{ borderColor: colors.gray[200] }}
            >
              {/* Mensaje de validación dinámico */}
              <AnimatePresence>
                {showValidationError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: colors.coral.light,
                      border: `1px solid ${colors.coral.medium}`
                    }}
                  >
                    <AlertCircle size={18} style={{ color: colors.coral.dark }} />
                    <span className="text-sm font-medium" style={{ color: colors.coral.darkest }}>
                      Debes completar los campos requeridos
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón crear */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.gray[900],
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = colors.gray[700])}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = colors.gray[900])}
              >
                {isLoading ? "Guardando..." : "Crear Item"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
