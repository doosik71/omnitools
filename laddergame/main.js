// 상태 관리
let state = {
  ladderCount: 4,
  complexity: 5,
  topInputs: [],
  bottomInputs: [],
  hash: null,
  seed: null,
  ladderStructure: null,
  results: null,
};

// DOM 요소
const ladderCountInput = document.getElementById("ladderCount");
const countDisplay = document.getElementById("countDisplay");
const complexityInput = document.getElementById("complexity");
const complexityDisplay = document.getElementById("complexityDisplay");
const generateBtn = document.getElementById("generateBtn");
const topInputsContainer = document.getElementById("topInputs");
const bottomInputsContainer = document.getElementById("bottomInputs");
const canvas = document.getElementById("ladderCanvas");
const ctx = canvas.getContext("2d");
const resultsSection = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const shareUrlInput = document.getElementById("shareUrl");
const copyBtn = document.getElementById("copyBtn");

// 색상 배열 (사다리별 색상)
const colors = [
  "#E6194B", // Red
  "#3CB44B", // Green
  "#4363D8", // Blue
  "#F58231", // Orange
  "#911EB4", // Purple
  "#46F0F0", // Cyan
  "#F032E6", // Magenta
  "#BCF60C", // Lime
  "#FABEBE", // Pink
  "#008080", // Teal
];

// 라벨 기본값 헬퍼
function getTopLabel(idx) {
  return state.topInputs[idx] || `${idx + 1}`;
}
function getBottomLabel(idx) {
  return state.bottomInputs[idx] || `도착 ${idx + 1}`;
}

// 초기화
function init() {
  loadStateFromURL();
  updateInputs();
  setupEventListeners();
  // if ladder structure was preloaded via URL, draw and enable Go
  if (state.ladderStructure) {
    drawLadder();
    document.querySelectorAll(".go-btn").forEach((b) => (b.disabled = false));
  }
  updateURL();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  ladderCountInput.addEventListener("change", (e) => {
    state.ladderCount = parseInt(e.target.value);
    countDisplay.textContent = `${state.ladderCount}개`;
    updateInputs();
  });

  complexityInput.addEventListener("input", (e) => {
    state.complexity = parseInt(e.target.value);
    complexityDisplay.textContent = state.complexity;
  });

  generateBtn.addEventListener("click", generateLadder);
  copyBtn.addEventListener("click", copyURL);

  // 입력 상자 변경 감지
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("top-input")) {
      state.topInputs = Array.from(
        topInputsContainer.querySelectorAll("input"),
      ).map((input) => input.value);
      updateURL();
    }
    if (e.target.classList.contains("bottom-input")) {
      state.bottomInputs = Array.from(
        bottomInputsContainer.querySelectorAll("input"),
      ).map((input) => input.value);
      updateURL();
    }
  });
}

// 입력 상자 생성/업데이트
function updateInputs() {
  // 상단 입력 상자 (각 입력 옆에 Go 버튼 포함)
  topInputsContainer.innerHTML = "";
  for (let i = 0; i < state.ladderCount; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "top-entry";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `출발 ${i + 1}`;
    input.className = "top-input";
    input.value = state.topInputs[i] || "";

    const goBtn = document.createElement("button");
    goBtn.className = "btn btn-success go-btn";
    goBtn.textContent = "Go";
    goBtn.disabled = true; // 초기에는 비활성화
    goBtn.addEventListener("click", () => goLadder(i));

    wrapper.appendChild(input);
    wrapper.appendChild(goBtn);
    topInputsContainer.appendChild(wrapper);
  }

  // 하단 입력 상자
  bottomInputsContainer.innerHTML = "";
  for (let i = 0; i < state.ladderCount; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `도착 ${i + 1}`;
    input.className = "bottom-input";
    input.value = state.bottomInputs[i] || "";
    bottomInputsContainer.appendChild(input);
  }

  // 상단/하단 입력값 상태에 저장
  state.topInputs = Array.from(
    topInputsContainer.querySelectorAll("input"),
  ).map((input) => input.value);
  state.bottomInputs = Array.from(
    bottomInputsContainer.querySelectorAll("input"),
  ).map((input) => input.value);

  // 캔버스 크기 조정
  const width = Math.max(900, (state.ladderCount - 1) * 100 + 200);
  canvas.width = width;
  canvas.height = 400;

  clearCanvas();
}

// 캔버스 초기화
function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 간단한 해시 함수 (시간 기반)
function generateHash() {
  const now = Date.now();
  let hash = 0;

  const str = now.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & 0xffffffff;
  }

  return Math.abs(hash).toString(16);
}

// Seeded 난수 생성기 (xorshift32)
class SeededRandom {
  constructor(seed) {
    this.seed = parseInt(seed, 16) || 123456789;
  }

  next() {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return (this.seed >>> 0) / 0x100000000;
  }
}

// 사다리 구조 생성
function generateLadder() {
  // 현재 입력값 저장
  state.topInputs = Array.from(
    topInputsContainer.querySelectorAll("input"),
  ).map((input) => input.value);
  state.bottomInputs = Array.from(
    bottomInputsContainer.querySelectorAll("input"),
  ).map((input) => input.value);

  // 해시 생성
  state.hash = generateHash();
  state.seed = state.hash;

  // 사다리 구조 생성
  const random = new SeededRandom(state.seed);
  const numHorizontals = (state.ladderCount - 1) * state.complexity;
  const horizontalLines = [];

  // 수평선 위치 결정 (각 라인 간에는 최소 간격 유지)
  const positions = [];
  for (let i = 0; i < numHorizontals; i++) {
    let x = Math.floor(random.next() * (state.ladderCount - 1));
    let y = (i / numHorizontals) * 400;
    horizontalLines.push({ x, y });
  }

  state.ladderStructure = horizontalLines;

  // 사다리 그리기
  drawLadder();

  // 결과 초기화 및 URL 업데이트
  state.results = null;
  resultsSection.style.display = "none";
  updateURL();
  // 사다리 생성 후 Go 버튼 활성화
  document.querySelectorAll(".go-btn").forEach((b) => (b.disabled = false));
}

// 사다리 그리기
function drawLadder() {
  clearCanvas();

  const ladderCount = state.ladderCount;
  const spacing = (canvas.width - 100) / (ladderCount - 1);
  const topY = 30;
  const bottomY = canvas.height - 30;

  // 수직선 그리기
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.stroke();
  }

  // 수평선 그리기
  if (state.ladderStructure) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#666";

    for (const line of state.ladderStructure) {
      const x = 50 + line.x * spacing;
      const y = topY + (line.y / 400) * (bottomY - topY);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + spacing, y);
      ctx.stroke();
    }
  }

  // 라벨 그리기 (상단)
  ctx.fillStyle = "#333";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";

  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    const label = state.topInputs[i] || `${i + 1}`;
    ctx.fillText(label, x, topY - 10);
  }

  // 라벨 그리기 (하단)
  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    const label = state.bottomInputs[i] || ``;
    ctx.fillText(label, x, bottomY + 20);
  }
}

// 개별 출발점 실행
function goLadder(startIdx) {
  if (!state.ladderStructure) return;

  const ladderCount = state.ladderCount;
  const spacing = (canvas.width - 100) / (ladderCount - 1);
  const topY = 30;
  const bottomY = canvas.height - 30;

  // compute full results for all starting indices
  const allResults = [];
  for (let si = 0; si < ladderCount; si++) {
    let currentIdx = si;
    let currentY = topY;
    for (const line of state.ladderStructure) {
      const lineY = topY + (line.y / 400) * (bottomY - topY);
      if (line.x === currentIdx && currentY <= lineY) {
        currentIdx = line.x + 1;
        currentY = lineY;
      } else if (line.x + 1 === currentIdx && currentY <= lineY) {
        currentIdx = line.x;
        currentY = lineY;
      }
    }
    allResults.push({
      startIdx: si,
      endIdx: currentIdx,
      startLabel: getTopLabel(si),
      endLabel: state.bottomInputs[currentIdx] || getBottomLabel(currentIdx),
    });
  }

  state.results = allResults;

  // highlight only selected path
  const chosen = allResults.find((r) => r.startIdx === startIdx);
  displayResults();
  drawLadderWithResults(chosen ? [chosen] : [], spacing, topY, bottomY);
  updateURL();
}

// 결과 표시
function displayResults() {
  resultsList.innerHTML = "";
  resultsSection.style.display = "block";

  for (const result of state.results) {
    const item = document.createElement("div");
    item.className = "result-item";
    item.style.borderLeftColor = colors[result.startIdx];
    item.textContent = `${result.startLabel} → ${result.endLabel}`;
    resultsList.appendChild(item);
  }
}

// 결과를 반영한 사다리 그리기 (색상 적용)
function drawLadderWithResults(results, spacing, topY, bottomY) {
  clearCanvas();

  const ladderCount = state.ladderCount;

  // 수직선 그리기
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;

  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.stroke();
  }

  // 모든 사다리 선을 각자 색상으로 얇게 그리기
  for (let i = 0; i < ladderCount; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 1;
    let curIdx = i;
    let curY = topY;
    ctx.beginPath();
    ctx.moveTo(50 + curIdx * spacing, curY);
    state.ladderStructure.forEach((line) => {
      const lineY = topY + (line.y / 400) * (bottomY - topY);
      if (line.x === curIdx && curY <= lineY) {
        ctx.lineTo(50 + curIdx * spacing, lineY);
        curIdx = line.x + 1;
        ctx.lineTo(50 + curIdx * spacing, lineY);
        curY = lineY;
      } else if (line.x + 1 === curIdx && curY <= lineY) {
        ctx.lineTo(50 + curIdx * spacing, lineY);
        curIdx = line.x;
        ctx.lineTo(50 + curIdx * spacing, lineY);
        curY = lineY;
      } else {
        ctx.lineTo(50 + curIdx * spacing, lineY);
        curY = lineY;
      }
    });
    ctx.lineTo(50 + curIdx * spacing, bottomY);
    ctx.stroke();
  }

  // 강조할 결과 경로만 굵고 컬러로 그리기
  results.forEach((res) => {
    const startIdx = res.startIdx;
    ctx.strokeStyle = colors[startIdx];
    ctx.lineWidth = 4;

    let currentIdx = startIdx;
    let currentY = topY;
    ctx.beginPath();
    ctx.moveTo(50 + currentIdx * spacing, currentY);

    state.ladderStructure.forEach((line) => {
      const lineY = topY + (line.y / 400) * (bottomY - topY);
      if (line.x === currentIdx && currentY <= lineY) {
        ctx.lineTo(50 + currentIdx * spacing, lineY);
        currentIdx = line.x + 1;
        ctx.lineTo(50 + currentIdx * spacing, lineY);
        currentY = lineY;
      } else if (line.x + 1 === currentIdx && currentY <= lineY) {
        ctx.lineTo(50 + currentIdx * spacing, lineY);
        currentIdx = line.x;
        ctx.lineTo(50 + currentIdx * spacing, lineY);
        currentY = lineY;
      } else {
        ctx.lineTo(50 + currentIdx * spacing, lineY);
        currentY = lineY;
      }
    });

    ctx.lineTo(50 + currentIdx * spacing, bottomY);
    ctx.stroke();
  });

  // 라벨 그리기
  ctx.fillStyle = "#333";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";

  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    const label = state.topInputs[i] || `${i + 1}`;
    ctx.fillText(label, x, topY - 10);
  }

  const rs = state.results || [];
  for (let i = 0; i < ladderCount; i++) {
    const x = 50 + i * spacing;
    const result = rs.find((r) => r.endIdx === i);
    let label;
    if (result) {
      const base = getBottomLabel(i);
      label = `${result.startLabel} ➡ ${base}`;
      ctx.fillStyle = colors[result.startIdx];
    } else {
      label = getBottomLabel(i);
      ctx.fillStyle = "#999";
    }
    ctx.fillText(label, x, bottomY + 20);
  }
}

// URL 생성/업데이트
function generateURL() {
  const params = new URLSearchParams();

  params.append("ladders", state.ladderCount);
  params.append("complexity", state.complexity);

  // 상단 입력값
  state.topInputs.forEach((val, idx) => {
    if (val) params.append(`top${idx}`, val);
  });

  // 하단 입력값
  state.bottomInputs.forEach((val, idx) => {
    if (val) params.append(`bottom${idx}`, val);
  });

  // 해시값
  if (state.hash) params.append("hash", state.hash);

  const baseURL = window.location.href.split("?")[0];
  return `${baseURL}?${params.toString()}`;
}

// URL 업데이트
function updateURL() {
  const url = generateURL();
  shareUrlInput.value = url;
  window.history.replaceState({}, "", url);
}

// URL에서 상태 로드
function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("ladders")) {
    state.ladderCount = parseInt(params.get("ladders"));
    ladderCountInput.value = state.ladderCount;
  } else {
    // no param: adopt HTML input default
    state.ladderCount = parseInt(ladderCountInput.value) || state.ladderCount;
  }

  if (params.has("complexity")) {
    state.complexity = parseInt(params.get("complexity"));
    complexityInput.value = state.complexity;
  } else {
    state.complexity = parseInt(complexityInput.value) || state.complexity;
  }

  // ensure display text updates when state loaded from URL or defaults
  countDisplay.textContent = `${state.ladderCount}개`;
  complexityDisplay.textContent = state.complexity;

  // 상단 입력값 로드
  state.topInputs = [];
  for (let i = 0; i < 10; i++) {
    if (params.has(`top${i}`)) {
      state.topInputs.push(params.get(`top${i}`));
    }
  }

  // 하단 입력값 로드
  state.bottomInputs = [];
  for (let i = 0; i < 10; i++) {
    if (params.has(`bottom${i}`)) {
      state.bottomInputs.push(params.get(`bottom${i}`));
    }
  }

  // 해시값 로드
  if (params.has("hash")) {
    state.hash = params.get("hash");
    state.seed = state.hash;

    // 사다리 구조 재생성
    const random = new SeededRandom(state.seed);
    const numHorizontals = (state.ladderCount - 1) * state.complexity;
    const horizontalLines = [];

    for (let i = 0; i < numHorizontals; i++) {
      let x = Math.floor(random.next() * (state.ladderCount - 1));
      let y = (i / numHorizontals) * 400;
      horizontalLines.push({ x, y });
    }

    state.ladderStructure = horizontalLines;
  }
}

// URL 복사
function copyURL() {
  shareUrlInput.select();
  document.execCommand("copy");
  alert("URL이 클립보드에 복사되었습니다!");
}

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", init);
