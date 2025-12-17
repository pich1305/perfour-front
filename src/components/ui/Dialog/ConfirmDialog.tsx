// components/ui/ConfirmDialog.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import { colors } from '@/lib/config/colors';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  
  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: colors.coral.dark,
      iconBg: colors.coral.light,
      confirmBg: colors.coral.dark,
      confirmHover: colors.coral.darkest,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: colors.peach.dark,
      iconBg: colors.peach.light,
      confirmBg: colors.peach.dark,
      confirmHover: colors.peach.darkest,
    },
    info: {
      icon: Info,
      iconColor: colors.blue.primary,
      iconBg: colors.blue.lightest,
      confirmBg: colors.blue.primary,
      confirmHover: colors.blue.medium,
    },
    success: {
      icon: CheckCircle,
      iconColor: colors.mint.dark,
      iconBg: colors.mint.lighter,
      confirmBg: colors.mint.dark,
      confirmHover: colors.mint.darkest,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.iconBg }}
              >
                <IconComponent size={32} style={{ color: config.iconColor }} />
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold text-center mb-2"
              style={{ color: colors.blue.primary }}
            >
              {title}
            </h2>

            {/* Description */}
            {description && (
              <p
                className="text-sm text-center mb-6"
                style={{ color: colors.gray[500] }}
              >
                {description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 border-2 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: colors.gray[300],
                  color: colors.gray[700],
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {cancelLabel}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 px-4 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: config.confirmBg,
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = config.confirmHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = config.confirmBg;
                }}
              >
                {isLoading ? 'Procesando...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}