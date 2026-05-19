---
title: UDP 헤더는 왜 딱 8바이트일까요?
description: 기본편에서 TCP보다 단순한 친구로만 봤던 UDP를, 이번엔 8바이트 헤더 위에서 펼쳐보며 포트·길이·체크섬이 어디 들어가는지 같이 읽어봐요.
icon: lucide/send
created: 2026-05-19
updated: 2026-05-19
tags:
  - Network
  - UDP
  - Packet
---

# UDP 헤더는 왜 딱 8바이트일까요?

> TCP가 적을 걸 한가득 들고 다닐 때, UDP는 **정말 필요한 네 칸만 들고 바로 지나가요.**

[TCP vs UDP](../basic/03-tcp-vs-udp.md){ data-preview }에서는 TCP를 **꼼꼼한 친구**, UDP를 **빠른 친구** 정도로 먼저 소개했어요. 그리고 심화편 [TCP 헤더는 왜 이렇게 칸이 많을까요?](./tcp-header-anatomy.md){ data-preview }에서는 그 꼼꼼함이 실제로는 포트, sequence 번호, ACK, window, 옵션 같은 칸으로 꽉 차 있다는 것도 봤죠.

그럼 자연스럽게 이런 생각이 들어요.

> *"좋아요, TCP는 복잡한 걸 알겠어요. 근데 UDP는요? 단순하다는데, 진짜로 얼마나 단순한데요?"*

바로 그 질문에 답하는 글이에요. 오늘은 **UDP 헤더 8바이트**를 32비트 줄 두 줄 위에 펼쳐서, 출발지 포트 · 도착지 포트 · 길이 · 체크섬이 각각 어디 칸에 들어가는지 같이 읽어볼게요. 기본 형식은 [RFC 768](https://www.rfc-editor.org/rfc/rfc768) 을 바탕으로 보고, IPv6에서 UDP 체크섬을 어떻게 봐야 하는지는 [RFC 8200 8.1절](https://www.rfc-editor.org/rfc/rfc8200.html#section-8.1) 기준으로 가볍게 이어볼게요.

!!! note "이 글의 범위"
    여기서는 **일반적인 UDP 기본 헤더**를 다뤄요. RTP, QUIC, DNS처럼 UDP 위에 어떤 애플리케이션 프로토콜이 올라가는지는 오늘 다 안 열어요. 지금은 **"UDP가 단순하다"는 말이 실제 헤더의 어느 네 칸을 뜻하는지**를 선명하게 만드는 데 집중할게요.

---

## 일단 비유로 시작해볼게요

이번에는 **짧은 배달 메모**를 떠올려볼까요?

- 어느 방에서 어느 방으로 보내는지만 적고,
- 이 메모까지 포함해서 전체가 얼마나 되는지 적고,
- 마지막으로 **메모가 중간에 크게 망가지진 않았는지** 확인하는 표시를 붙여요.

TCP처럼 *"몇 번째 조각인지"*, *"다음엔 몇 번부터 받을지"*, *"연결을 지금 시작하는지"* 같은 운영 메모는 없어요. 그냥 **짧은 전달표**에 더 가까워요.

| 기본편에서 잡은 감각 | 비유에서는 | 실제로는 |
|---|---|---|
| 포트 번호 | 어느 방에서 어느 방으로 보내는지 | Source Port / Destination Port |
| 전체 크기 | 이 메모 포함 묶음이 얼마나 되는지 | Length |
| 최소한의 무결성 확인 | 봉인이 크게 찢어지지 않았는지 보는 표시 | Checksum |

그러니까 UDP 헤더는 *"아무 정보도 없는 빈 껍데기"* 가 아니라, **정말 필요한 네 칸만 남긴 최소 전달표**라고 보면 돼요.

---

## UDP 기본 헤더 전체 그림 { #header-grid }

UDP 기본 헤더는 **딱 8바이트(64비트)** 예요. 한 줄을 32비트로 그리면 **정확히 2줄**이면 끝나요.

<div style="margin: 1.5rem 0; border: 2px solid var(--md-default-fg-color--lighter); border-radius: 0.75rem; overflow: hidden; background: color-mix(in srgb, var(--md-default-bg-color) 95%, var(--md-default-fg-color) 5%);">
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); padding: 0.4rem 0.6rem; gap: 0; background: color-mix(in srgb, var(--md-primary-fg-color) 8%, var(--md-default-bg-color)); border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: 0.65rem; color: var(--md-default-fg-color--light); text-align: center;">
    <span style="grid-column: span 8;">0</span>
    <span style="grid-column: span 8;">8</span>
    <span style="grid-column: span 8;">16</span>
    <span style="grid-column: span 8;">24</span>
  </div>
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); gap: 2px; padding: 0.6rem; background: var(--md-default-fg-color--lightest);">
    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #ef4444 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Source Port</strong><br/><small>16b</small></div>
    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #f97316 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Destination Port</strong><br/><small>16b</small></div>

    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #22c55e 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Length</strong><br/><small>16b</small></div>
    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #6366f1 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Checksum</strong><br/><small>16b</small></div>
  </div>
</div>

이 그림에서 먼저 잡아야 할 감각은 세 가지예요.

1. **기본 헤더가 8바이트로 끝난다**는 점
2. TCP에서 봤던 sequence 번호, ACK, flags, window 같은 줄이 **아예 없다**는 점
3. 그래도 **포트 · 길이 · 체크섬**은 남겨서, 어디로 보내는지와 최소한의 무결성은 챙긴다는 점

---

## 1번째 줄 — 어느 창구에서 어느 창구로 { #ports }

**Source Port (16비트) · Destination Port (16비트)**

| 필드 | 길이(bit) | 의미 | 자주 보는 값 |
|---|---:|---|---|
| Source Port | 16 | 보내는 쪽 애플리케이션의 포트 번호 | `51515`, `53000` 류 |
| Destination Port | 16 | 받는 쪽 애플리케이션의 포트 번호 | `53`, `123`, `443` 류 |

[포트와 소켓](../basic/05-ports-and-sockets.md){ data-preview }에서 봤던 **"같은 집 안 어느 방으로 보낼까"** 감각은 UDP에서도 그대로예요. IP가 **어느 집까지 갈지**를 맡는다면, UDP 포트는 **그 집 안 어느 서비스까지 갈지**를 맡아요.

여기까지는 TCP와 거의 같은 얼굴이에요. 실제로 포트 번호는 둘 다 **16비트라 0~65535** 범위를 써요. 그래서 `192.168.0.10:51515 → 8.8.8.8:53` 같은 UDP 흐름도, 결국은 **IP 주소 2개 + 포트 2개** 조합으로 식별돼요.

한 가지 작은 단서만 붙이면, RFC 768은 `Source Port` 를 꼭 써야 한다고 강제하지는 않아요. 필요 없으면 `0` 으로 둘 수도 있어요. 다만 일반적인 클라이언트-서버 통신에서는 **응답을 다시 받으려면 출발지 포트가 있어야** 하니까, 실전에서는 보통 채워져 있다고 생각하면 돼요.

---

## 2번째 줄 — 길이와 체크섬은 왜 같이 붙어 있을까요? { #length-and-checksum }

**Length (16비트) · Checksum (16비트)**

| 필드 | 길이(bit) | 의미 | 자주 보는 값 |
|---|---:|---|---|
| Length | 16 | **UDP 헤더 + UDP 데이터** 전체 길이 | `32`, `64`, `1200` 류 |
| Checksum | 16 | UDP 헤더와 데이터가 크게 망가지지 않았는지 보는 무결성 검사 | 패킷마다 달라짐 |

### Length — 이건 본문만이 아니라 헤더까지 포함한 길이예요

이 필드는 *"실제 데이터가 몇 바이트냐"* 만 적는 칸이 아니에요. **UDP 헤더 8바이트 + 그 뒤의 UDP 데이터**를 다 합친 길이예요.

- `Length = 8` → 헤더만 있고 데이터는 없음
- `Length = 32` → 헤더 8바이트 + 데이터 24바이트

그래서 UDP는 길이를 읽을 때 항상 **"8바이트 헤더까지 포함한 숫자"** 라고 생각해야 해요. 이 점은 뒤에서 tcpdump 한 줄을 볼 때 한 번 더 중요해져요.

### Checksum — 빠르다고 아무 확인도 안 하는 건 아니에요

여기가 UDP를 처음 볼 때 가장 오해하기 쉬운 칸이에요. UDP는 TCP처럼 재전송이나 ACK를 직접 하지 않지만, 그렇다고 **무결성 확인까지 완전히 포기한 건 아니에요.**

RFC 768 기준으로 UDP 체크섬은 **IP 쪽 일부 정보(pseudo-header) + UDP 헤더 + UDP 데이터**를 함께 계산해요. 그러니까 단순히 *"UDP 헤더 네 칸만 확인한다"* 가 아니라, **누가 누구에게 보냈는지와 실제 내용까지 같이 묶어서** 계산하는 거예요.

여기서 표지판 하나만 세워둘게요.

> IPv4에서는 UDP 체크섬을 `0` 으로 보내는 경우가 가능하지만, IPv6에서는 [RFC 8200 8.1절](https://www.rfc-editor.org/rfc/rfc8200.html#section-8.1) 기준으로 **기본적으로 체크섬이 필수**예요. 아주 제한된 터널링 예외는 있지만, 일반적인 웹/앱 트래픽 기준으로는 **IPv6 UDP 체크섬은 꼭 있다**고 생각하면 돼요.

즉, UDP의 단순함은 **체크를 안 한다**가 아니라, **재전송이나 흐름 제어는 안 하지만 최소한의 무결성 검사는 남겨둔다**에 가까워요.

---

## 근데 왜 굳이 이렇게 짧을까요?

TCP 헤더를 보고 나서 UDP를 보면 거의 반전처럼 느껴져요. 왜 이렇게까지 줄였을까요?

### 1. 연결 상태를 헤더가 직접 관리하지 않으니까요

TCP는 `SYN`, `ACK`, `FIN`, `RST` 같은 신호로 **연결 상태**를 계속 들고 가야 해요. 그래서 sequence 번호, acknowledgment 번호, flags, window 같은 칸이 필요했죠.

UDP는 그런 연결 운영부를 헤더에 넣지 않아요. 그냥 **지금 이 데이터그램 하나를 보낸다**는 관점에 더 가까워요.

### 2. 순서 보장과 재전송을 헤더 차원에서 안 맡으니까요

TCP는 *"몇 번째 바이트부터인지"*, *"다음엔 뭘 기다리는지"* 를 계속 적어야 해요. UDP는 그걸 transport 헤더에서 직접 하지 않아요.

그래서 **sequence 번호 칸도 없고 ACK 칸도 없어요.** 이게 UDP 헤더가 짧은 가장 큰 이유예요.

### 3. 빠르게 던지고 지나가는 성격에 맞춘 거예요

[TCP vs UDP](../basic/03-tcp-vs-udp.md){ data-preview }에서 봤듯이, UDP는 실시간 스트리밍, 음성 통화, DNS 조회처럼 **지금 빨리 보내는 것**이 중요할 때 자주 등장해요.

물론 이 말이 *"아무 책임도 없다"* 는 뜻은 아니에요. 책임 분담이 다를 뿐이에요.

- UDP 헤더는 **최소한의 전달표**만 들고 다니고,
- 순서, 복구, 재시도 같은 일은 **애플리케이션이나 상위 프로토콜**이 필요하면 따로 챙겨요.

---

## 실제 패킷에서 이렇게 보여요

말로만 보면 여전히 추상적이니까, 이번엔 **UDP 데이터그램 하나**를 실제 바이트와 사람이 읽는 한 줄로 같이 볼게요.

### 먼저, 진짜 바이트로 보면 { #real-bytes }

설명용으로 단순화한 UDP 헤더를 보면 이렇게 생겼다고 해볼게요.

```text
0x0000  c9 3b 00 35 00 20 1a 2b
```

| 위치 | hex 에서 잘라보면 | 어떻게 읽나 |
|---|---|---|
| 1~2번째 바이트 | `c9 3b` | Source Port = `51515` |
| 3~4번째 바이트 | `00 35` | Destination Port = `53` |
| 5~6번째 바이트 | `00 20` | Length = `32` 바이트 |
| 7~8번째 바이트 | `1a 2b` | Checksum |

여기서 제일 중요한 건 두 가지예요.

1. `00 20` 이 **UDP 전체 길이 32바이트**라는 점
2. 그 32바이트 안에는 **8바이트 헤더 + 24바이트 데이터**가 같이 들어 있다는 점

즉 이 바이트 배열 하나만 봐도 *"어느 포트에서 어디 포트로 갔고, 전체가 얼마나 길며, 무결성 검사용 숫자가 무엇인지"* 까지는 바로 읽을 수 있어요.

### 사람이 읽는 한 줄로 보면

도구가 이걸 풀어주면 보통 이런 식으로 보여요.

```text
IP 192.168.0.10.51515 > 8.8.8.8.53: UDP, length 24
```

이 한 줄에서 읽어야 할 건 이거예요.

- `.51515 > .53` — 1번째 줄의 Source Port / Destination Port
- `UDP` — IP 헤더의 Protocol 값이 `17` 이라는 뜻
- `length 24` — **애플리케이션 데이터 길이**

여기서 많이 헷갈려요. tcpdump 류 출력의 `length 24` 는 보통 **UDP 데이터 길이**를 가리키는 경우가 많아요. 반면 UDP 헤더 안의 `Length` 필드는 **8바이트 헤더까지 포함한 전체 길이**예요. 그러니까 방금 예시라면:

- tcpdump 한 줄의 `length 24` = 데이터 24바이트
- UDP 헤더의 `Length 32` = 헤더 8 + 데이터 24

같은 패킷을 두 도구가 **서로 다른 관점**에서 보여주는 거예요.

---

## 잘못 읽기 쉬운 함정 네 가지

**하나, UDP는 확인을 아예 안 한다고 읽기.**
재전송과 ACK를 transport 헤더에서 안 할 뿐이에요. **체크섬은 여전히 있고**, 필요하면 애플리케이션이 자체 번호나 재시도를 얹을 수도 있어요.

**둘, Length를 데이터 길이로만 읽기.**
UDP 헤더의 `Length` 는 **헤더 8바이트를 포함한 전체 길이**예요.

**셋, 체크섬은 항상 선택 사항이라고 단정하기.**
IPv4에선 `0` 이 가능할 수 있지만, IPv6에서는 일반적으로 **필수**예요.

**넷, UDP가 단순하니까 무조건 더 낫다고 생각하기.**
실시간성에는 잘 맞지만, 순서 보장·재전송·흐름 제어가 필요하면 TCP 쪽이 더 잘 맞아요. 결국 **무조건 우월한 게 아니라 역할이 다른 것**뿐이에요.

---

## 자, 정리해볼까요?

!!! abstract "오늘 우리가 본 것"
    - UDP 기본 헤더는 **딱 8바이트(64비트)** 예요.
    - 1줄: Source Port + Destination Port — 어느 서비스끼리 이야기하는지.
    - 2줄: Length + Checksum — 전체 길이와 최소한의 무결성 검사.
    - TCP처럼 sequence 번호, ACK, flags, window 같은 칸은 없어요.
    - 그래서 UDP는 **짧고 가볍지만**, 최소한의 전달 정보와 체크는 남겨둔 헤더예요.

[TCP vs UDP](../basic/03-tcp-vs-udp.md){ data-preview }에서 *"UDP는 빠른 친구다"* 정도로 잡았던 감각이, 이제는 *"그 빠름이 포트 · 길이 · 체크섬 네 칸만 남긴 8바이트 헤더에서 나온다"* 로 한 단계 또렷해졌어요.

---

## 이어서 보면 좋은 글

- TCP와 비교해서 왜 TCP 헤더는 훨씬 복잡한지 같이 보고 싶다면 — [TCP 헤더는 왜 이렇게 칸이 많을까요?](./tcp-header-anatomy.md){ data-preview }
- UDP를 감싸는 IP 헤더가 IPv4일 때 앞칸이 어떻게 생겼는지 보고 싶다면 — [IPv4 헤더 한 줄 한 줄 읽기](./ipv4-header-anatomy.md){ data-preview }
- IPv6 위에서 UDP 체크섬이 왜 더 엄격하게 다뤄지는지 앞단부터 보고 싶다면 — [IPv6 헤더는 왜 딱 40바이트일까요?](./ipv6-header-anatomy.md#row-2){ data-preview }
- TCP와 UDP의 큰 성격 차이를 다시 큰 그림으로 보고 싶다면 — [TCP vs UDP - 꼼꼼한 친구와 빠른 친구는 뭐가 다를까요?](../basic/03-tcp-vs-udp.md){ data-preview }

여기까지 오면 보통 이런 궁금증이 바로 이어져요.

> *"좋아요, 이제 UDP 헤더 칸은 알겠어요. 그럼 TCP 쪽에서 보던 `SYN`, `ACK`, 재전송 같은 신호는 캡처 화면에서 실제로 어떻게 드러나죠?"*

그 관심사는 자연스럽게 **패킷 캡처 장면 해석** 쪽으로 이어져요.
