/**
 * A React component for wavesurfer.js
 *
 * Usage:
 *
 * import WavesurferPlayer from '@wavesurfer/react'
 *
 * <WavesurferPlayer
 *   url="/my-server/audio.ogg"
 *   waveColor="purple"
 *   height={100}
 *   onReady={(wavesurfer) => console.log('Ready!', wavesurfer)}
 * />
 */

import { useMemo, useEffect, useRef, memo, type ReactElement } from 'react'
import WaveSurfer, { type WaveSurferEvents, type WaveSurferOptions } from 'wavesurfer.js'
import { useWavesurfer } from './useWavesurfer.js'

type WavesurferEventHandler<T extends unknown[]> = (wavesurfer: WaveSurfer, ...args: T) => void

type OnWavesurferEvents = {
  [K in keyof WaveSurferEvents as `on${Capitalize<K>}`]?: WavesurferEventHandler<WaveSurferEvents[K]>
}

type PartialWavesurferOptions = Omit<WaveSurferOptions, 'container'>
export type WavesurferProps = PartialWavesurferOptions & OnWavesurferEvents

const EVENT_PROP_RE = /^on([A-Z])/
const isEventProp = (key: string) => EVENT_PROP_RE.test(key)

/**
 * Parse props into wavesurfer options and events
 */
function useWavesurferProps(props: WavesurferProps): [PartialWavesurferOptions, OnWavesurferEvents] {
  // Props starting with `on` are wavesurfer events, e.g. `onReady`
  // The rest of the props are wavesurfer options
  return useMemo<[PartialWavesurferOptions, OnWavesurferEvents]>(() => {
    const allOptions = { ...props }
    const allEvents = { ...props }

    for (const key in allOptions) {
      if (isEventProp(key)) {
        delete allOptions[key as keyof WavesurferProps]
      } else {
        delete allEvents[key as keyof WavesurferProps]
      }
    }
    return [allOptions, allEvents]
  }, [props])
}

/**
 * Subscribe to wavesurfer events
 */
function useWavesurferEvents(wavesurfer: WaveSurfer | null, events: OnWavesurferEvents) {
  const flatEvents = useMemo(() => Object.entries(events).flat(), [events])

  // Subscribe to events
  useEffect(() => {
    if (!wavesurfer) return

    const eventEntries = Object.entries(events)
    if (!eventEntries.length) return

    const unsubscribeFns = eventEntries.map(([name, handler]) => {
      const event = name.replace(EVENT_PROP_RE, (_, $1) => $1.toLowerCase()) as keyof WaveSurferEvents

      return wavesurfer.on(event, (...args) =>
        (handler as WavesurferEventHandler<WaveSurferEvents[typeof event]>)(wavesurfer, ...args),
      )
    })

    return () => {
      unsubscribeFns.forEach((fn) => fn())
    }
  }, [wavesurfer, ...flatEvents])
}

/**
 * Wavesurfer player component
 *
 * @see https://wavesurfer.xyz/docs/modules/wavesurfer
 */
function Player(props: WavesurferProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [options, events] = useWavesurferProps(props)
  const wavesurfer = useWavesurfer(containerRef, options)
  useWavesurferEvents(wavesurfer, events)

  // Create a container div
  return <div ref={containerRef} />
}

const WavesurferPlayer = memo(Player)

export default WavesurferPlayer
