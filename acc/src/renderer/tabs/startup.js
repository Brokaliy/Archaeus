// Archaeus Control Center — Startup Tab

const Startup = {
  rendered: false,

  async render() {
    const tab = document.getElementById("tab-startup");
    if (this.rendered) return;
    this.rendered = true;

    tab.innerHTML = `
      <div class="page-header">
        <div class="page-title">Startup Apps</div>
        <div class="page-subtitle">Choose what launches when you log in</div>
      </div>
      <div id="startup-list"><div style="color:var(--text-muted);font-size:13px;">Loading...</div></div>
    `;

    await this.load();
  },

  async load() {
    const result = await window.acc.getAutostart();
    const list = document.getElementById("startup-list");

    if (!result.ok || result.entries.length === 0) {
      list.innerHTML = `<div style="color:var(--text-muted);font-size:13px;">No autostart entries found.</div>`;
      return;
    }

    list.innerHTML = result.entries.map((entry) => `
      <div class="toggle-row">
        <span class="toggle-label">${entry.name}</span>
        <label class="toggle">
          <input type="checkbox" ${entry.enabled ? "checked" : ""}
            onchange="Startup.toggle('${entry.file}', this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    `).join("");
  },

  async toggle(file, enabled) {
    await window.acc.toggleAutostart(file, enabled);
    toast(`${file.replace(".desktop", "")} ${enabled ? "enabled" : "disabled"}`, "success");
  },
};
