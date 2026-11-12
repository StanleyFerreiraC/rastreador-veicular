import type { VehicleOverview } from './model'

const garage = { latitude: -23.5852, longitude: -46.6576 }

export const demoVehicles: readonly VehicleOverview[] = [
  {
    id: 1,
    placa: 'DEM-1A01',
    marcaModelo: 'Fiat Argo',
    mode: 'sleeping',
    anchored: true,
    lastPosition: { ...garage, recordedAt: '2026-11-09T22:04:00-03:00' },
    sleepZone: { ...garage, name: 'Garagem do veículo', startsAt: '22:00', endsAt: '06:00' },
  },
  {
    id: 2,
    placa: 'DEM-2B02',
    marcaModelo: 'Honda CG 160',
    mode: 'monitoring',
    anchored: false,
    lastPosition: { latitude: -23.5614, longitude: -46.6559, recordedAt: '2026-11-09T22:18:00-03:00' },
    sleepZone: null,
  },
  {
    id: 3,
    placa: 'DEM-3C03',
    marcaModelo: 'Renault Kwid',
    mode: 'unknown',
    anchored: null,
    lastPosition: null,
  },
]