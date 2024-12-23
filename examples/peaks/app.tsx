import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import type WaveSurfer from 'wavesurfer.js'
import WavesurferPlayer from '../../dist/index.js'
import peaksDataAudio from './audio.json';
import peaksDataStereo from './stereo.json';

console.log('mounting React wavesurfer');

const medias = [
  {
    url: '../audio.wav',
    peaks: [peaksDataAudio.data],
    duration: peaksDataAudio.length
  },
  {
    url: '../stereo.mp3',
    peaks: [peaksDataStereo.data],
    duration: peaksDataStereo.length
  }
]

const randomColor = () =>
  `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`

const App = () => {
  const [mediaIndex, setMediaIndex] = useState(0)
  const [waveColor, setWaveColor] = useState(randomColor)
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Swap the audio URL
  const onUrlChange = () => {
    setIsPlaying(false)
    setMediaIndex((index) => (index + 1) % medias.length)
  }

  // Play/pause the audio
  const onPlayPause = () => {
    setIsPlaying((playing) => {
      if (wavesurfer?.isPlaying() !== !playing) {
        wavesurfer?.playPause()
        return !playing
      }
      return playing
    })
  }

  // Randomize the wave color
  const onColorChange = () => {
    //setWaveColor(randomColor) // slow -- re-render
    wavesurfer?.setOptions({ waveColor: randomColor() }) // fast -- no re-render
  }

  const media = medias[mediaIndex]

  return (
    <>
      <WavesurferPlayer
        height={100}
        waveColor={waveColor}
        url={media.url}
        peaks={media.peaks}
        duration={media.duration}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onReady={(ws) => setWavesurfer(ws)}
      />

      <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}>
        <button onClick={onUrlChange}>Change audio</button>

        <button onClick={onColorChange}>Randomize color</button>

        <button onClick={onPlayPause} style={{ minWidth: '5em' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </>
  )
}

// Create a React root and render the app
const root = createRoot(document.getElementById('app')!)
root.render(<App />)
