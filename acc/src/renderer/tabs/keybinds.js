// Archaeus Control Center — Keybinds Tab

const Keybinds = {
  rendered: false,

  async render() {
    const tab = document.getElementById("tab-keybinds");
    if (this.rendered) return;
    this.rendered = true;

    tab.innerHTML = `
      <div class="page-header">
        <div class="page-title">Keybinds</div>
        <div class="page-subtitle">Your Hyprland keybindings at a glance</div>
      </div>
      <div id="keybind-content"><div style="color:var(--text-muted);font-size:13px;">Loading...</div></div>
    `;

    const result = await window.acc.getKeybinds();
    const content = document.getElementById("keybind-content");

    if (!result.ok || !result.binds.length) {
      content.innerHTML = `<div style="color:var(--text-muted);font-size:13px;">Could not load keybinds. Is Hyprland configured?</div>`;
      return;
    }

    content.innerHTML = `
      <table class="keybind-table">
        <thead>
          <tr>
            <th>Modifiers</th>
            <th>Key</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${result.binds.map((b) => `
            <tr>
              <td>${b.mods.split(",").map((m) => `<span class="kbd">${m.trim()}</span>`).join(" + ")}</td>
              <td><span class="kbd">${b.key}</span></td>
              <td style="color:var(--text);">${b.action}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  },
};
