# @wavesurfer/react

A React component for [wavesurfer.js](http://github.com/katspaugh/wavesurfer.js).

## Installation

With yarn:
```bash
yarn add @wavesurfer/react
```

With npm:
```bash
npm install @wavesurfer/react
```

## Usage

```js
import WavesurferPlayer from '@wavesurfer/react'

const App = () => {
  const [wavesurfer, setWavesurfer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const onReady = (ws) => {
    setWavesurfer(ws)
    setIsPlaying(false)
  }

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  return (
    <>
      <WavesurferPlayer
        height={100}
        waveColor="violet"
        url="/my-server/audio.wav"
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  )
}
```

## Docs

https://wavesurfer.xyz
