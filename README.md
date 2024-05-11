# @wavesurfer/react

[![npm](https://img.shields.io/npm/v/@wavesurfer/react)](https://www.npmjs.com/package/@wavesurfer/react)

A React component and hook for [wavesurfer.js](http://github.com/katspaugh/wavesurfer.js).

It makes it easy to use wavesurfer from React. All of the familiar [wavesurfer options](https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferOptions) become React props.

You can subscribe to various [wavesurfer events](https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferEvents) also via props. Just prepend an event name with on, e.g. `ready` -> `onReady`. Each event callback receives a wavesurfer instance as the first argument.

## Installation

With yarn:
```bash
yarn add wavesurfer.js @wavesurfer/react
```

With npm:
```bash
npm install wavesurfer.js @wavesurfer/react
```

## Usage

As a component:

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

Alternatively, as a hook:

```js
import { useRef } from 'react'
import { useWavesurfer } from '@wavesurfer/react'

const App = () => {
  const containerRef = useRef()

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: '/my-server/audio.ogg',
    waveColor: 'purple',
    height: 100,
  })

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  return (
    <>
      <div ref={containerRef} />

      <button onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  )
}
```

## Docs

https://wavesurfer.xyz
