export type Coordinates = {
  latitude: number
  longitude: number
}

export type VehicleOverview = {
  id: number
  placa: string
  marcaModelo: string
  mode: 'monitoring' | 'sleeping' | 'unknown'
  anchored: boolean | null
  lastPosition: (Coordinates & { recordedAt: string | null }) | null
  sleepZone?: (Coordinates & {
    name?: string
    startsAt: string | null
    endsAt: string | null
    active?: boolean | null
  }) | null
  vehicleInfo?: { id: number | null; type: string | null; year: number | null }
  trackerInfo?: {
    imei: string | null
    chipNumber: string | null
    active: boolean | null
    updatedAt: string | null
  }
}