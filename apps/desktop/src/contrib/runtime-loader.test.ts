import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { KenXCodeReadDirResult } from '@/global'
import type * as KenXCodeModule from '@/kenxcode'

import { discoverRuntimePlugins, watchRuntimePlugins } from './runtime-loader'

// getStatus would supply the connected backend's kenxcode_home — a REMOTE path in
// remote mode. The disk scanner must NOT derive the plugin root from it (#66899).
const getStatus = vi.fn(async () => ({ kenxcode_home: '/remote/box/.kenxcode' }))

vi.mock('@/kenxcode', async importActual => ({
  ...(await importActual<typeof KenXCodeModule>()),
  getStatus: () => getStatus()
}))

const desktopPluginsRoot = vi.fn<() => Promise<string>>()
const readDir = vi.fn<(path: string) => Promise<KenXCodeReadDirResult>>()
const watchDirectory = vi.fn<(path: string) => Promise<{ id: string }>>()
const onPreviewFileChanged = vi.fn()

beforeEach(() => {
  desktopPluginsRoot.mockReset()
  readDir.mockReset()
  watchDirectory.mockReset()
  onPreviewFileChanged.mockReset()
  getStatus.mockClear()
  ;(window as unknown as { kenxcodeDesktop: unknown }).kenxcodeDesktop = {
    desktopPluginsRoot,
    onPreviewFileChanged,
    readDir,
    watchDirectory
  }
})

afterEach(() => {
  delete (window as unknown as { kenxcodeDesktop?: unknown }).kenxcodeDesktop
})

describe('scanDiskPlugins (#66899)', () => {
  it('scans the Electron-resolved local root, never the backend kenxcode_home', async () => {
    desktopPluginsRoot.mockResolvedValue('/local/.kenxcode/desktop-plugins')
    readDir.mockResolvedValue({ entries: [] })

    await discoverRuntimePlugins()

    expect(desktopPluginsRoot).toHaveBeenCalled()
    expect(readDir).toHaveBeenCalledWith('/local/.kenxcode/desktop-plugins')
    // The remote backend's kenxcode_home must never feed the local plugin scan.
    expect(getStatus).not.toHaveBeenCalled()
    expect(readDir).not.toHaveBeenCalledWith('/remote/box/.kenxcode/desktop-plugins')
  })

  it('no-ops when the resolver yields no local root', async () => {
    desktopPluginsRoot.mockResolvedValue('')

    await discoverRuntimePlugins()

    expect(readDir).not.toHaveBeenCalled()
  })
})

describe('watchRuntimePlugins dir watch (#66899)', () => {
  it('watches the Electron-resolved local root, never the backend kenxcode_home', async () => {
    desktopPluginsRoot.mockResolvedValue('/local/.kenxcode/desktop-plugins')
    readDir.mockResolvedValue({ entries: [] })
    watchDirectory.mockResolvedValue({ id: 'watch-1' })

    watchRuntimePlugins()
    // Drain the async scan + startDirWatch chains.
    await vi.waitFor(() => expect(watchDirectory).toHaveBeenCalled())

    expect(watchDirectory).toHaveBeenCalledWith('/local/.kenxcode/desktop-plugins')
    expect(watchDirectory).not.toHaveBeenCalledWith('/remote/box/.kenxcode/desktop-plugins')
    expect(getStatus).not.toHaveBeenCalled()
  })
})
