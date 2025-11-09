import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateApiKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatSteamId(steamId: string): string {
  // Convert SteamID64 to SteamID3 format for display
  // This is just for display purposes
  return steamId
}

export const CS2_MAPS = [
  { value: 'de_ancient', label: 'Ancient' },
  { value: 'de_anubis', label: 'Anubis' },
  { value: 'de_dust2', label: 'Dust 2' },
  { value: 'de_inferno', label: 'Inferno' },
  { value: 'de_mirage', label: 'Mirage' },
  { value: 'de_nuke', label: 'Nuke' },
  { value: 'de_vertigo', label: 'Vertigo' },
  { value: 'de_overpass', label: 'Overpass' },
  { value: 'de_train', label: 'Train' },
  { value: 'cs_office', label: 'Office' },
  { value: 'cs_italy', label: 'Italy' },
]

export const MATCH_STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  LIVE: 'bg-green-500',
  FINISHED: 'bg-gray-500',
  CANCELED: 'bg-red-500',
}

export const MATCH_SERIES_OPTIONS = [
  { value: 'BO1', label: 'Best of 1' },
  { value: 'BO2', label: 'Best of 2' },
  { value: 'BO3', label: 'Best of 3' },
  { value: 'BO5', label: 'Best of 5' },
]

export function getMatchStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    PENDING: 'Pending',
    LIVE: 'Live',
    FINISHED: 'Finished',
    CANCELED: 'Canceled',
  }
  return labels[status] || status
}

export function calculateKD(kills: number, deaths: number): string {
  if (deaths === 0) return kills.toFixed(2)
  return (kills / deaths).toFixed(2)
}

export function calculateADR(damage: number, rounds: number): string {
  if (rounds === 0) return '0.0'
  return (damage / rounds).toFixed(1)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function validateSteamId(steamId: string): boolean {
  // Validate SteamID64 format (17 digits starting with 765)
  return /^765[0-9]{14}$/.test(steamId)
}

export function parseRconResponse(response: string): any {
  // Parse common RCON response formats
  try {
    // Try to parse as JSON first
    return JSON.parse(response)
  } catch {
    // If not JSON, return as string
    return response
  }
}
