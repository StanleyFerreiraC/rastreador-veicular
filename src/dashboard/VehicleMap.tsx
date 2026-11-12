import { useState } from 'react'
import { ArrowUpRight, MapPin, MapPinOff, Shield } from 'lucide-react'
import type { Coordinates, VehicleOverview } from './model'
import './VehicleMap.css'

// URLs de incorporação retornadas pelo Google Maps para os pontos fixos da demonstração.
const demoEmbeds = new Map([
  ['-23.5852,-46.6576', 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s-23.5852,-46.6576!6i17!3m1!1spt-BR!5m1!1spt-BR'],
  ['-23.5614,-46.6559', 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s-23.5614,-46.6559!6i17!3m1!1spt-BR!5m1!1spt-BR'],
])

function coordinateQuery({ latitude, longitude }: Coordinates) {
  return `${latitude},${longitude}`
}

function getMapUrls(coordinates: Coordinates, demo: boolean) {
  const query = coordinateQuery(coordinates)
  const search = new URLSearchParams({ api: '1', query })
  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY?.trim()

  return {
    external: `https://www.google.com/maps/search/?${search}`,
    embed: demo ? demoEmbeds.get(query) : key
      ? `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key, q: query, zoom: '17', language: 'pt-BR' })}`
      : undefined,
  }
}

export function VehicleMap({ vehicle, demo }: { vehicle: VehicleOverview; demo: boolean }) {
  const [target, setTarget] = useState<'position' | 'safeZone'>('position')
  const { lastPosition, sleepZone } = vehicle
  const showSafeZone = Boolean(sleepZone && (target === 'safeZone' || !lastPosition))
  const point = showSafeZone ? sleepZone : lastPosition
  const pointLabel = showSafeZone ? sleepZone?.name ?? 'Local seguro' : 'Última posição'
  const urls = point && getMapUrls(point, demo)

  return (
    <section className="vehicle-map" aria-labelledby="map-heading">
      <div className="vehicle-map-header">
        <h2 id="map-heading">Mapa do veículo</h2>
        {urls && (
          <a className="map-link" href={urls.external} target="_blank" rel="noreferrer">
            Abrir no Google Maps <ArrowUpRight aria-hidden="true" size={16} />
            <span className="visually-hidden"> (abre em nova aba)</span>
          </a>
        )}
      </div>

      <div className="vehicle-map-panel">
        {point && (
          <div className="vehicle-map-toolbar">
            {lastPosition && sleepZone ? (
              <div className="map-targets" role="group" aria-label="Ponto exibido no mapa">
                <button type="button" aria-pressed={!showSafeZone} onClick={() => setTarget('position')}>
                  <MapPin aria-hidden="true" size={17} /> Última posição
                </button>
                <button type="button" aria-pressed={showSafeZone} onClick={() => setTarget('safeZone')}>
                  <Shield aria-hidden="true" size={17} /> Local seguro
                </button>
              </div>
            ) : (
              <span className="map-point-label">
                <MapPin aria-hidden="true" size={17} /> {showSafeZone ? 'Local seguro' : 'Última posição'}
              </span>
            )}
            {showSafeZone && sleepZone?.name && <p className="map-place-name">{sleepZone.name}</p>}
          </div>
        )}

        {urls?.embed ? (
          <iframe
            className="vehicle-map-frame"
            src={urls.embed}
            title={`Google Maps: ${pointLabel} · ${vehicle.marcaModelo}`}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="vehicle-map-empty">
            <MapPinOff aria-hidden="true" size={25} />
            <p>{point ? 'Abra o Google Maps para visualizar este ponto.' : 'Nenhuma localização disponível para este veículo.'}</p>
          </div>
        )}
      </div>
    </section>
  )
}