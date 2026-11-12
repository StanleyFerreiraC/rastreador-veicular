import { useEffect, useState } from 'react'
import { listTrackers } from '../api/rastreador'
import type { VehicleOverview } from './model'

const configuredSeconds = Number(import.meta.env.VITE_TRACKER_POLL_SECONDS)
export const trackerPollSeconds = Number.isInteger(configuredSeconds) && configuredSeconds >= 5 && configuredSeconds <= 3600
  ? configuredSeconds
  : 30

const timeoutMs = 10_000

type Snapshot = {
  vehicles: VehicleOverview[] | null
  lastCheckedAt: string | null
  isFetching: boolean
  failed: boolean
}

export function useTrackerFeed(enabled: boolean) {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    vehicles: null,
    lastCheckedAt: null,
    isFetching: true,
    failed: false,
  })
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    if (!enabled) return

    let stopped = false
    let request: AbortController | undefined
    let nextPoll: number | undefined

    async function poll() {
      const controller = new AbortController()
      request = controller
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
      setSnapshot((previous) => ({ ...previous, isFetching: true }))

      try {
        const vehicles = await listTrackers(controller.signal)
        if (!stopped) {
          setSnapshot({ vehicles, lastCheckedAt: new Date().toISOString(), isFetching: false, failed: false })
        }
      } catch {
        if (!stopped) {
          setSnapshot((previous) => ({ ...previous, isFetching: false, failed: true }))
        }
      } finally {
        window.clearTimeout(timeout)
        request = undefined
        if (!stopped) nextPoll = window.setTimeout(poll, trackerPollSeconds * 1000)
      }
    }

    void poll()
    return () => {
      stopped = true
      request?.abort()
      window.clearTimeout(nextPoll)
    }
  }, [enabled, refreshCount])

  function refresh() {
    if (snapshot.isFetching) return
    setSnapshot((previous) => ({ ...previous, isFetching: true }))
    setRefreshCount((count) => count + 1)
  }

  return { ...snapshot, refresh }
}