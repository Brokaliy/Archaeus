// Archaeus Control Center — App entry point

// Tab switching
const navItems = document.querySelectorAll(".nav-item");
const tabs = document.querySelectorAll(".tab");

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    navItems.forEach((b) => b.classList.remove("active"));
    tabs.forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${target}`).classList.add("active");

    // Lazy-load tab content
    if (target === "packages") Packages.render();
    if (target === "desktop") Desktop.render();
    if (target === "appearance") Appearance.render();
    if (target === "startup") Startup.render();
    if (target === "keybinds") Keybinds.render();
  });
});

// Window controls
document.getElementById("btn-close").addEventListener("click", () => window.acc.close());
document.getElementById("btn-minimize").addEventListener("click", () => window.acc.minimize());

// Toast helper
window.toast = function (msg, type = "default") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// Initial render
Packages.render();
