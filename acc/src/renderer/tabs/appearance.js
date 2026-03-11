// Archaeus Control Center — Appearance Tab

const ACCENT_COLORS = [
  { name: "Amber",    value: "#C8A96E" },
  { name: "Rose",     value: "#C25B4A" },
  { name: "Sage",     value: "#7A9E6E" },
  { name: "Steel",    value: "#6B8FAB" },
  { name: "Lavender", value: "#A67B9B" },
  { name: "Teal",     value: "#6FA89E" },
  { name: "Peach",    value: "#D4845A" },
];

const Appearance = {
  rendered: false,

  render() {
    const tab = document.getElementById("tab-appearance");
    if (this.rendered) return;
    this.rendered = true;

    tab.innerHTML = `
      <div class="page-header">
        <div class="page-title">Appearance</div>
        <div class="page-subtitle">Customize the look of your system</div>
      </div>

      <div class="section-label">Accent Color</div>
      <div class="color-row" id="accent-colors"></div>

      <div class="section-label">Wallpaper</div>
      <div style="margin-bottom:16px;">
        <button class="pkg-btn install" style="width:auto;padding:8px 20px;font-size:13px;" id="wallpaper-pick">
          Choose Wallpaper
        </button>
        <span style="margin-left:12px;font-size:12px;color:var(--text-muted);" id="wallpaper-path">
          Current: default
        </span>
      </div>

      <div class="section-label">Font</div>
      <select id="font-select" style="
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text);
        font-family: var(--font);
        font-size: 13px;
        padding: 8px 12px;
        width: 220px;
        outline: none;
      ">
        <option value="Inter">Inter (default)</option>
        <option value="JetBrains Mono">JetBrains Mono</option>
        <option value="Noto Sans">Noto Sans</option>
        <option value="Geist">Geist</option>
      </select>
    `;

    // Accent colors
    const colorRow = document.getElementById("accent-colors");
    ACCENT_COLORS.forEach((c) => {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.background = c.value;
      swatch.title = c.name;
      swatch.onclick = () => {
        colorRow.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
        swatch.classList.add("active");
        this.applyAccent(c.value);
      };
      colorRow.appendChild(swatch);
    });

    // Wallpaper picker — uses file input trick
    document.getElementById("wallpaper-pick").onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const pathEl = document.getElementById("wallpaper-path");
        pathEl.textContent = `Setting: ${file.name}...`;
        const result = await window.acc.setWallpaper(file.path);
        if (result.ok) {
          pathEl.textContent = `Current: ${file.name}`;
          toast("Wallpaper updated", "success");
        } else {
          toast("Failed to set wallpaper", "error");
        }
      };
      input.click();
    };
  },

  applyAccent(color) {
    // Update CSS variable live
    document.documentElement.style.setProperty("--accent", color);
    // Persist to hyprland config (simplified — real impl would parse/replace)
    window.acc.run(`sed -i 's/col.active_border = .*/col.active_border = rgba(${color.slice(1)}ff)/' ~/.config/hypr/hyprland.conf`);
    toast("Accent color updated", "success");
  },
};
