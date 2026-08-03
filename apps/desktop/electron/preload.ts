import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('kenxcodeDesktop', {
  getConnection: profile => ipcRenderer.invoke('kenxcode:connection', profile),
  revalidateConnection: () => ipcRenderer.invoke('kenxcode:connection:revalidate'),
  touchBackend: profile => ipcRenderer.invoke('kenxcode:backend:touch', profile),
  getGatewayWsUrl: profile => ipcRenderer.invoke('kenxcode:gateway:ws-url', profile),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('kenxcode:window:openSession', sessionId, opts),
  openWindow: () => ipcRenderer.invoke('kenxcode:window:openInstance'),
  claimAmbientCue: key => ipcRenderer.invoke('kenxcode:ambient:claim', key),
  wakeIndicator: {
    getState: () => ipcRenderer.invoke('kenxcode:wake-indicator:get'),
    setState: state => ipcRenderer.send('kenxcode:wake-indicator:set', state),
    onState: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('kenxcode:wake-indicator:state', listener)

      return () => ipcRenderer.removeListener('kenxcode:wake-indicator:state', listener)
    }
  },
  petOverlay: {
    // Main renderer → main process: window lifecycle + drag. `request` is
    // `{ bounds, screen }`; resolves with the screen bounds it actually used.
    open: request => ipcRenderer.invoke('kenxcode:pet-overlay:open', request),
    close: () => ipcRenderer.invoke('kenxcode:pet-overlay:close'),
    setBounds: bounds => ipcRenderer.send('kenxcode:pet-overlay:set-bounds', bounds),
    setIgnoreMouse: ignore => ipcRenderer.send('kenxcode:pet-overlay:ignore-mouse', ignore),
    // Flip the overlay focusable (and focus it) while the composer needs keys.
    setFocusable: focusable => ipcRenderer.send('kenxcode:pet-overlay:set-focusable', focusable),
    // Main renderer → overlay (forwarded by main): push the latest pet state.
    pushState: payload => ipcRenderer.send('kenxcode:pet-overlay:state', payload),
    // Overlay → main renderer (forwarded by main): pop back in / composer submit.
    control: payload => ipcRenderer.send('kenxcode:pet-overlay:control', payload),
    // Overlay subscribes to state pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:pet-overlay:state', listener)

      return () => ipcRenderer.removeListener('kenxcode:pet-overlay:state', listener)
    },
    // Main renderer subscribes to overlay control messages.
    onControl: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:pet-overlay:control', listener)

      return () => ipcRenderer.removeListener('kenxcode:pet-overlay:control', listener)
    }
  },
  // Quick Entry: the global-hotkey mini composer window. Main owns the OS
  // shortcut + the persisted preference; the quick window only captures text
  // and hands it back, and the primary renderer submits it through the normal
  // prompt path.
  quickEntry: {
    getSettings: () => ipcRenderer.invoke('kenxcode:quick-entry:settings:get'),
    setSettings: patch => ipcRenderer.invoke('kenxcode:quick-entry:settings:set', patch),
    submit: payload => ipcRenderer.send('kenxcode:quick-entry:submit', payload),
    dismiss: () => ipcRenderer.send('kenxcode:quick-entry:dismiss'),
    // Primary renderer → main → quick window: gateway connection state + the
    // recent-session options the target picker offers. Main caches the latest
    // payload so a freshly spawned quick window starts from truth.
    pushState: payload => ipcRenderer.send('kenxcode:quick-entry:state', payload),
    // Quick window subscribes to those pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:quick-entry:state', listener)

      return () => ipcRenderer.removeListener('kenxcode:quick-entry:state', listener)
    },
    // Main → primary renderer: a submit captured by the quick window.
    onSubmit: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:quick-entry:submit', listener)

      return () => ipcRenderer.removeListener('kenxcode:quick-entry:submit', listener)
    },
    // Main → quick window: you were just summoned (reset draft + refocus).
    onShown: callback => {
      const listener = () => callback()
      ipcRenderer.on('kenxcode:quick-entry:shown', listener)

      return () => ipcRenderer.removeListener('kenxcode:quick-entry:shown', listener)
    }
  },
  getBootProgress: () => ipcRenderer.invoke('kenxcode:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('kenxcode:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('kenxcode:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('kenxcode:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('kenxcode:connection-config:test', payload),
  sshConfigHosts: () => ipcRenderer.invoke('kenxcode:ssh-config:hosts'),
  sshResolveHost: host => ipcRenderer.invoke('kenxcode:ssh-config:resolve', host),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('kenxcode:connection-config:probe', remoteUrl),
  oauthLoginConnectionConfig: remoteUrl => ipcRenderer.invoke('kenxcode:connection-config:oauth-login', remoteUrl),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('kenxcode:connection-config:oauth-logout', remoteUrl),
  // KenXCode Cloud: one portal login powers discovery + silent per-agent sign-in
  // (cloud-auto-discovery Phase 3).
  cloud: {
    status: () => ipcRenderer.invoke('kenxcode:cloud:status'),
    login: () => ipcRenderer.invoke('kenxcode:cloud:login'),
    logout: () => ipcRenderer.invoke('kenxcode:cloud:logout'),
    discover: org => ipcRenderer.invoke('kenxcode:cloud:discover', org),
    agentSignIn: dashboardUrl => ipcRenderer.invoke('kenxcode:cloud:agent-sign-in', dashboardUrl)
  },
  profile: {
    get: () => ipcRenderer.invoke('kenxcode:profile:get'),
    set: name => ipcRenderer.invoke('kenxcode:profile:set', name)
  },
  api: request => ipcRenderer.invoke('kenxcode:api', request),
  notify: payload => ipcRenderer.invoke('kenxcode:notify', payload),
  requestMicrophoneAccess: () => ipcRenderer.invoke('kenxcode:requestMicrophoneAccess'),
  readFileDataUrl: filePath => ipcRenderer.invoke('kenxcode:readFileDataUrl', filePath),
  readFileDataUrlForAttach: filePath => ipcRenderer.invoke('kenxcode:readFileDataUrlForAttach', filePath),
  dataUrlReadMax: {
    get: () => ipcRenderer.invoke('kenxcode:data-url-read-max:get'),
    set: maxMb => ipcRenderer.invoke('kenxcode:data-url-read-max:set', maxMb)
  },
  readFileText: filePath => ipcRenderer.invoke('kenxcode:readFileText', filePath),
  selectPaths: options => ipcRenderer.invoke('kenxcode:selectPaths', options),
  writeClipboard: text => ipcRenderer.invoke('kenxcode:writeClipboard', text),
  readClipboard: () => ipcRenderer.invoke('kenxcode:readClipboard'),
  saveImageFromUrl: url => ipcRenderer.invoke('kenxcode:saveImageFromUrl', url),
  saveImageBuffer: (data, ext) => ipcRenderer.invoke('kenxcode:saveImageBuffer', { data, ext }),
  saveClipboardImage: () => ipcRenderer.invoke('kenxcode:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('kenxcode:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('kenxcode:watchPreviewFile', url),
  watchDirectory: dir => ipcRenderer.invoke('kenxcode:watchDirectory', dir),
  stopPreviewFileWatch: id => ipcRenderer.invoke('kenxcode:stopPreviewFileWatch', id),
  setActiveWork: payload => ipcRenderer.send('kenxcode:active-work', payload),
  setTitleBarTheme: payload => ipcRenderer.send('kenxcode:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('kenxcode:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('kenxcode:translucency', payload),
  setKeepAwake: on => ipcRenderer.send('kenxcode:keep-awake', on),
  setPreviewShortcutActive: active => ipcRenderer.send('kenxcode:previewShortcutActive', Boolean(active)),
  openExternal: url => ipcRenderer.invoke('kenxcode:openExternal', url),
  openPreviewInBrowser: url => ipcRenderer.invoke('kenxcode:openPreviewInBrowser', url),
  fetchLinkTitle: url => ipcRenderer.invoke('kenxcode:fetchLinkTitle', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('kenxcode:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('kenxcode:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('kenxcode:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('kenxcode:setting:defaultProjectDir:pick')
  },
  zoom: {
    // Current zoom of this window, as { level, percent }.
    get: () => ipcRenderer.invoke('kenxcode:zoom:get'),
    setPercent: percent => ipcRenderer.send('kenxcode:zoom:set-percent', percent),
    // Fires on every zoom change, including the Ctrl/Cmd +/-/0 shortcuts,
    // so the settings UI can stay in sync with the keyboard.
    onChanged: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:zoom:changed', listener)

      return () => ipcRenderer.removeListener('kenxcode:zoom:changed', listener)
    }
  },
  revealLogs: () => ipcRenderer.invoke('kenxcode:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('kenxcode:logs:recent'),
  readDir: dirPath => ipcRenderer.invoke('kenxcode:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('kenxcode:fs:gitRoot', startPath),
  revealPath: targetPath => ipcRenderer.invoke('kenxcode:fs:reveal', targetPath),
  openDir: dirPath => ipcRenderer.invoke('kenxcode:fs:openDir', dirPath),
  desktopPluginsRoot: () => ipcRenderer.invoke('kenxcode:fs:desktopPluginsRoot'),
  renamePath: (targetPath, newName) => ipcRenderer.invoke('kenxcode:fs:rename', targetPath, newName),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('kenxcode:fs:writeText', filePath, content),
  trashPath: targetPath => ipcRenderer.invoke('kenxcode:fs:trash', targetPath),
  git: {
    worktreeList: repoPath => ipcRenderer.invoke('kenxcode:git:worktreeList', repoPath),
    worktreeAdd: (repoPath, options) => ipcRenderer.invoke('kenxcode:git:worktreeAdd', repoPath, options),
    worktreeRemove: (repoPath, worktreePath, options) =>
      ipcRenderer.invoke('kenxcode:git:worktreeRemove', repoPath, worktreePath, options),
    branchSwitch: (repoPath, branch) => ipcRenderer.invoke('kenxcode:git:branchSwitch', repoPath, branch),
    branchList: repoPath => ipcRenderer.invoke('kenxcode:git:branchList', repoPath),
    baseBranchList: repoPath => ipcRenderer.invoke('kenxcode:git:baseBranchList', repoPath),
    repoStatus: repoPath => ipcRenderer.invoke('kenxcode:git:repoStatus', repoPath),
    fileDiff: (repoPath, filePath) => ipcRenderer.invoke('kenxcode:git:fileDiff', repoPath, filePath),
    scanRepos: (roots, options) => ipcRenderer.invoke('kenxcode:git:scanRepos', roots, options),
    review: {
      list: (repoPath, scope, baseRef) => ipcRenderer.invoke('kenxcode:git:review:list', repoPath, scope, baseRef),
      diff: (repoPath, filePath, scope, baseRef, staged) =>
        ipcRenderer.invoke('kenxcode:git:review:diff', repoPath, filePath, scope, baseRef, staged),
      stage: (repoPath, filePath) => ipcRenderer.invoke('kenxcode:git:review:stage', repoPath, filePath),
      unstage: (repoPath, filePath) => ipcRenderer.invoke('kenxcode:git:review:unstage', repoPath, filePath),
      revert: (repoPath, filePath) => ipcRenderer.invoke('kenxcode:git:review:revert', repoPath, filePath),
      revParse: (repoPath, ref) => ipcRenderer.invoke('kenxcode:git:review:revParse', repoPath, ref),
      commit: (repoPath, message, push) => ipcRenderer.invoke('kenxcode:git:review:commit', repoPath, message, push),
      commitContext: repoPath => ipcRenderer.invoke('kenxcode:git:review:commitContext', repoPath),
      push: repoPath => ipcRenderer.invoke('kenxcode:git:review:push', repoPath),
      shipInfo: repoPath => ipcRenderer.invoke('kenxcode:git:review:shipInfo', repoPath),
      createPr: repoPath => ipcRenderer.invoke('kenxcode:git:review:createPr', repoPath)
    }
  },
  terminal: {
    cwd: id => ipcRenderer.invoke('kenxcode:terminal:cwd', id),
    dispose: id => ipcRenderer.invoke('kenxcode:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('kenxcode:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('kenxcode:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('kenxcode:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `kenxcode:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `kenxcode:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('kenxcode:close-preview-requested', listener)

    return () => ipcRenderer.removeListener('kenxcode:close-preview-requested', listener)
  },
  onOpenFolderRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('kenxcode:open-folder-requested', listener)

    return () => ipcRenderer.removeListener('kenxcode:open-folder-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('kenxcode:open-updates', listener)

    return () => ipcRenderer.removeListener('kenxcode:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:deep-link', listener)

    return () => ipcRenderer.removeListener('kenxcode:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('kenxcode:deep-link-ready'),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:window-state-changed', listener)

    return () => ipcRenderer.removeListener('kenxcode:window-state-changed', listener)
  },
  onFocusSession: callback => {
    const listener = (_event, sessionId) => callback(sessionId)
    ipcRenderer.on('kenxcode:focus-session', listener)

    return () => ipcRenderer.removeListener('kenxcode:focus-session', listener)
  },
  onNotificationAction: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:notification-action', listener)

    return () => ipcRenderer.removeListener('kenxcode:notification-action', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:preview-file-changed', listener)

    return () => ipcRenderer.removeListener('kenxcode:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:backend-exit', listener)

    return () => ipcRenderer.removeListener('kenxcode:backend-exit', listener)
  },
  // Soft gateway-mode apply finished tearing down the primary backend. Renderer
  // should wipe session lists + re-dial without a window reload.
  onConnectionApplied: callback => {
    const listener = () => callback()
    ipcRenderer.on('kenxcode:connection:applied', listener)

    return () => ipcRenderer.removeListener('kenxcode:connection:applied', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('kenxcode:power-resume', listener)

    return () => ipcRenderer.removeListener('kenxcode:power-resume', listener)
  },
  // AC ↔ battery transitions; renderers slow their backstop polls on battery.
  getOnBattery: () => ipcRenderer.invoke('kenxcode:power-battery:get'),
  onBatteryChanged: callback => {
    const listener = (_event, onBattery) => callback(Boolean(onBattery))
    ipcRenderer.on('kenxcode:power-battery', listener)

    return () => ipcRenderer.removeListener('kenxcode:power-battery', listener)
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:boot-progress', listener)

    return () => ipcRenderer.removeListener('kenxcode:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.ts (apps/desktop/electron/bootstrap-runner.ts).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('kenxcode:bootstrap:get'),
  continueBootstrapLocal: () => ipcRenderer.invoke('kenxcode:bootstrap:continue-local'),
  resetBootstrap: () => ipcRenderer.invoke('kenxcode:bootstrap:reset'),
  repairBootstrap: () => ipcRenderer.invoke('kenxcode:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('kenxcode:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('kenxcode:bootstrap:event', listener)

    return () => ipcRenderer.removeListener('kenxcode:bootstrap:event', listener)
  },
  getVersion: () => ipcRenderer.invoke('kenxcode:version'),
  getRemoteDisplayReason: () => ipcRenderer.invoke('kenxcode:get-remote-display-reason'),
  uninstall: {
    summary: () => ipcRenderer.invoke('kenxcode:uninstall:summary'),
    run: mode => ipcRenderer.invoke('kenxcode:uninstall:run', { mode })
  },
  updates: {
    check: () => ipcRenderer.invoke('kenxcode:updates:check'),
    apply: opts => ipcRenderer.invoke('kenxcode:updates:apply', opts),
    getBranch: () => ipcRenderer.invoke('kenxcode:updates:branch:get'),
    setBranch: name => ipcRenderer.invoke('kenxcode:updates:branch:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('kenxcode:updates:progress', listener)

      return () => ipcRenderer.removeListener('kenxcode:updates:progress', listener)
    }
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('kenxcode:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('kenxcode:vscode-theme:search', query)
  },
  // Find-in-page (Ctrl/Cmd+F): delegates to Electron's
  // webContents.findInPage on the IPC sender's window so a Cmd+F pressed
  // in a secondary session window searches THAT window, not the primary.
  // `onFoundInPage` returns the unsubscribe fn; the renderer wires it via
  // `initFindInPageListener` in store/find-in-page.ts and tears it down
  // when the FindBar unmounts.
  findInPage: (query, options) => ipcRenderer.invoke('kenxcode:find-in-page', query, options),
  stopFindInPage: () => ipcRenderer.invoke('kenxcode:stop-find-in-page'),
  onFoundInPage: callback => {
    const listener = (_event, result) => callback(result)
    ipcRenderer.on('kenxcode:found-in-page', listener)

    return () => ipcRenderer.removeListener('kenxcode:found-in-page', listener)
  }
})
