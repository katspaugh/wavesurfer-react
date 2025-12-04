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

  it('should handle plugins correctly and not break on re-render', () => {
    // Create a mock plugin that simulates being mutated during initialization
    const mockPlugin = {
      _init: jest.fn(),
      _initialized: false,
      init: function() {
        if (this._initialized) {
          throw new Error('Plugin already initialized')
        }
        this._initialized = true
        this._init()
      }
    }

    const props = { waveColor: 'purple', plugins: [mockPlugin] }

    // Simulate the mock WaveSurfer.create calling plugin init
    const originalMock = WaveSurfer.create.getMockImplementation()
    WaveSurfer.create.mockImplementation((...args) => {
      const instance = originalMock(...args)
      // Simulate plugin initialization (wavesurfer.js would do this)
      const options = args[0]
      if (options.plugins) {
        options.plugins.forEach(plugin => {
          if (plugin.init) plugin.init()
        })
      }
      return instance
    })

    const { rerender } = render(React.createElement(WavesurferPlayer, props))
    
    // First render should initialize the plugin
    expect(mockPlugin._init).toHaveBeenCalledTimes(1)
    expect(mockPlugin._initialized).toBe(true)

    // Re-render with the same props should not cause plugin re-initialization
    // because plugins are now handled via ref
    rerender(React.createElement(WavesurferPlayer, props))
    
    // Plugin init should still only have been called once
    expect(mockPlugin._init).toHaveBeenCalledTimes(1)

    // Restore original mock
    WaveSurfer.create.mockImplementation(originalMock)
  })
})
