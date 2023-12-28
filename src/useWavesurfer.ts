/**
 * A React hook for wavesurfer.js
 *
 * Usage:
 *
 * import { useWavesurfer } from '@wavesurfer/react'
 *
 * const MyComponent = () => {
 *   const containerRef = useRef<HTMLDivElement | null>(null)
 *   const wavesurfer = useWavesurfer(containerRef, { waveColor: 'violet' })
 *   return <div ref={containerRef} />
 * }
 */

import { useState, useEffect, type RefObject } from 'react'
import WaveSurfer, { type WaveSurferOptions } from 'wavesurfer.js'

export function useWavesurfer(
  containerRef: RefObject<HTMLElement>,
  options: Partial<WaveSurferOptions>,
): WaveSurfer | null {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)

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
  }, [options])

  return wavesurfer
}
