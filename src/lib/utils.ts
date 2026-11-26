import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Склейка классов для компонентов BoardUI (вместо их cx) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
