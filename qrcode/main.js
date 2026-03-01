let currentQRCodeData = null;

const qrInput = document.getElementById("qrInput");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const qrCodeContainer = document.getElementById("qrCode");
const byteCount = document.getElementById("byteCount");
const charCounter = document.querySelector(".char-counter");
const MAX_BYTES = 2953;

// 텍스트의 바이트 수 계산 (UTF-8 표준)
function calculateBytes(text) {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i);

    if (codePoint <= 0x7f) {
      // 1 byte: U+0000 ~ U+007F (A, a, 0, !)
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      // 2 bytes: U+0080 ~ U+07FF (ñ, ö, Ā)
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      // 3 bytes: U+0800 ~ U+FFFF (한, 가, あ, €)
      bytes += 3;
    } else {
      // 4 bytes: U+10000 ~ U+10FFFF (😀, 🚀)
      bytes += 4;
      i++; // surrogate pair는 2개 문자로 카운트되므로 i를 1 더 증가
    }
  }
  return bytes;
}

// 바이트 수 업데이트
qrInput.addEventListener("input", () => {
  const bytes = calculateBytes(qrInput.value);
  byteCount.textContent = bytes;

  // 80% 이상일 때 경고 색상
  if (bytes >= MAX_BYTES * 0.8) {
    charCounter.classList.add("warning");
    charCounter.classList.remove("error");
  }
  // 100%일 때 에러 색상
  if (bytes > MAX_BYTES) {
    charCounter.classList.add("error");
  } else {
    charCounter.classList.remove("error");
  }

  // 최대 바이트 초과 시 마지막 문자 제거
  if (bytes > MAX_BYTES) {
    qrInput.value = qrInput.value.slice(0, -1);
  }
});

// 입력값 변경시 자동 생성
qrInput.addEventListener(
  "input",
  debounce(() => {
    if (qrInput.value.trim()) {
      generateQRCode();
    }
  }, 300),
);

// 생성 버튼 클릭
generateBtn.addEventListener("click", generateQRCode);

// 다운로드 버튼 클릭
downloadBtn.addEventListener("click", downloadQRCode);

async function generateQRCode() {
  const text = qrInput.value.trim();

  if (!text) {
    alert("Input text.");
    return;
  }

  try {
    // 기존 QR 코드 제거
    qrCodeContainer.innerHTML = "";

    // QR Server API를 사용하여 QR 코드 생성 (한글 완벽 지원)
    const encodedText = encodeURIComponent(text);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;

    // Fetch API로 이미지를 blob으로 받기
    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    // 이미지 표시
    const img = new Image();
    img.onload = () => {
      qrCodeContainer.appendChild(img);
      currentQRCodeData = blob; // blob 저장
      downloadBtn.disabled = false;
      URL.revokeObjectURL(imageUrl);
    };
    img.onerror = () => {
      alert("Failed to generate QR Code.");
    };
    img.src = imageUrl;
  } catch (error) {
    console.error("QR 코드 생성 실패:", error);
    alert("Failed to generate QR Code.");
  }
}

function downloadQRCode() {
  if (!currentQRCodeData) return;

  try {
    const url = URL.createObjectURL(currentQRCodeData);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.png";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("다운로드 실패:", error);
    alert("Cannot download QR Code.");
  }
}

// 디바운스 기능
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
