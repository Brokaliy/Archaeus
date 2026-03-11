const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 800,
    minHeight: 580,
    title: "Archaeus Control Center",
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "renderer/assets/icon.png"),
  });

  mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Window controls
ipcMain.on("win:close", () => mainWindow.close());
ipcMain.on("win:minimize", () => mainWindow.minimize());

// Run a shell command, stream output back to renderer
ipcMain.handle("shell:run", async (event, cmd) => {
  return new Promise((resolve) => {
    exec(cmd, { shell: "/bin/bash" }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout, stderr, code: err?.code });
    });
  });
});

// Install a package via yay
ipcMain.handle("pkg:install", async (event, pkgName) => {
  return new Promise((resolve) => {
    const child = spawn("yay", ["-S", "--noconfirm", pkgName], {
      shell: "/bin/bash",
      env: { ...process.env, TERM: "xterm" },
    });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
      mainWindow.webContents.send("pkg:progress", { pkg: pkgName, line: d.toString() });
    });
    child.stderr.on("data", (d) => {
      out += d.toString();
      mainWindow.webContents.send("pkg:progress", { pkg: pkgName, line: d.toString() });
    });
    child.on("close", (code) => {
      resolve({ ok: code === 0, output: out });
    });
  });
});

// Remove a package
ipcMain.handle("pkg:remove", async (event, pkgName) => {
  return new Promise((resolve) => {
    exec(`yay -Rs --noconfirm ${pkgName}`, { shell: "/bin/bash" }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout, stderr });
    });
  });
});

// Check if package is installed
ipcMain.handle("pkg:isInstalled", async (event, pkgName) => {
  return new Promise((resolve) => {
    exec(`pacman -Q ${pkgName} 2>/dev/null`, (err) => {
      resolve(!err);
    });
  });
});

// Switch desktop environment
ipcMain.handle("de:switch", async (event, deName) => {
  const dePackages = {
    hyprland: "hyprland hyprpaper waybar dunst rofi-wayland",
    plasma: "plasma-desktop sddm plasma-wayland-session",
    gnome: "gnome gnome-extra gdm",
  };
  const deSession = {
    hyprland: "hyprland",
    plasma: "plasmawayland",
    gnome: "gnome-wayland",
  };
  const pkgs = dePackages[deName];
  if (!pkgs) return { ok: false, error: "Unknown DE" };

  return new Promise((resolve) => {
    exec(
      `yay -S --noconfirm ${pkgs} && sudo systemctl set-default graphical.target`,
      { shell: "/bin/bash" },
      (err, stdout) => {
        if (err) return resolve({ ok: false, error: err.message });
        // Write DE choice to config
        fs.writeFileSync(
          `${process.env.HOME}/.config/archaeus/default-de`,
          deName
        );
        resolve({ ok: true });
      }
    );
  });
});

// Read/write hyprland keybinds
ipcMain.handle("keybinds:get", async () => {
  try {
    const conf = fs.readFileSync(
      `${process.env.HOME}/.config/hypr/hyprland.conf`,
      "utf8"
    );
    // Parse bind lines
    const binds = [];
    for (const line of conf.split("\n")) {
      const m = line.match(/^\s*bind\s*=\s*(.+),\s*(.+),\s*(.+)$/);
      if (m) binds.push({ mods: m[1].trim(), key: m[2].trim(), action: m[3].trim() });
    }
    return { ok: true, binds };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// Get autostart entries
ipcMain.handle("autostart:get", async () => {
  const dir = `${process.env.HOME}/.config/autostart`;
  if (!fs.existsSync(dir)) return { ok: true, entries: [] };
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".desktop"));
  const entries = files.map((f) => {
    const content = fs.readFileSync(`${dir}/${f}`, "utf8");
    const name = content.match(/Name=(.+)/)?.[1] || f.replace(".desktop", "");
    const enabled = !content.includes("Hidden=true");
    return { file: f, name, enabled };
  });
  return { ok: true, entries };
});

ipcMain.handle("autostart:toggle", async (event, file, enabled) => {
  const dir = `${process.env.HOME}/.config/autostart`;
  const filePath = `${dir}/${file}`;
  let content = fs.readFileSync(filePath, "utf8");
  if (enabled) {
    content = content.replace(/Hidden=true\n?/g, "");
  } else {
    content += "\nHidden=true\n";
  }
  fs.writeFileSync(filePath, content);
  return { ok: true };
});

// Wallpaper
ipcMain.handle("wallpaper:set", async (event, imagePath) => {
  const conf = `preload = ${imagePath}\nwallpaper = ,${imagePath}\nsplash = false\n`;
  const confPath = `${process.env.HOME}/.config/hypr/hyprpaper.conf`;
  fs.writeFileSync(confPath, conf);
  exec("pkill hyprpaper; sleep 0.2; hyprpaper &");
  return { ok: true };
});
