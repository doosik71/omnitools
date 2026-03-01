/**
 * main.js - Markeddy Logic
 * Milkdown Editor Setup & URL State Management
 */

import { Editor, rootCtx, defaultValueCtx } from 'https://esm.sh/@milkdown/core';
import { commonmark } from 'https://esm.sh/@milkdown/preset-commonmark';
import { listener, listenerCtx } from 'https://esm.sh/@milkdown/plugin-listener';
import { nord } from 'https://esm.sh/@milkdown/theme-nord';
import { menu, menuDefaultConfig } from 'https://esm.sh/@milkdown-lab/plugin-menu';

/**
 * 1. URL에서 마크다운 데이터 복원
 * URL의 ?md= 파라미터를 읽어 Base64 디코딩 후 반환합니다.
 */
function getInitialContent() {
  const params = new URLSearchParams(window.location.search);
  let encodedData = params.get("md");

  if (encodedData) {
    try {
      // URLSearchParams가 '+'를 ' '로 변환하므로 다시 되돌림
      encodedData = encodedData.replace(/ /g, "+");
      // b64 -> utf-8 디코딩 (한글 깨짐 방지)
      return decodeURIComponent(escape(atob(encodedData)));
    } catch (e) {
      console.error("데이터 복원 실패:", e);
      return "# ⚠️ 복원 오류\n데이터를 읽어오는 중 문제가 발생했습니다.";
    }
  }

  // 초기 데이터가 없을 때 표시할 기본 가이드
  return `# 📝 Markeddy 시작하기

별도의 저장 없이 **URL**만으로 마크다운을 저장하고 공유하세요.

1. 이 텍스트를 지우고 내용을 작성하세요.
2. 주소창의 **URL**이 실시간으로 변하는 것을 확인하세요.
3. 상단의 **공유 버튼**을 눌러 친구에게 주소를 보내세요!`;
}

/**
 * 2. URL 업데이트 (State Saver)
 * 에디터 내용이 변경될 때마다 호출되어 URL을 업데이트합니다.
 */
function updateUrl(markdown) {
  if (!markdown || markdown.trim() === "") {
    // 내용이 비어있으면 쿼리 스트링 제거
    window.history.replaceState({}, "", window.location.pathname);
    return;
  }

  try {
    // utf-8 -> b64 인코딩
    const encoded = btoa(unescape(encodeURIComponent(markdown)));
    const newUrl = `${window.location.pathname}?md=${encodeURIComponent(encoded)}`;

    // 페이지 새로고침 없이 URL만 교체
    window.history.replaceState({ path: newUrl }, "", newUrl);
  } catch (e) {
    console.warn("URL 업데이트 실패:", e);
  }
}

/**
 * 3. Milkdown 에디터 생성 및 설정
 */
async function initEditor() {
  try {
    const editor = await Editor.make()
      .config((ctx) => {
        // 에디터가 렌더링될 DOM 요소 지정
        ctx.set(rootCtx, document.querySelector("#app"));
        // URL에서 가져온 초기값 설정
        ctx.set(defaultValueCtx, getInitialContent());

        // 리스너 플러그인 설정: 마크다운 업데이트 감지
        const l = ctx.get(listenerCtx);
        l.markdownUpdated((ctx, markdown) => {
          updateUrl(markdown);
        });
      })
      .config(menuDefaultConfig) // 메뉴 플러그인 기본 설정 적용
      .use(nord) // 북유럽 테마 적용
      .use(commonmark) // 기본 마크다운 문법 적용
      .use(listener) // 상태 감지 리스너 적용
      .use(menu) // 메뉴 툴바 적용
      .create();

    console.log("Markeddy Editor Ready!");
  } catch (err) {
    console.error("에디터 초기화 중 오류 발생:", err);
  }
}

/**
 * 4. 유틸리티: URL 복사 기능
 */
window.copyUrl = () => {
  const currentUrl = window.location.href;

  // 클립보드 API 사용
  navigator.clipboard
    .writeText(currentUrl)
    .then(() => {
      const btn = document.querySelector(".btn-primary");
      const originalText = btn.innerText;

      btn.innerText = "✅ 복사 완료!";
      btn.style.backgroundColor = "#a3be8c"; // 성공 시 초록색(Nord14)으로 변경

      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; // 원상복구
      }, 2000);
    })
    .catch((err) => {
      alert("URL을 복사할 수 없습니다. 주소창에서 직접 복사해주세요.");
    });
};

// 페이지 로드 시 에디터 실행
initEditor();
