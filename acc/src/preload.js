const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("acc", {
  // Window
  close: () => ipcRenderer.send("win:close"),
  minimize: () => ipcRenderer.send("win:minimize"),

  // Shell
  run: (cmd) => ipcRenderer.invoke("shell:run", cmd),

  // Packages
  install: (pkg) => ipcRenderer.invoke("pkg:install", pkg),
  remove: (pkg) => ipcRenderer.invoke("pkg:remove", pkg),
  isInstalled: (pkg) => ipcRenderer.invoke("pkg:isInstalled", pkg),
  onPkgProgress: (cb) => ipcRenderer.on("pkg:progress", (_, data) => cb(data)),
  offPkgProgress: () => ipcRenderer.removeAllListeners("pkg:progress"),

  // Desktop environment
  switchDE: (de) => ipcRenderer.invoke("de:switch", de),

  // Keybinds
  getKeybinds: () => ipcRenderer.invoke("keybinds:get"),

  // Autostart
  getAutostart: () => ipcRenderer.invoke("autostart:get"),
  toggleAutostart: (file, enabled) => ipcRenderer.invoke("autostart:toggle", file, enabled),

  // Wallpaper
  setWallpaper: (path) => ipcRenderer.invoke("wallpaper:set", path),
});
