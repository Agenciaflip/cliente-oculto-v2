// =====================================================
// Date Utilities
// Funções auxiliares para manipulação de datas
// =====================================================

/**
 * Adiciona minutos a uma data
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

/**
 * Adiciona segundos a uma data
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000)
}

/**
 * Verifica se uma data já passou
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getTime() < Date.now()
}

/**
 * Formata data para ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString()
}

/**
 * Calcula diferença em minutos entre duas datas
 */
export function diffInMinutes(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  return Math.floor((d1.getTime() - d2.getTime()) / 60000)
}
