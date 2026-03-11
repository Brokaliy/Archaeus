// Archaeus Control Center — Packages Tab

const PACKAGES = [
  // Browsers
  { name: "Firefox",      pkg: "firefox",           icon: "🦊", category: "Browser" },
  { name: "Chromium",     pkg: "chromium",           icon: "🌐", category: "Browser" },
  { name: "Brave",        pkg: "brave-bin",          icon: "🦁", category: "Browser" },

  // Communication
  { name: "Discord",      pkg: "discord",            icon: "💬", category: "Chat" },
  { name: "Telegram",     pkg: "telegram-desktop",   icon: "✈️",  category: "Chat" },
  { name: "Signal",       pkg: "signal-desktop",     icon: "🔒", category: "Chat" },

  // Music / Media
  { name: "Spotify",      pkg: "spotify",            icon: "🎵", category: "Media" },
  { name: "VLC",          pkg: "vlc",                icon: "🎬", category: "Media" },
  { name: "MPV",          pkg: "mpv",                icon: "▶️",  category: "Media" },

  // Development
  { name: "VS Code",      pkg: "visual-studio-code-bin", icon: "💻", category: "Dev" },
  { name: "Neovim",       pkg: "neovim",             icon: "📝", category: "Dev" },
  { name: "Git",          pkg: "git",                icon: "🌿", category: "Dev" },
  { name: "Docker",       pkg: "docker",             icon: "🐳", category: "Dev" },
  { name: "Node.js",      pkg: "nodejs",             icon: "⬡",  category: "Dev" },
  { name: "Python",       pkg: "python",             icon: "🐍", category: "Dev" },

  // Gaming
  { name: "Steam",        pkg: "steam",              icon: "🎮", category: "Gaming" },
  { name: "Lutris",       pkg: "lutris",             icon: "🍷", category: "Gaming" },
  { name: "Heroic",       pkg: "heroic-games-launcher-bin", icon: "🦸", category: "Gaming" },
  { name: "Minecraft",    pkg: "prismlauncher",      icon: "⛏️",  category: "Gaming" },
  { name: "OBS",          pkg: "obs-studio",         icon: "🔴", category: "Gaming" },

  // Tools
  { name: "GIMP",         pkg: "gimp",               icon: "🎨", category: "Tools" },
  { name: "Inkscape",     pkg: "inkscape",           icon: "✏️",  category: "Tools" },
  { name: "Blender",      pkg: "blender",            icon: "🍊", category: "Tools" },
  { name: "Thunar",       pkg: "thunar",             icon: "📁", category: "Tools" },
  { name: "Flameshot",    pkg: "flameshot",          icon: "📸", category: "Tools" },
  { name: "Bitwarden",    pkg: "bitwarden",          icon: "🔑", category: "Tools" },
  { name: "Vesktop",      pkg: "vesktop-bin",        icon: "🎙️", category: "Chat" },
];

const CATEGORIES = ["All", ...new Set(PACKAGES.map((p) => p.category))];

let installedCache = {};
let activeCategory = "All";
let searchQuery = "";

const Packages = {
  rendered: false,

  async render() {
    const tab = document.getElementById("tab-packages");
    if (this.rendered) return;
    this.rendered = true;

    tab.innerHTML = `
      <div class="page-header">
        <div class="page-title">Packages</div>
        <div class="page-subtitle">Click to install or remove software</div>
      </div>

      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input type="text" id="pkg-search" placeholder="Search packages..." autocomplete="off" />
      </div>

      <div class="category-bar" id="category-bar"></div>

      <div class="pkg-grid" id="pkg-grid"></div>
      <div class="progress-log" id="pkg-log"></div>
    `;

    // Add category bar styles inline since it's specific to this tab
    const style = document.createElement("style");
    style.textContent = `
      .category-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
      .cat-btn { padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border);
        background: transparent; color: var(--text-muted); font-family: var(--font);
        font-size: 12px; cursor: pointer; transition: all 0.15s; }
      .cat-btn:hover { background: var(--bg-raised); color: var(--text); }
      .cat-btn.active { background: var(--bg-hover); color: var(--accent); border-color: var(--border-focus); }
    `;
    document.head.appendChild(style);

    // Categories
    const catBar = document.getElementById("category-bar");
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = `cat-btn${cat === activeCategory ? " active" : ""}`;
      btn.textContent = cat;
      btn.onclick = () => {
        activeCategory = cat;
        catBar.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.renderGrid();
      };
      catBar.appendChild(btn);
    });

    // Search
    document.getElementById("pkg-search").addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      this.renderGrid();
    });

    // Check installed status for all packages
    await this.refreshInstalled();
    this.renderGrid();

    // Listen for install progress
    window.acc.onPkgProgress(({ pkg, line }) => {
      const log = document.getElementById("pkg-log");
      log.classList.add("visible");
      log.textContent += line;
      log.scrollTop = log.scrollHeight;
    });
  },

  async refreshInstalled() {
    const checks = PACKAGES.map(async (p) => {
      installedCache[p.pkg] = await window.acc.isInstalled(p.pkg);
    });
    await Promise.all(checks);
  },

  renderGrid() {
    const grid = document.getElementById("pkg-grid");
    if (!grid) return;

    const filtered = PACKAGES.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.pkg.includes(searchQuery);
      return matchCat && matchSearch;
    });

    grid.innerHTML = filtered.map((p) => `
      <div class="pkg-card${installedCache[p.pkg] ? " installed" : ""}" data-pkg="${p.pkg}">
        <div class="pkg-icon-fallback">${p.icon}</div>
        <div class="pkg-name">${p.name}</div>
        <div class="pkg-status${installedCache[p.pkg] ? " installed" : ""}" id="status-${p.pkg}">
          ${installedCache[p.pkg] ? "Installed" : p.category}
        </div>
        <button
          class="pkg-btn ${installedCache[p.pkg] ? "remove" : "install"}"
          id="btn-${p.pkg}"
          onclick="Packages.toggle('${p.pkg}', '${p.name}')"
        >
          ${installedCache[p.pkg] ? "Remove" : "Install"}
        </button>
      </div>
    `).join("");
  },

  async toggle(pkg, name) {
    const btn = document.getElementById(`btn-${pkg}`);
    const status = document.getElementById(`status-${pkg}`);
    const isInstalled = installedCache[pkg];

    btn.disabled = true;
    btn.textContent = isInstalled ? "Removing..." : "Installing...";
    status.className = "pkg-status installing";
    status.textContent = isInstalled ? "Removing..." : "Installing...";

    const log = document.getElementById("pkg-log");
    log.textContent = "";
    log.classList.add("visible");

    const result = isInstalled
      ? await window.acc.remove(pkg)
      : await window.acc.install(pkg);

    if (result.ok) {
      installedCache[pkg] = !isInstalled;
      toast(`${name} ${isInstalled ? "removed" : "installed"} successfully`, "success");
    } else {
      toast(`Failed to ${isInstalled ? "remove" : "install"} ${name}`, "error");
    }

    this.renderGrid();
  },
};
