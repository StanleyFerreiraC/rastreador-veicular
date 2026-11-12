import type { Coordinates, VehicleOverview } from '../dashboard/model'

const defaultBaseUrl = 'https://rastreador-api-103305944170.us-central1.run.app'
const baseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || defaultBaseUrl).replace(/\/+$/, '')

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function asText(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null
}

function asInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : null
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function asTimestamp(value: unknown): string | null {
  const text = asText(value)
  return text && /(?:Z|[+-]\d{2}:\d{2})$/i.test(text) && Number.isFinite(Date.parse(text)) ? text : null
}

function asClock(value: unknown): string | null {
  const text = asText(value)
  return text && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(text)
    ? text.slice(0, 5)
    : null
}

function asCoordinates(value: Record<string, unknown> | null): Coordinates | null {
  const latitude = value?.latitude
  const longitude = value?.longitude
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90) return null
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

function toVehicleOverview(value: unknown): VehicleOverview {
  const tracker = asRecord(value)
  const id = asInteger(tracker?.rastreadorId)
  if (!tracker || id === null) throw new Error('Identificador do rastreador inválido.')

  const vehicle = asRecord(tracker.veiculo)
  const position = asRecord(tracker.posicaoAtual)
  const sleep = asRecord(tracker.modoSono)
  const location = asCoordinates(position)
  const safeLocation = asCoordinates(sleep)
  const economy = asBoolean(tracker.modoEconomia)

  return {
    id,
    placa: asText(vehicle?.placa) ?? 'Sem placa',
    marcaModelo: asText(vehicle?.marcaModelo) ?? `Rastreador #${id}`,
    mode: economy === null ? 'unknown' : economy ? 'sleeping' : 'monitoring',
    anchored: asBoolean(position?.ancorado),
    lastPosition: location && { ...location, recordedAt: asTimestamp(position?.dataHora) },
    sleepZone: safeLocation ? {
      ...safeLocation,
      startsAt: asClock(sleep?.horaInicio),
      endsAt: asClock(sleep?.horaFim),
      active: asBoolean(sleep?.ativo),
    } : tracker.modoSono === null ? null : undefined,
    vehicleInfo: {
      id: asInteger(vehicle?.veiculoId),
      type: asText(vehicle?.tipoVeiculo),
      year: asInteger(vehicle?.anoVeiculo),
    },
    trackerInfo: {
      imei: asText(tracker.imei),
      chipNumber: asText(tracker.numeroChip),
      active: asBoolean(tracker.ativo),
      updatedAt: asTimestamp(tracker.ultimaAtualizacao),
    },
  }
}

export async function listTrackers(signal: AbortSignal): Promise<VehicleOverview[]> {
  const response = await fetch(`${baseUrl}/api/Rastreador`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    credentials: 'omit',
    signal,
  })
  if (!response.ok) throw new Error(`Falha ao consultar a API (HTTP ${response.status}).`)

  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) throw new Error('A API retornou uma listagem inválida.')

  const vehicles = payload.map(toVehicleOverview)
  if (new Set(vehicles.map(({ id }) => id)).size !== vehicles.length) {
    throw new Error('A API retornou identificadores de rastreador duplicados.')
  }
  return vehicles
}