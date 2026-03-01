# 📝 Markeddy

**Markeddy**는 별도의 데이터베이스 없이 URL만으로 마크다운 문서를 저장하고 공유할 수 있는 **Stateless 마크다운 에디터**입니다. [Milkdown](https://milkdown.dev/)을 기반으로 한 유려한 WYSIWYG 편집 경험을 제공하며, 모든 편집 내용은 실시간으로 URL에 인코딩되어 저장됩니다.

## ✨ 주요 특징

- **WYSIWYG 마크다운 편집:** Milkdown 기반의 직관적이고 현대적인 편집 인터페이스.
- **URL 기반 상태 보존:** 문서의 내용이 실시간으로 URL의 `Query String`으로 인코딩됩니다.
- **간편한 공유:** 데이터베이스나 서버 저장소 없이, 브라우저 주소창의 URL만 복사하여 전달하면 상대방이 내가 작성한 문서 그대로를 볼 수 있습니다.
- **정적 웹페이지 (Static HTML):** 서버 사이드 로직 없이 HTML/JavaScript만으로 동작하여 어디든 가볍게 배포 가능합니다.

## 🚀 작동 원리

Markeddy는 데이터를 서버에 저장하는 대신 브라우저의 URL 구조를 활용합니다.

1. **입력 및 편집:** 사용자가 에디터에서 내용을 수정합니다.
2. **인코딩:** 마크다운 텍스트가 `Base64` 또는 `URL Encoding` 방식을 통해 인코딩됩니다.
3. **URL 업데이트:** `history.replaceState`를 사용하여 페이지 새로고침 없이 URL의 `?content=...` 부분을 업데이트합니다.
4. **복원:** 사용자가 URL을 통해 접속하면, `URLSearchParams`를 사용하여 쿼리 스트링을 파싱하고 에디터에 내용을 다시 뿌려줍니다.

## 🛠 설치 및 실행 (Development)

이 프로젝트는 외부 의존성을 최소화한 정적 파일 구조를 지향합니다.

- **저장소 클론**

```Shell
git clone https://github.com/doosik71/markeddy.git
cd markeddy
```

- **의존성 설치 (CDN 권장 또는 NPM)**

```Shell
# Milkdown 및 관련 플러그인을 CDN을 통해 로드하거나
# 프로젝트 환경에 맞게 npm install을 진행하세요.
npm install
```

- **실행**: `index.html` 파일을 브라우저로 열거나 로컬 서버를 실행합니다.

## 📂 프로젝트 구조

```text
markeddy/
├── index.html       # 메인 에디터 페이지 및 레이아웃
├── style.css        # 에디터 커스텀 스타일
└── main.js          # Milkdown 설정 및 URL 파싱/인코딩 로직
```

## 📝 사용 예시

작성 중인 문서 주소가 다음과 같이 변합니다:
`http://test.com/markeddy/index.html?md=SGVsbG8lMjBXb3JsZCE=`

위 주소를 복사하여 친구에게 보내면, 친구는 별도의 로그인 없이 내가 작성한 **"Hello World!"** 문서를 즉시 확인할 수 있습니다.

## 🤝 기여하기

버그 수정이나 기능 제안은 언제나 환영합니다! Issue를 생성하거나 Pull Request를 보내주세요.

---

**Markeddy** — _Edit, Encode, and Share your thoughts instantly._
