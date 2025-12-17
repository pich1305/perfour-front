import React, { useState, useRef, useEffect } from 'react';

interface QuickTaskInputProps {
  parentId: string;
  onCreateTask: (parentId: string, taskName: string) => Promise<void>;
  placeholder?: string;
  depth?: number;
  variant?: 'list' | 'gantt' | 'standalone';
}

export function QuickTaskInput({ 
  parentId, 
  onCreateTask, 
  placeholder = "Escribe el nombre de la nueva tarea",
  depth = 0,
  variant = 'list'
}: QuickTaskInputProps) {
  const [taskName, setTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = taskName.trim();
    
    if (!trimmedName || isCreating) return;
    
    try {
      setIsCreating(true);
      await onCreateTask(parentId, trimmedName);
      setTaskName(''); // Limpiar el input después de crear
    } catch (error) {
      console.error('Error al crear la tarea:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleBlur = () => {
    // Solo limpiar si no hay texto escrito
    if (!taskName.trim()) {
      setTaskName('');
    }
  };

  // Renderizado para variante standalone (sin tabla)
  if (variant === 'standalone') {
    return (
      <div className="flex items-center" style={{ paddingLeft: depth * 32 }}>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={isCreating}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ width: '150px' }}
          />
        </form>
      </div>
    );
  }

  // Renderizado para variante gantt (5 columnas)
  if (variant === 'gantt') {
    return (
      <tr className="border-b last:border-b-0" style={{ height: '40px' }}>
        <td className="py-1 px-2 border-l border-gray-200">
          <div className="flex items-center" style={{ paddingLeft: depth * 32 }}>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={isCreating}
                className="px-1 py-0 text-[10px] border-0 bg-transparent focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-400"
                style={{ width: '150px' }}
              />
            </form>
          </div>
        </td>
        <td className="py-1 px-2 text-center" />
        <td className="py-1 px-2 text-center" />
        <td className="py-1 px-2 text-center" />
        <td className="py-1 px-2 text-center" />
      </tr>
    );
  }

  // Renderizado para variante list (10 columnas) - comportamiento por defecto
  return (
    <tr className="border-b last:border-b-0" style={{ height: '40px' }}>
      <td className="py-1 px-2 border-l border-gray-200">
        <div className="flex items-center" style={{ paddingLeft: depth * 32 }}>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={isCreating}
              className="px-1 py-0 text-[10px] border-0 bg-transparent focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-400"
              style={{ width: '150px' }}
            />
          </form>
        </div>
      </td>
      <td className="py-1 px-2 text-center" />
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap text-center" />
      <td className="py-1 px-2 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap text-center" />
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap text-center" />
    </tr>
  );
}
