import { type RefObject, useEffect, useMemo, useState } from 'react'
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js'

export function useWavesurfer(
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
