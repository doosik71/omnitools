# OmniTools

**OmniTools**는 여러 개의 **stateless 웹 도구**를 한곳에 모아 제공하는 프로젝트입니다.  
각 도구는 서버 DB에 사용자 데이터를 저장하지 않고, 브라우저에서 즉시 처리하는 것을 기본 원칙으로 합니다.

## 목표

- 빠르게 열고 바로 쓸 수 있는 실용 도구 모음 제공
- 로그인/계정/서버 저장소 없이 동작하는 구조 지향
- 각 도구를 독립적으로 개발/배포 가능한 구조 유지

## Stateless 원칙

- 사용자 입력은 서버 DB에 저장하지 않음
- 가능한 한 브라우저 내 연산으로 처리
- 상태가 필요하면 URL Query, Hash, LocalStorage 등 클라이언트 범위에서만 사용
- 도구 간 결합을 낮춰 단일 도구가 독립 실행되도록 설계

## 현재 구성

```text
omnitools/
├── README.md
├── LIST.md
├── markeddy/
├── colorpicker/
└── qrcode/
```

- `LIST.md`: 개발 후보 도구 목록 및 MVP 우선순위
- `markeddy/`: Stateless Markdown 도구
- `colorpicker/`, `qrcode/`: 개별 도구 디렉터리 (구현 진행)

## 개발 방식 (권장)

1. 도구 1개 = 디렉터리 1개
2. 각 도구는 `index.html`, `style.css`, `main.js` 중심의 정적 구조로 시작
3. 공통 레이아웃/네비게이션은 루트에서 점진적으로 통합
4. 우선 MVP 도구를 완성한 뒤 카테고리 확장

## MVP 후보 (초기 10개)

1. JSON 포매터/검증기
2. Base64 인코드/디코드
3. URL 인코드/디코드
4. UUID 생성기
5. 해시 생성기
6. CSV ↔ JSON 변환기
7. UNIX Timestamp ↔ 날짜 변환
8. QR 코드 생성기
9. 비밀번호 생성기
10. Color Contrast 검사기

상세 목록은 [LIST.md](./LIST.md) 참고.

## 실행 방법

정적 파일 프로젝트이므로 아래 중 하나로 실행할 수 있습니다.

- 각 도구의 `index.html`을 브라우저에서 직접 열기
- 또는 간단한 로컬 서버 실행 후 접속

예시:

```powershell
# 프로젝트 루트에서
python -m http.server 5500
```

이후 브라우저에서 `http://localhost:5500/` 접속.
또는 `https://omnitools.doosik71.workers.dev/` 접속.

## 라이선스

필요한 라이선스 정책(MIT 등)을 프로젝트 진행 중 확정해 명시합니다.
