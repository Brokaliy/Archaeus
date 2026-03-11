// Archaeus Control Center — Desktop Tab

const DES = [
  {
    id: "hyprland",
    name: "Hyprland",
    desc: "Tiling Wayland compositor. Fast, modern, highly configurable.",
    preview: "#1C1610",
    accent: "#C8A96E",
  },
  {
    id: "plasma",
    name: "KDE Plasma",
    desc: "Full-featured desktop environment. Familiar and polished.",
    preview: "#1B1E2E",
    accent: "#7AA2F7",
  },
  {
    id: "gnome",
    name: "GNOME",
    desc: "Clean, minimal desktop. Great for touch and HiDPI displays.",
    preview: "#241F31",
    accent: "#9BC0E9",
  },
];

const Desktop = {
  rendered: false,
  currentDE: "hyprland",

  async render() {
    const tab = document.getElementById("tab-desktop");
    if (this.rendered) return;
    this.rendered = true;

    // Read current DE from config
    try {
      const res = await window.acc.run("cat ~/.config/archaeus/default-de 2>/dev/null || echo hyprland");
      this.currentDE = res.stdout.trim() || "hyprland";
    } catch (_) {}

    tab.innerHTML = `
      <div class="page-header">
        <div class="page-title">Desktop Environment</div>
        <div class="page-subtitle">Switch your desktop. Packages will be installed automatically.</div>
      </div>

      <div class="de-grid">
        ${DES.map((de) => `
          <div class="de-card${this.currentDE === de.id ? " active" : ""}" data-de="${de.id}">
            <div class="de-preview" style="background: ${de.preview};">
              <!-- Mini DE preview -->
              <div style="position:absolute;bottom:8px;left:8px;right:8px;height:6px;
                background:${de.accent};opacity:0.4;border-radius:3px;"></div>
              <div style="position:absolute;top:8px;left:8px;right:8px;height:3px;
                background:${de.accent};opacity:0.25;border-radius:2px;"></div>
            </div>
            <div class="de-name">${de.name}${this.currentDE === de.id ? ' <span style="color:var(--accent);font-size:11px;">● Active</span>' : ""}</div>
            <div class="de-desc">${de.desc}</div>
          </div>
        `).join("")}
      </div>

      <div id="de-action" style="margin-top:8px;"></div>
    `;

    // Make cards clickable
    tab.querySelectorAll(".de-card").forEach((card) => {
      card.addEventListener("click", () => this.selectDE(card.dataset.de));
    });
  },

  selectDE(id) {
    if (id === this.currentDE) return;
    const de = DES.find((d) => d.id === id);
    const actionDiv = document.getElementById("de-action");

    actionDiv.innerHTML = `
      <div style="background:var(--bg-surface);border:1px solid var(--border);
        border-radius:var(--radius);padding:20px;">
        <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px;">
          Switch to ${de.name}?
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">
          Required packages will be installed. You'll need to log out to apply the change.
        </div>
        <div style="display:flex;gap:10px;">
          <button id="de-confirm" class="pkg-btn install" style="width:120px;padding:8px 0;font-size:13px;">
            Switch
          </button>
          <button id="de-cancel" class="pkg-btn" style="width:80px;padding:8px 0;font-size:13px;
            background:transparent;color:var(--text-muted);border:1px solid var(--border);">
            Cancel
          </button>
        </div>
        <div class="progress-log" id="de-log"></div>
      </div>
    `;

    document.getElementById("de-cancel").onclick = () => {
      actionDiv.innerHTML = "";
    };

    document.getElementById("de-confirm").onclick = async () => {
      const confirmBtn = document.getElementById("de-confirm");
      const cancelBtn = document.getElementById("de-cancel");
      const log = document.getElementById("de-log");
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      confirmBtn.textContent = "Installing...";
      log.classList.add("visible");

      window.acc.onPkgProgress(({ line }) => {
        log.textContent += line;
        log.scrollTop = log.scrollHeight;
      });

      const result = await window.acc.switchDE(id);

      window.acc.offPkgProgress();

      if (result.ok) {
        this.currentDE = id;
        toast(`Switched to ${de.name}. Log out to apply.`, "success");
        actionDiv.innerHTML = "";
        // Re-render to update active state
        this.rendered = false;
        Desktop.render();
      } else {
        toast("Switch failed: " + (result.error || "unknown error"), "error");
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        confirmBtn.textContent = "Retry";
      }
    };
  },
};
