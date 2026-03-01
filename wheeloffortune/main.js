// State
const state = {
  items: [],
  rotation: 0,
  isSpinning: false,
  holdStartTime: null,
  spinVelocity: 0,
  wheelRadius: 240,
};
const ITEMS_QUERY_KEY = "items";

// Color palette for wheel segments
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8B88B",
  "#85C1E9",
  "#F5B041",
  "#52C9D8",
];

// DOM elements
const itemsInput = document.getElementById("itemsInput");
const loadBtn = document.getElementById("loadBtn");
const spinBtn = document.getElementById("spinBtn");
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const resultDisplay = document.getElementById("result");

// Initialize
function init() {
  setupEventListeners();
  hydrateItemsFromQuery();
  drawWheel();
}

// Event listeners
function setupEventListeners() {
  loadBtn.addEventListener("click", loadItems);
  spinBtn.addEventListener("mousedown", onSpinButtonDown);
  spinBtn.addEventListener("touchstart", onSpinButtonDown);
  document.addEventListener("mouseup", onSpinButtonUp);
  document.addEventListener("touchend", onSpinButtonUp);

  // Debounce textarea input
  let debounceTimer;
  itemsInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateItemsPreview();
    }, 300);
  });
}

// Load items from textarea
function loadItems() {
  const text = itemsInput.value.trim();
  if (!text) {
    alert("항목을 입력하세요");
    return;
  }

  state.items = parseItems(text);

  if (state.items.length < 2) {
    alert("최소 2개 이상의 항목이 필요합니다");
    state.items = [];
    return;
  }

  syncItemsToQuery(text);
  spinBtn.disabled = false;
  state.rotation = 0;
  resultDisplay.textContent = `${state.items.length}개 항목이 로드되었습니다`;
  drawWheel();
}

// Update preview as user types
function updateItemsPreview() {
  const text = itemsInput.value.trim();
  const items = parseItems(text);
  if (items.length >= 2) {
    resultDisplay.textContent = `${items.length}개 항목 준비됨`;
  }
}

function parseItems(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function syncItemsToQuery(text) {
  const normalized = parseItems(text).join(",");
  const params = new URLSearchParams(window.location.search);

  if (normalized.length > 0) {
    params.set(ITEMS_QUERY_KEY, encodeURIComponent(normalized));
  } else {
    params.delete(ITEMS_QUERY_KEY);
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function hydrateItemsFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(ITEMS_QUERY_KEY);
  if (!encoded) return;

  let decoded;
  try {
    decoded = decodeURIComponent(encoded);
  } catch (error) {
    decoded = encoded;
  }

  itemsInput.value = decoded;
  const parsed = parseItems(decoded);

  if (parsed.length >= 2) {
    state.items = parsed;
    spinBtn.disabled = false;
    state.rotation = 0;
    resultDisplay.textContent = `${state.items.length}개 항목이 로드되었습니다`;
  }
}

// Spin button mouse down
function onSpinButtonDown(e) {
  if (state.isSpinning || state.items.length === 0) return;

  state.holdStartTime = Date.now();
  spinBtn.style.transform = "scale(0.95)";
}

// Spin button mouse up
function onSpinButtonUp(e) {
  if (!state.holdStartTime || state.isSpinning) return;

  const holdTime = Date.now() - state.holdStartTime;
  state.holdStartTime = null;
  spinBtn.style.transform = "";

  // Speed based on hold time: min 5 rotations/sec, max 20 rotations/sec
  // Hold time in ms maps to velocity
  const minHold = 100; // 100ms for min speed
  const maxHold = 1500; // 1500ms for max speed
  const clampedHold = Math.max(minHold, Math.min(maxHold, holdTime));
  const speedRatio = (clampedHold - minHold) / (maxHold - minHold);

  // Linear interpolation: 5 to 20 rotations per second
  const rotationsPerSec = 5 + speedRatio * 15;
  state.spinVelocity = (rotationsPerSec * 360) / 1000; // degrees per millisecond

  startSpin();
}

// Start spinning animation
function startSpin() {
  state.isSpinning = true;
  spinBtn.disabled = true;

  let lastTime = Date.now();

  function animate() {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    // Deceleration: exponential decay
    // Velocity decreases to 10% per second (you can adjust the multiplier)
    const decelerationFactor = Math.pow(0.1, deltaTime / 3000);
    state.spinVelocity *= decelerationFactor;

    // Update rotation
    state.rotation += state.spinVelocity * deltaTime;
    state.rotation %= 360; // Normalize to 0-360

    drawWheel();

    // Stop spinning when velocity is very small
    if (state.spinVelocity > 0.01) {
      requestAnimationFrame(animate);
    } else {
      // Snap to nearest segment
      state.isSpinning = false;
      spinBtn.disabled = false;
      state.spinVelocity = 0;
      showResult();
    }
  }

  animate();
}

// Draw the wheel
function drawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = state.wheelRadius;

  // Clear canvas
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.items.length === 0) {
    ctx.fillStyle = "#ccc";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("항목을 먼저 로드하세요", centerX, centerY);
    return;
  }

  // Draw segments
  const segmentAngle = 360 / state.items.length;

  state.items.forEach((item, index) => {
    const startAngle =
      (index * segmentAngle - 90 + state.rotation) * (Math.PI / 180);
    const endAngle =
      ((index + 1) * segmentAngle - 90 + state.rotation) * (Math.PI / 180);

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    const midAngle = (startAngle + endAngle) / 2;
    const textX = centerX + Math.cos(midAngle) * (radius * 0.65);
    const textY = centerY + Math.sin(midAngle) * (radius * 0.65);

    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(midAngle + Math.PI / 2);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Wrap text if needed
    const maxWidth = radius * 0.4;
    wrapText(ctx, item, 0, 0, maxWidth, 16);

    ctx.restore();
  });

  // Draw circle border
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Optional: Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();
}

// Helper function to wrap text in canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  words.forEach((word, index) => {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && line !== "") {
      ctx.fillText(line, x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line !== "") {
    ctx.fillText(line, x, y);
  }
}

// Show result
function showResult() {
  if (state.items.length === 0) return;

  // The pointer is at 12 o'clock (top), which corresponds to rotation angle 0
  // We need to find which segment is at this position
  const segmentAngle = 360 / state.items.length;

  // Normalize rotation to 0-360
  const normalizedRotation = state.rotation % 360;

  // Calculate which segment is at the top (12 o'clock position)
  // Since segments start at -90° and go clockwise with our drawing, we adjust
  const selectedIndex =
    Math.floor((360 - normalizedRotation) / segmentAngle) % state.items.length;
  const selectedItem = state.items[selectedIndex];

  resultDisplay.textContent = `🎯 ${selectedItem}`;
  resultDisplay.style.color = colors[selectedIndex % colors.length];
}

// Initialize on load
window.addEventListener("DOMContentLoaded", init);
