import { useState } from 'react'
import {
  Anchor, Car, ChevronDown, CircleHelp, Clock3, FlaskConical, MapPin, Moon,
  Radio, RefreshCw, Shield, Tag,
} from 'lucide-react'
import { demoVehicles } from './dashboard/demo'
import type { Coordinates, VehicleOverview } from './dashboard/model'
import { trackerPollSeconds, useTrackerFeed } from './dashboard/useTrackerFeed'
import { VehicleMap } from './dashboard/VehicleMap'
import './App.css'

const modes = {
  sleeping: {
    label: 'Em hibernação',
    detail: 'Modo de economia sinalizado pelo rastreador.',
    icon: Moon,
  },
  monitoring: {
    label: 'Modo normal',
    detail: 'O modo de economia está desativado.',
    icon: Radio,
  },
  unknown: {
    label: 'Estado desconhecido',
    detail: 'Ainda não há informação sobre o modo do rastreador.',
    icon: CircleHelp,
  },
} satisfies Record<VehicleOverview['mode'], { label: string; detail: string; icon: typeof Moon }>

const timestampFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'America/Sao_Paulo',
})

const coordinateFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

const missingValue = 'Sem informação'

function formatCoordinates({ latitude, longitude }: Coordinates) {
  return `${coordinateFormat.format(latitude)} · ${coordinateFormat.format(longitude)}`
}

function Timestamp({ value }: { value: string }) {
  return <time dateTime={value}>{timestampFormat.format(new Date(value))} (Brasília)</time>
}

function VehicleIdentification({ vehicle }: { vehicle: VehicleOverview }) {
  const { vehicleInfo, trackerInfo } = vehicle
  if (!trackerInfo) return null

  const activeLabel = trackerInfo.active === null ? missingValue : trackerInfo.active ? 'Ativo' : 'Inativo'

  return (
    <section className="identification" aria-labelledby="identification-heading">
      <h2 id="identification-heading">Identificação</h2>
      <div className="identification-grid">
        <div>
          <h3 className="section-heading"><Car aria-hidden="true" size={19} /> Veículo</h3>
          <dl>
            <div><dt>Marca e modelo</dt><dd>{vehicle.marcaModelo}</dd></div>
            <div><dt>Placa</dt><dd>{vehicle.placa}</dd></div>
            <div><dt>Tipo</dt><dd>{vehicleInfo?.type ?? missingValue}</dd></div>
            <div><dt>Ano</dt><dd>{vehicleInfo?.year ?? missingValue}</dd></div>
            <div><dt>ID do veículo</dt><dd>{vehicleInfo?.id ?? missingValue}</dd></div>
          </dl>
        </div>
        <div>
          <h3 className="section-heading"><Radio aria-hidden="true" size={19} /> Rastreador</h3>
          <dl>
            <div><dt>ID do rastreador</dt><dd>{vehicle.id}</dd></div>
            <div><dt>IMEI</dt><dd>{trackerInfo.imei ?? missingValue}</dd></div>
            <div><dt>Número do chip</dt><dd>{trackerInfo.chipNumber ?? missingValue}</dd></div>
            <div><dt>Cadastro</dt><dd>{activeLabel}</dd></div>
            <div>
              <dt>Última atualização no backend</dt>
              <dd>{trackerInfo.updatedAt ? <Timestamp value={trackerInfo.updatedAt} /> : missingValue}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function VehicleDetails({ vehicle, demo }: { vehicle: VehicleOverview; demo: boolean }) {
  const mode = modes[vehicle.mode]
  const ModeIcon = mode.icon
  const { lastPosition, sleepZone } = vehicle
  const anchorLabel = vehicle.anchored === null ? missingValue : vehicle.anchored ? 'Ativa' : 'Inativa'
  const zoneStatus = sleepZone?.active == null ? 'Configurado' : sleepZone.active ? 'Ativo' : 'Inativo'
  const zoneLabel = sleepZone ? sleepZone.name ?? zoneStatus : sleepZone === null ? 'Não configurado' : missingValue
  const sleepWindow = sleepZone?.startsAt && sleepZone.endsAt
    ? `${sleepZone.startsAt} às ${sleepZone.endsAt}`
    : sleepZone === null ? 'Não configurada' : missingValue

  return (
    <div className="vehicle-details">
      <div className="overview-grid">
        <section className={`mode-panel mode-panel--${vehicle.mode}`} aria-labelledby="mode-heading">
          <span className="mode-icon"><ModeIcon aria-hidden="true" size={27} /></span>
          <div>
            <h2 id="mode-heading" className="mode-caption">Modo do rastreador</h2>
            <p className="mode-value">{mode.label}</p>
            <p className="mode-description">{mode.detail}</p>
          </div>
        </section>

        <section className="position-panel" aria-labelledby="position-heading">
          <h2 id="position-heading" className="section-heading">
            <MapPin aria-hidden="true" size={19} /> Última posição
          </h2>
          {lastPosition ? (
            <>
              <p className="coordinates">{formatCoordinates(lastPosition)}</p>
              <p className="timestamp">
                <Clock3 aria-hidden="true" size={15} />
                {lastPosition.recordedAt ? <Timestamp value={lastPosition.recordedAt} /> : 'Horário do GPS indisponível'}
              </p>
            </>
          ) : (
            <p className="empty-message">Nenhuma posição registrada.</p>
          )}
        </section>
      </div>

      <VehicleIdentification vehicle={vehicle} />
      <VehicleMap key={vehicle.id} vehicle={vehicle} demo={demo} />

      <section className="protection" aria-labelledby="protection-heading">
        <h2 id="protection-heading">Proteção e repouso</h2>
        <ul className="protection-list">
          <li className="protection-row">
            <span className="detail-icon"><Anchor aria-hidden="true" size={19} /></span>
            <div className="protection-label">
              <h3>Ancoragem</h3>
              <p className="detail-description">Estado registrado na última telemetria.</p>
            </div>
            <p className="protection-value">
              <span className={`anchor-pill${vehicle.anchored ? ' anchor-pill--active' : ''}`}>{anchorLabel}</span>
            </p>
          </li>
          <li className="protection-row">
            <span className="detail-icon"><Shield aria-hidden="true" size={19} /></span>
            <div className="protection-label">
              <h3>Local seguro</h3>
              <p className="detail-description">Local configurado para o modo de hibernação.</p>
            </div>
            <p className="protection-value">
              <span>{zoneLabel}</span>
              {sleepZone && <small>{formatCoordinates(sleepZone)}</small>}
            </p>
          </li>
          <li className="protection-row">
            <span className="detail-icon"><Clock3 aria-hidden="true" size={19} /></span>
            <div className="protection-label">
              <h3>Janela de hibernação</h3>
              <p className="detail-description">Horário configurado para o repouso no local seguro.</p>
            </div>
            <p className="protection-value">{sleepWindow}</p>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default function App() {
  const demo = new URLSearchParams(window.location.search).get('modo') === 'demo'
  const feed = useTrackerFeed(!demo)
  const vehicles = demo ? demoVehicles : feed.vehicles
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const vehicle = vehicles?.find(({ id }) => id === selectedId) ?? vehicles?.[0]
  const currentId = vehicle?.id ?? null
  if (currentId !== selectedId) setSelectedId(currentId)

  return (
    <>
      <header className="topbar">
        <div className="topbar-content layout">
          <div className="brand">
            <span className="brand-mark"><MapPin aria-hidden="true" size={20} /></span>
            <span>Rastreador Veicular</span>
          </div>
          {demo && <span className="demo-badge"><FlaskConical aria-hidden="true" size={15} /> Dados simulados</span>}
        </div>
      </header>

      <main className="layout main">
        <div className="page-heading">
          <div>
            <h1>Visão geral</h1>
            <p>Acompanhe a última posição e o modo de operação do veículo.</p>
          </div>
          {vehicle && (
            <div className="vehicle-field">
              <label htmlFor="vehicle">Veículo</label>
              <div className="select-wrap">
                <Tag aria-hidden="true" size={17} className="select-icon" />
                <select id="vehicle" value={vehicle.id} onChange={(event) => setSelectedId(Number(event.target.value))}>
                  {vehicles?.map(({ id, placa, marcaModelo }) => (
                    <option key={id} value={id}>{marcaModelo} · {placa}</option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={17} className="select-arrow" />
              </div>
            </div>
          )}
        </div>

        {!demo && (
          <div className="feed-bar">
            <div className="feed-info">
              <p>Consulta automática a cada <strong>{trackerPollSeconds} s</strong></p>
              {feed.lastCheckedAt && (
                <p className="feed-time">Última consulta bem-sucedida <Timestamp value={feed.lastCheckedAt} /></p>
              )}
            </div>
            <button className="refresh-button" type="button" aria-disabled={feed.isFetching} onClick={feed.refresh}>
              <RefreshCw aria-hidden="true" size={17} />
              {feed.isFetching ? 'Consultando…' : 'Atualizar agora'}
            </button>
          </div>
        )}

        {!demo && feed.failed && (
          <p className="feed-error" role="status">
            {feed.lastCheckedAt
              ? 'A consulta falhou. Os dados da última consulta bem-sucedida continuam na tela.'
              : 'Não foi possível consultar os rastreadores. Uma nova tentativa será feita automaticamente.'}
          </p>
        )}

        {vehicle && <VehicleDetails vehicle={vehicle} demo={demo} />}
        {!vehicle && vehicles && <p className="empty-message" role="status">Nenhum rastreador disponível.</p>}
        {!demo && !vehicles && !feed.failed && <p className="empty-message" role="status">Consultando rastreadores…</p>}
      </main>
    </>
  )
}