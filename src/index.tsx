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

import { useState, useMemo, useEffect, useRef, memo, type ReactElement, type RefObject } from 'react'
import WaveSurfer, { type WaveSurferEvents, type WaveSurferOptions } from 'wavesurfer.js'

type WavesurferEventHandler<T extends unknown[]> = (wavesurfer: WaveSurfer, ...args: T) => void

type OnWavesurferEvents = {
  [K in keyof WaveSurferEvents as `on${Capitalize<K>}`]?: WavesurferEventHandler<WaveSurferEvents[K]>
}

type PartialWavesurferOptions = Omit<WaveSurferOptions, 'container'>

/**
 * Props for the Wavesurfer component
 * @public
 */
export type WavesurferProps = PartialWavesurferOptions & OnWavesurferEvents

/**
 * Use wavesurfer instance
 */
function useWavesurferInstance(
  containerRef: RefObject<HTMLDivElement | null>,
  options: Partial<WaveSurferOptions>,
): WaveSurfer | null {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  // Flatten options object to an array of keys and values to compare them deeply in the hook deps
  const flatOptions = useMemo(() => Object.entries(options).flat(), [options])

  // Create a wavesurfer instance
  useEffect(() => {
    if (!containerRef?.current) return

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
    })

    setWavesurfer(ws)

    return () => {
      ws.destroy()
    }
  }, [containerRef, ...flatOptions])

  return wavesurfer
}

/**
 * Use wavesurfer state
 */
function useWavesurferState(wavesurfer: WaveSurfer | null): {
  isReady: boolean
  isPlaying: boolean
  currentTime: number
} {
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [hasFinished, setHasFinished] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)

  useEffect(() => {
    if (!wavesurfer) return

    const unsubscribeFns = [
      wavesurfer.on('load', () => {
        setIsReady(false)
        setIsPlaying(false)
        setCurrentTime(0)
      }),

      wavesurfer.on('ready', () => {
        setIsReady(true)
        setIsPlaying(false)
        setHasFinished(false)
        setCurrentTime(0)
      }),

      wavesurfer.on('finish', () => {
        setHasFinished(true)
      }),

      wavesurfer.on('play', () => {
        setIsPlaying(true)
      }),

      wavesurfer.on('pause', () => {
        setIsPlaying(false)
      }),

      wavesurfer.on('timeupdate', () => {
        setCurrentTime(wavesurfer.getCurrentTime())
      }),

      wavesurfer.on('destroy', () => {
        setIsReady(false)
        setIsPlaying(false)
      }),
    ]

    return () => {
      unsubscribeFns.forEach((fn) => fn())
    }
  }, [wavesurfer])

  return useMemo(
    () => ({
      isReady,
      isPlaying,
      hasFinished,
      currentTime,
    }),
    [isPlaying, hasFinished, currentTime, isReady],
  )
}

const EVENT_PROP_RE = /^on([A-Z])/
const isEventProp = (key: string) => EVENT_PROP_RE.test(key)
const getEventName = (key: string) => key.replace(EVENT_PROP_RE, (_, $1) => $1.toLowerCase()) as keyof WaveSurferEvents

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
      const event = getEventName(name)
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
 * @see https://wavesurfer.xyz/docs/modules/wavesurfer
 * @public
 */
const WavesurferPlayer = memo((props: WavesurferProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [options, events] = useWavesurferProps(props)
  const wavesurfer = useWavesurferInstance(containerRef, options)
  useWavesurferEvents(wavesurfer, events)

  const style = {
    ...(options.height == 'auto' && { height: '100%' }),
  }

  // Create a container div
  return <div style={style} ref={containerRef} />
})

/**
 * @public
 */
export default WavesurferPlayer

/**
 * React hook for wavesurfer.js
 *
 * ```
 * import { useWavesurfer } from '@wavesurfer/react'
 *
 * const App = () => {
 *   const containerRef = useRef<HTMLDivElement | null>(null)
 *
 *   const { wavesurfer, isReady, isPlaying, hasFinished, currentTime } = useWavesurfer({
 *     container: containerRef,
 *     url: '/my-server/audio.ogg',
 *     waveColor: 'purple',
 *     height: 100',
 *   })
 *
 *   return <div ref={containerRef} />
 * }
 * ```
 *
 * @public
 */
export function useWavesurfer({
  container,
  ...options
}: Omit<WaveSurferOptions, 'container'> & { container: RefObject<HTMLDivElement | null> }): ReturnType<
  typeof useWavesurferState
> & {
  wavesurfer: ReturnType<typeof useWavesurferInstance>
} {
  const wavesurfer = useWavesurferInstance(container, options)
  const state = useWavesurferState(wavesurfer)
  return useMemo(() => ({ ...state, wavesurfer }), [state, wavesurfer])
}
