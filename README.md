# front

WebRTC 화상회의를 위한 프론트엔드입니다. Next.js 기반으로, Google Meet를 모티브로 한 회의 UI와 mediasoup-client 기반 미디어 송수신을 담당합니다.

시그널링 중계와 방 상태 관리는 [시그널링 서버](../signalServer)가, 미디어 트래픽은 [미디어 서버](../mediaServer)(mediasoup SFU)가 처리하며, 이 클라이언트는 다음을 책임집니다.

- 회의 생성·참여·사전 점검(PreJoin) UI와 회의 화면(그리드·발표자 레이아웃, 컨트롤바, 채팅, 리액션)
- 장치·권한 관리 — getUserMedia 획득 전략, 장치 변경, 권한 상태 감지·안내
- 미디어 송수신 — mediasoup-client transport·producer·consumer 생성과 pause/resume 제어
- STOMP 시그널링 — RPC 스타일 요청과 방 브로드캐스트 구독, 순단 시 resync 복구
- 오디오 분석 — 로컬·참가자 볼륨 측정, 발화자 감지, 음소거 중 발화 안내

## 기술 스택

- Next.js (App Router, Turbopack), React 19, TypeScript
- mediasoup-client, WebRTC(getUserMedia · getDisplayMedia), Web Audio API
- @stomp/stompjs + sockjs-client (STOMP over SockJS)
- zustand, Tailwind CSS 4, Radix UI(Dialog)
- ESLint, Prettier, husky + lint-staged

## 구조

```
app/          라우트 — landing(회의 생성·참여), [code](PreJoin → Meeting)
components/   공용 컴포넌트 — Dialog, Media, DeviceSelectBox, Profile 등
hook/         장치 제어·레이아웃·단축키 훅
  useWebrtc/  시그널링·mediasoup 연동 — 연결, produce/consume, 재접속
store/        zustand 스토어 — 장치, 참가자, 시그널, 상호작용, 로컬 뮤트
lib/          오디오 그래프·로컬 분석기, 장치 정보 조회
service/      REST API — 방 생성·검증, 유저 등록
util/         순수 유틸 — 스트림, 그리드 레이아웃 계산, 텍스트(한글 초성 검색)
types/        공용 타입 정의
```

- `useWebrtc`는 시그널링(`useSignaling`)·미디어(`useMediasoup`)·수신 핸들러(`useSignalingHandler`)를 조합하는 파사드로, 화면은 이 훅의 API만 사용합니다.
- 렌더링 상태는 zustand 스토어로, transport·producer·consumer 같은 미디어 객체는 ref로 관리해 리렌더와 분리합니다.
- 회의 중 음소거는 producer pause 기준입니다 — 트랙은 활성 상태로 유지해 음소거 중에도 발화 감지("혹시 말하고 계시나요?")가 동작합니다.
- 오디오 레벨 측정은 단일 requestAnimationFrame 티커(`audioTicker`)를 구독 방식으로 공유해 참가자 수와 무관하게 프레임당 1회씩 처리합니다.

## 시그널링 개요

- 연결: `{API_URL}/ws?userId={id}` (SockJS), 기본 `http://localhost:8080`
- 요청: `/app/**` 발행 → `/user/queue/replies`에서 `correlationId`로 응답을 짝짓는 RPC 스타일 (10초 타임아웃)
- 구독: `/topic/room/{roomId}/{participant|rtls|producer/remove|leave|device|handup|emoji|chat}`
- WebRTC 협상(`capabilities`, `dtls`, `rtls`, `consumerParams`)은 시그널링 서버가 미디어 서버로 릴레이합니다. 목적지 명세는 [시그널링 서버 README](../signalServer) 참고.

## 연결 복구

WebSocket 순단 시 STOMP 클라이언트가 자동 재접속하고, 재연결 성공 시 `/app/signal/resync`로 세션을 복구합니다 — 서버 유예(10초) 내 재접속이면 transport·producer·consumer를 새로 협상해 회의를 이어가고, 유예를 넘겼으면 랜딩으로 이동해 재입장을 안내합니다. 탭 종료·새로고침은 `beforeunload`에서 beacon으로 퇴장을 통지합니다.

## 실행

```bash
npm install
npm run dev    # http://localhost:3000
```

시그널링 서버(기본 `localhost:8080`)와 미디어 서버가 실행 중이어야 회의 기능이 동작합니다.

## 관련 저장소

- **signalServer** — Spring Boot 시그널링 서버 (STOMP 중계, 방·참가자 상태 관리)
- **mediaServer** — Node.js mediasoup SFU (미디어 트래픽 라우팅)
