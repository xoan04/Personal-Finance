import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: Currency): string {
  const defaultCurrency = { code: "USD", symbol: "$", name: "Dólar estadounidense" }
  const currencyToUse = currency || defaultCurrency

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyToUse.code,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
