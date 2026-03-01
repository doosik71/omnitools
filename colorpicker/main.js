const colorText = document.getElementById("color-text");
const hexText = document.getElementById("hex-text");
const rgbText = document.getElementById("rgb-text");
const copyHexText = document.getElementById("copy-hex-text");
const copyRgbText = document.getElementById("copy-rgb-text");

const colorBg = document.getElementById("color-bg");
const hexBg = document.getElementById("hex-bg");
const rgbBg = document.getElementById("rgb-bg");
const copyHexBg = document.getElementById("copy-hex-bg");
const copyRgbBg = document.getElementById("copy-rgb-bg");

const preview = document.getElementById("preview");
const swapBtn = document.getElementById("swap-btn");
function hexToRgb(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function updateTextValues(v) {
  const val = v.toLowerCase();
  // sync picker itself
  colorText.value = val;
  hexText.value = val;
  rgbText.value = hexToRgb(val);
  updatePreview();
  syncUrl();
}

function updateBgValues(v) {
  const val = v.toLowerCase();
  colorBg.value = val;
  hexBg.value = val;
  rgbBg.value = hexToRgb(val);
  updatePreview();
  syncUrl();
}

function copy(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function updatePreview() {
  if (!preview) return;
  preview.style.color = hexText.value || "#000";
  preview.style.backgroundColor = hexBg.value || "#fff";
}

function syncUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set("text", hexText.value);
    params.set("bg", hexBg.value);
    const newUrl = window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newUrl);
  } catch (e) {
    /* ignore */
  }
}

colorText.addEventListener("input", (e) => updateTextValues(e.target.value));
copyHexText.addEventListener("click", () => copy(hexText.value));
copyRgbText.addEventListener("click", () => copy(rgbText.value));

colorBg.addEventListener("input", (e) => updateBgValues(e.target.value));
copyHexBg.addEventListener("click", () => copy(hexBg.value));
copyRgbBg.addEventListener("click", () => copy(rgbBg.value));

// initialize
// if URL has query params, apply them first
try {
  const params = new URLSearchParams(window.location.search);
  const t = params.get("text");
  const b = params.get("bg");
  if (t && /^#?[0-9a-fA-F]{6}$/.test(t.trim())) {
    const v = t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`;
    colorText.value = v.toLowerCase();
  }
  if (b && /^#?[0-9a-fA-F]{6}$/.test(b.trim())) {
    const v = b.trim().startsWith("#") ? b.trim() : `#${b.trim()}`;
    colorBg.value = v.toLowerCase();
  }
} catch (e) {}

updateTextValues(colorText.value);
updateBgValues(colorBg.value);

// swap button handler: exchange text and background colors
if (swapBtn) {
  swapBtn.addEventListener("click", () => {
    const t = hexText.value;
    const b = hexBg.value;
    colorText.value = b;
    colorBg.value = t;
    updateTextValues(b);
    updateBgValues(t);
  });
}

// track last-target (text or bg) for color name clicks
let lastTarget = "text";
colorText.addEventListener("focus", () => (lastTarget = "text"));
colorBg.addEventListener("focus", () => (lastTarget = "bg"));

// load color name list (CSV) and attach click handlers
fetch("color_names.csv")
  .then((res) => res.text())
  .then((txt) => {
    const container = document.getElementById("color-list");
    if (!container) return;

    const lines = txt.split("\n");
    // skip header
    lines.slice(1).forEach((line) => {
      const [nameRaw, hexRaw] = line.split(",");
      if (!nameRaw || !hexRaw) return;
      const name = nameRaw.trim();
      const hex = hexRaw.trim();
      // ensure format #rrggbb (allow without # too)
      const hexVal = hex.startsWith("#") ? hex : `#${hex}`;
      if (!/^#[0-9a-fA-F]{6}$/.test(hexVal)) return;
      const item = document.createElement("div");
      item.className = "color-item";
      item.style.backgroundColor = hexVal;
      item.textContent = name;
      item.title = name + " " + hexVal;
      item.addEventListener("click", () => {
        const h = hexVal.toLowerCase();
        if (lastTarget === "bg") {
          colorBg.value = h;
          updateBgValues(h);
        } else {
          colorText.value = h;
          updateTextValues(h);
        }
      });
      container.appendChild(item);
    });
  })
  .catch(() => {});
