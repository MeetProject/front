# Project Meet — Frontend

mediasoup(SFU) 기반의 실시간 화상회의 웹 애플리케이션 프론트엔드입니다. 별도 로그인 없이 회의를 만들고, 코드나 링크로 참여할 수 있습니다.

## 주요 기능

- **회의 생성·참여** — 회의 생성 후 코드/링크 공유, 입장 전 이름 설정과 장치 미리보기(PreJoin)
- **실시간 미디어** — mediasoup 기반 다자간 오디오·비디오 송수신, 화면 공유
- **장치 제어** — 마이크/카메라 토글(단축키 지원), 장치 선택·교체, 스피커 테스트, 장치 끊김 자동 복구
- **상호작용** — 채팅(연속 메시지 그룹핑), 이모지 리액션, 손들기, 참가자별 로컬 음소거
- **레이아웃** — 참가자 수·화면 크기에 따른 타일 레이아웃 자동 계산, 화면 공유 시 스테이지 레이아웃, 발화자 감지 기반 타일 승격
- **기타** — 음소거 중 발화 감지 안내("혹시 말하고 계시나요?"), 회의 정보 복사, 문제 신고/의견 보내기

## 기술 스택

| 분류 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| 미디어 | mediasoup-client 3 (WebRTC SFU) |
| 시그널링 | STOMP(@stomp/stompjs) + SockJS (WebSocket) |
| 상태 관리 | Zustand 5 |
| 스타일 | Tailwind CSS 4 |
| 품질 | ESLint 9, Prettier, Husky + lint-staged |

## 시작하기

### 요구 사항

- Node.js 20 이상
- 백엔드 서버 (REST API + STOMP WebSocket, 기본 `http://localhost:8080`)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행 (http://localhost:3000)
npm run dev
```

### 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 서버 주소 (REST `/api/...`, WebSocket `/ws`) | `http://localhost:8080` |

### 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 및 자동 수정 |

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── landing/          # 랜딩 — 회의 생성·코드 입력
│   └── [code]/           # 회의방
│       ├── PreJoin/      # 입장 전 — 이름 입력, 장치 미리보기·선택
│       └── Meeting/      # 회의 본체
│           ├── Screen/       # 타일·스테이지 레이아웃, 참가자 오디오
│           ├── ControlBar/   # 장치 토글, 화면 공유, 손들기, 퇴장
│           ├── RightDrawer/  # 채팅, 참가자 목록, 회의 정보
│           ├── BottomDrawer/ # 이모지
│           └── Header/       # 참가자 수, 손들기 카운트
├── hook/
│   ├── useWebrtc/        # WebRTC 핵심 계층
│   │   ├── useSignaling.ts        # STOMP 연결·publish/subscribe·요청-응답(request)
│   │   ├── useMediasoup.ts        # Device/Transport/Producer/Consumer 생명주기
│   │   ├── useSignalingHandler.ts # 방 토픽 구독 및 수신 이벤트 → 스토어 반영
│   │   ├── useSignalSender.ts     # 채팅·이모지·손들기 등 발신
│   │   └── index.ts               # 파사드 (joinRoom/leaveRoom/shareScreen/toggleTrack 등)
│   ├── useDevice.ts      # getUserMedia/getDisplayMedia 스트림 관리
│   └── ...               # 레이아웃 계산, 발화 감지, 볼륨 미터 등
├── store/                # Zustand 스토어 (참가자·장치·오디오·시그널·상호작용 등)
├── provider/             # DeviceProvider — 권한·장치 변경·트랙 이벤트 감시
├── components/           # 공용 컴포넌트 (Media, Dialog, Setting, Feedback 등)
├── service/              # REST API (방 생성·검증, 유저 등록)
├── util/                 # 레이아웃·오디오 분석·색상·텍스트 유틸
└── types/                # 타입 정의
```

## 아키텍처 개요

### 시그널링

- 연결: SockJS + STOMP, `WS_URL?userId={userId}` (로그인이 없어 웹소켓 연결이 사용자 신원 역할)
- 요청-응답: `correlationId` 기반 — `/app/signal/...`로 발행하고 `/user/queue/replies`로 회신 수신 (10초 타임아웃)
- 브로드캐스트: `/topic/room/{roomId}/...` (participant, track, rtls, producer/remove, leave, device, handup, emoji, chat)
- 방을 나가도 웹소켓은 유지하고 방 단위 구독·상태만 정리합니다 (재연결 없이 다른 방 입장 가능)

### 미디어 파이프라인

1. 입장 시 서버 RTP capabilities로 mediasoup Device 초기화
2. send/recv Transport 생성 (DTLS 연결은 STOMP 요청-응답으로 협상)
3. 로컬 트랙 produce — 꺼 둔 장치는 producer를 pause해 송출 차단 (트랙은 음소거 중 발화 감지를 위해 유지)
4. 기존 참가자 producer들을 consume, 이후 신규 producer는 브로드캐스트로 수신
5. 화면 공유는 일반 트랙과 분리 관리하며, 새 공유자가 기존 공유를 대체
