// lib/config/colors.ts
/**
 * Sistema de diseño de colores - Perfour App
 * Basado en paleta Pantone oficial
 */

export const perfourColors = {
    // ============================================
    // COLORES PRINCIPALES
    // ============================================
    blue: {
      primary: '#00356B',    // Pantone 540C - Azul profundo
      medium: '#00427F',
      light: '#7AB6D6',
      lightest: '#A8D8EA',   // Pantone 290C
      pale: '#91C5ED',
    },
  
    lavender: {
      darkest: '#75829F',
      dark: '#8869AD',
      medium: '#AF87C9',
      light: '#C1AEDE',
      lightest: '#D6C5E5',   // Pantone 2645C
      pale: '#E6DAF3',
      palest: '#F2ECF8',
    },
  
    mint: {
      darkest: '#529256',
      dark: '#66AF69',
      medium: '#79BC7C',
      light: '#8CC98F',
      lighter: '#B2E3B5',    // Pantone 2175C
      lightest: '#C6EFC9',
    },
  
    coral: {
      darkest: '#BD5751',
      dark: '#C86761',
      medium: '#DE8781',
      light: '#F4A7A1',      // Pantone 1625C
      lightest: '#F7BBB5',
    },
  
    peach: {
      darkest: '#B6754F',
      dark: '#C6855F',
      medium: '#DD956F',
      light: '#EAB5AF',
      lighter: '#F7C59F',    // Pantone 1485C
      lightest: '#FDD5BF',
    },
  
    // ============================================
    // NEUTRALES
    // ============================================
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  
    // ============================================
    // ESTADOS DE INVENTARIO
    // ============================================
    status: {
      pending: {
        bg: '#F4A7A1',       // Coral claro
        text: '#BD5751',     // Coral oscuro
        border: '#DE8781',   // Coral medio
      },
      partial: {
        bg: '#F7C59F',       // Durazno claro
        text: '#B6754F',     // Durazno oscuro
        border: '#EAB5AF',   // Durazno medio
      },
      completed: {
        bg: '#B2E3B5',       // Menta claro
        text: '#529256',     // Menta oscuro
        border: '#79BC7C',   // Menta medio
      },
      overdelivered: {
        bg: '#D6C5E5',       // Lavanda
        text: '#8869AD',     // Morado oscuro
        border: '#AF87C9',   // Morado medio
      },
      cancelled: {
        bg: '#F3F4F6',       // Gris claro
        text: '#6B7280',     // Gris medio
        border: '#D1D5DB',   // Gris borde
      },
    },
  
    // ============================================
    // GRADIENTES
    // ============================================
    gradients: {
      primary: 'linear-gradient(135deg, #A8D8EA 0%, #7AB6D6 100%)',
      secondary: 'linear-gradient(135deg, #D6C5E5 0%, #F2ECF8 100%)',
      success: 'linear-gradient(135deg, #B2E3B5 0%, #C6EFC9 100%)',
      warning: 'linear-gradient(135deg, #F7C59F 0%, #FDD5BF 100%)',
      danger: 'linear-gradient(135deg, #F4A7A1 0%, #F7BBB5 100%)',
      card: 'linear-gradient(135deg, #D6C5E5 0%, #F2ECF8 100%)',
      progressBar: 'linear-gradient(90deg, #875BCB 0%, #9E75D8 50%, #B18BE3 100%)',
      relationBar: 'linear-gradient(90deg, #A5B4FC 0%, #D8B4FE 50%, #F9A8D4 100%)',          // Variantes adicionales del Bridge gradient
      relationText: 'linear-gradient(90deg, #6366F1 100%, #A855F7 100%, #EC4899 100%)',
      relationVertical: 'linear-gradient(180deg, #A5B4FC 0%, #D8B4FE 50%, #F9A8D4 100%)',
    relationDiagonal: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
  },
  
    // ============================================
    // UI ESPECÍFICO
    // ============================================
    ui: {
      background: '#FFFFFF',
      backgroundSecondary: '#F9FAFB',
      border: '#E5E7EB',
      borderMedium: '#D1D5DB',
      textPrimary: '#00356B',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
    },
      // Colores base del Bridge para usar en backgrounds/borders individuales
      bridge: {
        // Texto
        textIndigo: '#6366F1',
        textPurple: '#A855F7',
        textPink: '#EC4899',
        
        // Fondo
        bgIndigo: '#A5B4FC',
        bgPurple: '#D8B4FE',
        bgPink: '#F9A8D4',
        
        // Borde
        borderIndigo: '#818CF8',
        borderPurple: '#C084FC',
        borderPink: '#F472B6',
      }
  };
  
  // Helper para acceso rápido
  export const colors = perfourColors;