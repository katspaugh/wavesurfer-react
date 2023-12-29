/**
 * A React hook for wavesurfer.js
 *
 * Usage:
 *
 * import { useWavesurfer } from '@wavesurfer/react'
 *
 * const App = () => {
 *   const { containerRef, wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
 *     url: '/my-server/audio.ogg',
 *     waveColor: 'purple',
 *     height: 100',
 *   })
 *
 *   return <div ref={containerRef} />
 * }
 */

import { type RefObject, useEffect, useMemo, useState } from 'react'
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js'

/**
 * Use wavesurfer instance
 */
export function useWavesurferInstance(
  containerRef: RefObject<HTMLElement>,
  options: Partial<WaveSurferOptions>,
): WaveSurfer | null {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  // Flatten options object to an array of keys and values to compare them deeply in the hook deps
  const flatOptions = useMemo(() => Object.entries(options).flat(), [options])

  // Create a wavesurfer instance
  useEffect(() => {
    if (!containerRef.current) return

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
        setCurrentTime(0)
      }),

      wavesurfer.on('play', () => {
        setIsPlaying(true)
      }),

      wavesurfer.on('pause', () => {
        setIsPlaying(false)
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
      currentTime,
    }),
    [isPlaying, currentTime],
  )
}

export function useWavesurfer({
  container,
  ...options
}: Omit<WaveSurferOptions, 'container'> & { container: RefObject<HTMLElement> }): ReturnType<
  typeof useWavesurferState
> & {
  wavesurfer: ReturnType<typeof useWavesurferInstance>
} {
  const wavesurfer = useWavesurferInstance(container, options)
  const state = useWavesurferState(wavesurfer)
  return useMemo(() => ({ ...state, wavesurfer }), [state, wavesurfer])
}
