import type { WheelSize } from '@/store/participantsStore'

// Circumference values in mm (standard cycling convention used by Garmin, Wahoo, etc.)
export const WHEEL_SIZES: Record<Exclude<WheelSize, 'custom'>, { label: string; circumference: number }> = {
  '25/622': { label: '25/622 (700×25c)', circumference: 2096 },
  '28/622': { label: '28/622 (700×28c)', circumference: 2136 },
  '29/622': { label: '29/622 (700×29c)', circumference: 2146 },
}
