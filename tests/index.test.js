import { jest } from '@jest/globals'
import * as React from 'react'
import WaveSurfer from 'wavesurfer.js'
import { render } from '@testing-library/react'
import WavesurferPlayer from '../dist/index'

describe('@wavesurfer/react tests', () => {
  beforeAll(() => {
    jest.spyOn(WaveSurfer, 'create').mockImplementation((...args) => {
      function MockWaveSurfer(options) {
        this.listeners = {}
        if (options.url) {
          this.load(options.url)
        }
      }
      MockWaveSurfer.prototype = WaveSurfer.prototype

      MockWaveSurfer.prototype.load = async function () {
        await Promise.resolve()
        this.emit('ready')
      }

      MockWaveSurfer.prototype.destroy = function () {
        this.listeners = {}
      }

      return new MockWaveSurfer(...args)
    })
  })

  it('should properly cleanup on unmount', () => {
    const { unmount } = render(React.createElement(WavesurferPlayer, { waveColor: 'purple' }))
    const mockInstance = WaveSurfer.create.mock.results[0].value
    const destroySpy = jest.spyOn(mockInstance, 'destroy')

    unmount()
    expect(destroySpy).toHaveBeenCalled()
  })

  it('should render wavesurfer with basic options', () => {
    const props = { waveColor: 'purple' }

    render(React.createElement(WavesurferPlayer, props))

    expect(WaveSurfer.create).toHaveBeenCalledWith({
      ...props,
      container: expect.any(HTMLElement),
    })
  })

  it('should render wavesurfer with events', (done) => {
    const props = { url: 'test.mp3', waveColor: 'purple' }

    const onReady = (wavesurfer) => {
      expect(wavesurfer).toBeInstanceOf(WaveSurfer)
      done()
    }

    render(React.createElement(WavesurferPlayer, { ...props, onReady }))

    expect(WaveSurfer.create).toHaveBeenCalledWith({
      ...props,
      container: expect.any(HTMLElement),
    })

    expect(WaveSurfer.create).toHaveBeenCalled()
  })
})
