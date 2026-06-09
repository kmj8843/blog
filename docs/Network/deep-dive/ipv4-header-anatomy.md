---
title: IPv4 헤더 한 줄 한 줄 읽기
description: 기본편에서 카드 4개로만 봤던 IP 헤더를, 32비트 격자 위 13개 필드로 직접 펼쳐서 비트 단위로 읽어봐요.
icon: lucide/scan-line
created: 2026-05-18
updated: 2026-06-09
tags:
  - Network
  - IP
  - IPv4
  - Packet
---

# IPv4 헤더 한 줄 한 줄 읽기

> 우리가 평소에 "IP 헤더" 라고 부르는 건, 사실 **32비트짜리 줄이 다섯 줄 깔린 격자**예요.

[IP 주소와 라우팅](../basic/02-ip-and-routing.md){ data-preview }에서는 IP 헤더를 **카드 4장**(출발지 IP / 도착지 IP / TTL / 프로토콜) 정도로 먼저 잡았어요. 그걸로 큰 흐름은 충분히 따라갈 수 있었죠. 근데 막상 `tcpdump -x` 나 Wireshark hex view 같은 화면을 보면, 그 순간부터는 질문이 달라져요.

- TTL은 대체 **몇 번째 바이트**에 들어 있지?
- 왜 어떤 패킷은 **DF 비트** 때문에 안 쪼개지고 그냥 실패하지?
- 라우터는 이 긴 숫자 줄에서 **무엇을 먼저 읽고** 다음 hop을 정하지?

즉 IPv4 헤더를 까본다는 건, 단순히 비트 공부를 하겠다는 뜻이 아니에요. **라우팅, MTU, TTL, 프로토콜 식별 같은 기본편의 장면이 실제 바이트 위에서 어디에 놓여 있었는지** 확인하는 일이에요.

오늘은 그 카드 안을 열어볼 거예요. 카드 4장이 사실은 **32비트 줄 다섯 개에 13개 필드가 빽빽이 들어찬 격자**였다는 걸 보고, 그 격자가 **무엇을 위한 구조인지**까지 같이 읽어 내려갈게요.

!!! note "이 글의 범위"
    여기서는 **IPv4 기본 헤더(옵션 없는 20바이트짜리)** 만 다뤄요. IPv6 헤더와 IPv4 옵션 영역은 별도 글에서 따로 열어요. 그리고 이 글은 비트 단위로 들어가는 첫 글이라, 이후 심화편 글들이 "이 비트가 어디 있더라" 할 때 자주 돌아오게 될 거예요. RFC 기준으로는 [RFC 791](https://www.rfc-editor.org/rfc/rfc791) 의 IPv4 헤더 형식을 바탕으로 읽어갈 거예요.

---

## 그래서 IPv4 헤더는 한마디로 뭐예요?

IPv4 헤더는 **라우터와 운영체제가 이 패킷을 어떻게 다뤄야 하는지 적어둔 고정 위치의 안내판**에 가까워요.

여기엔 누가 누구에게 가는지뿐 아니라,

- 이 패킷이 **얼마나 큰지**
- 중간에서 **쪼개도 되는지**
- **몇 홉이나 더 살 수 있는지**
- 다음에 읽어야 할 상위 프로토콜이 **TCP인지 UDP인지**

같은 정보가 같이 들어 있어요.

| 기본편에서 잡은 감각 | 카드에서는 | 실제로는 |
|---|---|---|
| 출발지 주소 | 누가 보냈는지 적힌 카드 | Source IP Address |
| 도착지 주소 | 어디로 갈지 적힌 카드 | Destination IP Address |
| TTL | 몇 번 더 갈 수 있는지 적힌 카드 | TTL |
| 프로토콜 | TCP인지 UDP인지 적힌 카드 | Protocol |

즉 이 글은 **새 개념을 더 만든다기보다**, 기본편에서 이미 본 카드 네 장이 **헤더 안의 몇 번째 바이트, 몇 비트 칸에 들어 있는지** 다시 연결해주는 글이에요.

그리고 이런 구조가 왜 생겼는지도 감이 와야 해요. 라우터는 패킷을 오래 붙잡고 해석하면 안 되니까, **자주 읽어야 하는 정보들이 고정된 칸에 빠르게 놓여 있어야** 하거든요. IPv4 헤더는 그 요구를 아주 오래된 방식으로 정리한 결과예요.

---

## 카드 4장에서 격자로

위치는 **헤더 시작부터 몇 번째 바이트인지**로 셀게요. IPv4 기본 헤더는 20바이트라, 1번째 바이트부터 20번째 바이트까지 자리가 정해져 있어요.

| 카드에서 본 것 | 헤더 안에서 위치 | 길이 |
|---|---|---|
| 출발지 IP `192.168.0.10` | 13~16번째 바이트 | 32비트(4바이트) |
| 도착지 IP `142.250.196.78` | 17~20번째 바이트 | 32비트(4바이트) |
| TTL `64` | 9번째 바이트 | 8비트(1바이트) |
| 프로토콜 `TCP` | 10번째 바이트 | 8비트(1바이트) |

카드에서는 네 항목이 동등해 보였지만, 격자에서 보면 **위치도 길이도 다 달라요**. 어떤 건 4바이트를 통째로 차지하고, 어떤 건 1바이트 한 칸이에요. 같은 IP 주소도 출발지는 13번째 바이트부터, 도착지는 17번째 바이트부터 시작해요. 이렇게 **위치가 고정**돼 있어서 라우터가 빠르게 읽을 수 있는 거예요.

그럼 이제 격자 전체를 한 번에 보고, 그다음 줄 단위로 내려가요.

---

## IPv4 헤더 전체 그림 { #header-grid }

기본 IPv4 헤더는 **20바이트(160비트)** 짜리에요. 한 줄을 32비트(4바이트)로 그리면 **딱 5줄**이 나와요.

<div style="margin: 1.5rem 0; border: 2px solid var(--md-default-fg-color--lighter); border-radius: 0.75rem; overflow: hidden; background: color-mix(in srgb, var(--md-default-bg-color) 95%, var(--md-default-fg-color) 5%);">
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); padding: 0.4rem 0.6rem; gap: 0; background: color-mix(in srgb, var(--md-primary-fg-color) 8%, var(--md-default-bg-color)); border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: 0.65rem; color: var(--md-default-fg-color--light); text-align: center;">
    <span style="grid-column: span 4;">0</span>
    <span style="grid-column: span 4;">4</span>
    <span style="grid-column: span 8;">8</span>
    <span style="grid-column: span 16;">16</span>
  </div>
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); gap: 2px; padding: 0.6rem; background: var(--md-default-fg-color--lightest);">
    <div style="grid-column: span 4; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #ef4444 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Version</strong><br/><small>4b</small></div>
    <div style="grid-column: span 4; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #f97316 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>IHL</strong><br/><small>4b</small></div>
    <div style="grid-column: span 8; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #eab308 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>ToS / DSCP+ECN</strong><br/><small>8b</small></div>
    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #22c55e 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Total Length</strong><br/><small>16b</small></div>

    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #14b8a6 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Identification</strong><br/><small>16b</small></div>
    <div style="grid-column: span 3; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #06b6d4 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Flags</strong><br/><small>3b</small></div>
    <div style="grid-column: span 13; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #0ea5e9 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Fragment Offset</strong><br/><small>13b</small></div>

    <div style="grid-column: span 8; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #6366f1 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>TTL</strong><br/><small>8b</small></div>
    <div style="grid-column: span 8; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #8b5cf6 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Protocol</strong><br/><small>8b</small></div>
    <div style="grid-column: span 16; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #a855f7 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Header Checksum</strong><br/><small>16b</small></div>

    <div style="grid-column: span 32; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #ec4899 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Source IP Address</strong><br/><small>32b</small></div>

    <div style="grid-column: span 32; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #f43f5e 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>Destination IP Address</strong><br/><small>32b</small></div>

    <div style="grid-column: span 32; padding: 0.5rem 0.4rem; background: color-mix(in srgb, var(--md-default-fg-color) 10%, var(--md-default-bg-color)); text-align: center; font-size: 0.75rem; border-radius: 0.25rem; color: var(--md-default-fg-color--light); border: 1px dashed var(--md-default-fg-color--lighter);"><strong>Options</strong> <small>(있을 수도, 없을 수도 — 보통 없음)</small></div>
  </div>
</div>

이 격자가 IPv4 헤더의 모든 것이에요. 가로 한 줄이 **32비트(4바이트)**, 세로로 **5~6줄**. 옵션이 없으면 5줄이라서 정확히 **20바이트**예요. 격자 안의 한 칸은 비트 하나에 대응한다고 생각하면 돼요. 칸이 넓을수록 그 필드가 차지하는 비트 수가 많은 거예요.

색을 줄별이 아니라 **필드별로 다르게 입힌 이유**가 있어요. 같은 줄 안에 여러 필드가 같이 살기도 하거든요. 첫째 줄만 봐도 **Version(4b) + IHL(4b) + ToS(8b) + Total Length(16b)** 네 필드가 한 줄에 같이 들어가 있어요. 색이 다르면 그 경계가 한눈에 보여요.

이제 줄 단위로 내려가요. 줄마다 "이 줄이 왜 이렇게 생겼는지" 한 가지 이유가 있어요.

---

## 1번째 줄 — 자기소개와 길이 { #row-1 }

**Version (4비트) · IHL (4비트) · ToS (8비트) · Total Length (16비트)**

| 필드 | 길이 | 의미 | 자주 보는 값 |
|---|---|---|---|
| Version | 4비트 | IP 버전. 4면 IPv4, 6이면 IPv6 | `4` |
| IHL | 4비트 | 헤더 길이를 **4바이트 단위**로 표현 | `5` (= 5 × 4바이트 = 20바이트) |
| ToS / DSCP+ECN | 8비트 | 이 패킷의 우선순위·혼잡 신호 | `0x00` 또는 `0x10` 류 |
| Total Length | 16비트 | 헤더 + 데이터 전체 길이(바이트) | `40` ~ `1500` 근처 |

첫 줄이 하는 일은 **"나 IPv4고, 헤더는 이만큼이고, 전체는 이만큼이야"** 라고 자기소개를 하는 거예요.

여기서 IHL이 좀 헷갈리는 친구예요. 4비트짜리라 0~15까지밖에 못 적는데, 어떻게 헤더 길이를 표현할까요? 답은 **"4바이트 단위로 센다"** 예요. IHL이 `5` 면 헤더는 `5 × 4 = 20바이트`, IHL이 `15` 면 `15 × 4 = 60바이트`. 그래서 IPv4 헤더는 **최소 20바이트, 최대 60바이트**예요. 옵션이 들어가면 길어지는 거고, 옵션이 없으면 IHL은 항상 `5` 예요.

Total Length는 16비트라서 최대 `65535`. 즉 **IP 패킷 한 개는 이론상 64KB까지** 가능해요. 실제로는 이렇게 큰 패킷을 그대로 보내지 못해요. 중간 회선이 못 받거든요. 그 이야기는 [MTU와 단편화](../basic/20-mtu-fragmentation-and-path-mtu.md){ data-preview } 에서 다뤘어요.

ToS는 옛날 이름이고, 지금은 같은 8비트를 **DSCP(6비트) + ECN(2비트)** 으로 나눠 써요. DSCP는 *"이 패킷 좀 빨리 보내줘"* 같은 우선순위 표시고, ECN은 *"길 막혔어"* 신호예요. 기본편의 [TCP 재전송과 신뢰성](../basic/21-tcp-retransmission-and-reliability.md){ data-preview } 이야기와 연결되는 칸인데, 이 글에서는 *"여기 있다"* 정도만 짚어둘게요.

---

## 2번째 줄 — 쪼개진 조각의 정체 { #row-2 }

**Identification (16비트) · Flags (3비트) · Fragment Offset (13비트)**

| 필드 | 길이 | 의미 | 자주 보는 값 |
|---|---|---|---|
| Identification | 16비트 | 같은 원본 패킷에서 쪼개진 조각들에 공통으로 붙는 번호 | 매번 달라짐 |
| Flags | 3비트 | `[예약(0) · DF · MF]` 세 비트 | `010` (DF=1) 흔함 |
| Fragment Offset | 13비트 | 원본의 어디서부터 잘린 조각인지, **8바이트 단위** | `0` 또는 잘렸으면 양수 |

두 번째 줄 전체가 **"이 패킷이 쪼개진 조각인지, 쪼개졌다면 몇 번째 조각인지"** 를 표현하는 데 쓰여요. 줄 하나를 통째로 단편화(fragmentation) 에 할당했다는 게 IPv4가 단편화를 얼마나 자주 의식했는지 보여줘요.

Flags 의 3비트 중 의미 있는 건 두 개예요.

- **DF (Don't Fragment)** — *"쪼개지 마. 못 보내겠으면 그냥 버려"*
- **MF (More Fragments)** — *"내 뒤에 조각이 더 있어"*

요즘 인터넷에서는 DF=1 로 보내고, 너무 크면 라우터가 **ICMP "Fragmentation Needed"** 로 알려주는 방식(Path MTU Discovery) 을 써요. 이 흐름이 어긋날 때 일어나는 사고가 **MTU 블랙홀** 이고, [MTU와 단편화](../basic/20-mtu-fragmentation-and-path-mtu.md){ data-preview } 에서 살짝 본 그 장면이에요.

Fragment Offset이 13비트인 이유도 같은 줄 안에서 결정돼요. 16비트짜리 Total Length 가 최대 65535를 가리키니까, 그 안에서 위치를 가리키려면 13비트 + 8바이트 단위(2^13 × 8 = 65536) 면 딱 맞거든요. **비트 폭이 우연히 정해진 게 아니라 다른 필드와 맞물려서 정해졌다**는 게 IPv4 헤더 곳곳에 깔린 설계 감각이에요.

---

## 3번째 줄 — 살아있을 시간과 다음에 누구한테 { #row-3 }

**TTL (8비트) · Protocol (8비트) · Header Checksum (16비트)**

| 필드 | 길이 | 의미 | 자주 보는 값 |
|---|---|---|---|
| TTL | 8비트 | 라우터 한 번 거칠 때마다 1씩 줄어듦. 0이면 폐기 | `64`, `128`, `255` |
| Protocol | 8비트 | IP 위에 얹힌 상위 프로토콜 번호 | `6` (TCP), `17` (UDP), `1` (ICMP) |
| Header Checksum | 16비트 | 헤더만 검사하는 체크섬. 데이터는 검사 안 함 | 매 hop마다 재계산 |

[IP 주소와 라우팅의 IP 헤더 카드](../basic/02-ip-and-routing.md#ip-header-card){ data-preview } 에서 본 **TTL** 과 **Protocol** 카드가 바로 이 줄에 있어요. 둘 다 8비트짜리 한 칸이고, 같은 줄 오른쪽 절반은 Header Checksum 이 16비트로 차지해요.

TTL이 8비트라서 최대값이 `255`. 운영체제마다 초기값이 달라요. 리눅스/macOS는 보통 `64`, 윈도는 `128`, 네트워크 장비는 `255` 로 시작하는 경우가 많아요. 그래서 `ping` 응답의 TTL 값만 봐도 *"상대편이 대충 어떤 시스템이고, 사이에 라우터를 몇 개 거쳤는지"* 짐작할 수 있어요. 예를 들어 `ping` 응답이 TTL `54` 면, 상대가 `64` 로 출발해서 10홉을 거쳤구나 하고 읽어요. `traceroute` 가 일부러 TTL을 `1, 2, 3...` 으로 올려가면서 보내는 것도 이 필드 덕분이고요.

Protocol 번호는 [IANA 가 관리](https://www.iana.org/assignments/protocol-numbers/) 해요. 외울 건 세 개면 충분해요. `6` = TCP, `17` = UDP, `1` = ICMP. tcpdump 같은 도구가 *"TCP 패킷"* 이라고 알려주는 건 결국 이 1바이트를 보고 결정하는 거예요.

Header Checksum 은 좀 특이해요. **헤더만** 검사해요. 데이터는 안 봐요. 데이터의 무결성은 TCP/UDP 가 따로 자기들 체크섬으로 챙겨요. 그리고 TTL이 매 홉마다 1씩 줄어드니까, **체크섬도 매 홉마다 다시 계산**돼요. 라우터 입장에서는 굳이 안 해도 되는 계산이 한 번씩 더 붙는 셈인데, IPv6 가 이 필드를 아예 없애 버린 이유이기도 해요. ("그건 위 계층이 알아서 해라")

---

## 4·5번째 줄 — 누가, 어디로 { #row-4-5 }

**Source IP Address (32비트) · Destination IP Address (32비트)**

| 필드 | 길이 | 의미 | 자주 보는 값 |
|---|---|---|---|
| Source IP | 32비트 | 보낸 사람 IP | `192.168.0.10` |
| Destination IP | 32비트 | 받는 사람 IP | `142.250.196.78` |

[IP 주소와 라우팅의 IP 헤더 카드](../basic/02-ip-and-routing.md#ip-header-card){ data-preview } 에서 본 카드 두 장이 사실은 **각각 한 줄을 통째로** 쓰고 있어요. IPv4 주소가 32비트 = 4바이트라서 한 줄이 딱 한 주소예요. 우리가 보는 `192.168.0.10` 은 32비트를 8비트씩 끊어서 십진수로 보여준 형태예요.

```
   192   .    168   .    0     .    10
11000000 . 10101000 . 00000000 . 00001010
   8b         8b         8b         8b    =  32b
```

이 두 줄이 헤더에서 **가장 자주 바뀌는 줄**이에요. 라우터는 사실상 이 두 줄(특히 Destination IP) 을 보고 다음 hop을 정해요. 라우팅 테이블에서 일치하는 prefix 를 찾는 동작은 기본편 [IP 주소와 라우팅 — 라우팅의 기초](../basic/02-ip-and-routing.md#routing-basics){ data-preview } 에서 잡은 감각 그대로예요.

---

## 6번째 줄 (있을 수도, 없을 수도) — Options

옵션 영역은 IHL이 `5` 보다 클 때만 등장해요. 들어갈 수 있는 내용은 라우트 기록(Record Route), 소스 라우팅, 타임스탬프 같은 것들인데, **실무 패킷에서 보이는 일은 거의 없어요**. 보안상 차단당하는 경우가 많고, 요즘 인터넷이 이런 옵션 없이도 굴러가도록 정착됐거든요.

그래서 이 글에서도 *"6번째 줄은 보통 비어 있다"* 정도만 기억하면 충분해요. 옵션이 실제로 무엇을 했고 왜 사장됐는지는 별도 글에서 따로 다룰 만한 주제예요.

---

## 실제 패킷에서 이렇게 보여요

이론으로만 보면 격자가 머릿속에 잘 안 들어와요. 두 가지 도구의 출력을 같이 읽어볼게요.

### 먼저, 진짜 바이트로 보면 { #real-bytes }

`tcpdump -x` 나 `xxd`, `wireshark` 의 hex view 같은 도구는 패킷을 **16진수 바이트의 나열**로 보여줘요. 한 줄에 보통 16바이트씩 끊어 찍어요. 옵션 없는 IPv4 헤더(20바이트) 만 떼서 보면 이렇게 생겼어요.

```
0x0000  45 00 00 28 1c 46 40 00 40 06 b1 e6 c0 a8 00 0a
0x0010  8e fa c4 4e
```

왼쪽의 `0x0000`, `0x0010` 은 **이 줄이 패킷 처음부터 몇 바이트 떨어진 자리에서 시작하는지** 알려주는 오프셋이에요. 즉 첫 줄은 1~16번째 바이트, 둘째 줄은 17~20번째 바이트예요. 위 표에서 "N번째 바이트" 라고 한 게 바로 이 hex 한 칸 한 칸을 가리켜요. 첫 줄 왼쪽이 1번째 바이트, 그 다음이 2번째 바이트, … 이런 식으로요.

| 헤더 안 위치 | hex 에서 잘라보면 | 어떻게 읽나 |
|---|---|---|
| 1번째 바이트 | `45` | 상위 4비트(`4`) = Version=4, 하위 4비트(`5`) = IHL=5 → 헤더 길이 5×4=20바이트 |
| 2번째 바이트 | `00` | ToS = 0 |
| 3~4번째 바이트 | `00 28` | Total Length = 0x0028 = 40바이트 |
| 5~6번째 바이트 | `1c 46` | Identification (값 자체는 임의) |
| 7~8번째 바이트 | `40 00` | Flags=DF, Fragment Offset=0 |
| **9번째 바이트** | **`40`** | **TTL = 0x40 = 64** |
| **10번째 바이트** | **`06`** | **Protocol = 6 = TCP** |
| 11~12번째 바이트 | `b1 e6` | Header Checksum |
| **13~16번째 바이트** | **`c0 a8 00 0a`** | **Source IP = 192.168.0.10** (`0xc0`=192, `0xa8`=168, `0x00`=0, `0x0a`=10) |
| **17~20번째 바이트** | **`8e fa c4 4e`** | **Destination IP = 142.250.196.78** (`0x8e`=142, `0xfa`=250, `0xc4`=196, `0x4e`=78) |

카드 4장(출발지 IP·도착지 IP·TTL·프로토콜) 이 hex 위에서 어디 박혀 있는지 이제 손가락으로 짚을 수 있어요. *"13번째 바이트부터 4칸이 출발지 IP"* 가 더 이상 추상적인 말이 아니에요.

!!! note "hex 한 줄이 왜 16바이트인가요?"
    `hexdump -C`, `xxd`, Wireshark hex view 같은 도구가 관행적으로 한 줄 = 16바이트로 끊어 보여줘요. 사람이 16진수 두 자리(=1바이트) 를 가로로 16개 정도까지가 한눈에 들어와서요. 즉 "한 줄"은 **IPv4 헤더의 32비트 줄(=4바이트)** 과 다른 개념이에요. 우리가 본문에서 말한 "1번째 줄, 2번째 줄"은 **헤더 격자의 4바이트 줄**, hex 출력의 "한 줄"은 **16바이트 묶음**. 헷갈리기 쉬워서 이 글의 표는 일부러 "N번째 바이트" 단위로 통일했어요.

### 그다음, tcpdump 한 줄로 보면

같은 패킷을 `tcpdump` 가 사람이 읽기 좋게 풀어주면 이렇게 보여요.

```
14:32:01.123456 IP 192.168.0.10.51324 > 142.250.196.78.443:
    Flags [S], seq 3829471234, win 64240,
    options [mss 1460,sackOK,TS val 12345 ecr 0,nop,wscale 7], length 0
```

이 한 줄에서 **IPv4 헤더가 직접 보여주는 부분**만 추려보면 이래요.

- `IP` — 1번째 바이트의 상위 4비트 = Version = `4`
- `192.168.0.10` → `142.250.196.78` — 13~16, 17~20번째 바이트 (Source IP, Destination IP)
- `Flags [S]` 가 TCP라는 사실 자체가 — 10번째 바이트 Protocol = `6`
- 출력에 직접 안 나오지만 거의 확실한 값들 — 1번째 바이트 하위 4비트 IHL = `5` (옵션 없음), Total Length ≈ 40 + TCP 헤더 + 페이로드 길이

`51324`, `443` 같은 포트 번호는 **IP 헤더가 아니라 TCP 헤더의 1번째 줄** 에 있는 값이에요. tcpdump 한 줄에서 IP 헤더의 값과 TCP 헤더의 값이 한 줄에 같이 보이니까 헷갈리기 쉬워요. **점 4개 주소 = IP 헤더**, **점 뒤의 숫자(`.51324`, `.443`) = TCP/UDP 헤더** 라고 기억해두면 분리해서 읽혀요.

---

## 잘못 읽기 쉬운 함정 세 가지

비트 단위로 처음 들여다보면 같은 자리에서 자주 미끄러져요. 세 개만 짚을게요.

**하나, "헤더가 20바이트" 라는 말이 항상 옳다고 생각하기.**
정확히는 **"옵션이 없으면 20바이트"** 예요. IHL을 한 번도 확인하지 않고 코드를 짜면 옵션이 들어간 패킷에서 데이터 시작 위치가 어긋나요. IHL × 4 가 데이터 시작 오프셋이에요.

**둘, Total Length 가 와이어 위의 프레임 크기라고 생각하기.**
Total Length는 **IP 헤더 + IP 데이터** 까지예요. 이더넷 프레임의 헤더와 트레일러(FCS) 는 포함하지 않아요. 즉 와이어로 흐르는 실제 바이트는 Total Length 보다 14바이트 정도 더 많아요.

**셋, TTL을 "초(seconds)" 로 읽기.**
이름이 *Time To Live* 라서 시간 단위처럼 보이지만, 실제로는 **거쳐간 라우터의 수**(hop count) 예요. 1초가 아니라 1홉씩 줄어요. 옛날 RFC 초안에서 진짜 시간으로 의도했던 흔적이 이름에 남은 거고, 지금은 hop count 로 굳었어요.

---

## 자, 정리해볼까요?

!!! abstract "오늘 우리가 본 것"
    - IPv4 기본 헤더는 **32비트 × 5줄 = 20바이트** 짜리 격자.
    - 1줄: Version + IHL + ToS + Total Length — 자기소개와 길이.
    - 2줄: Identification + Flags + Fragment Offset — 단편화 전담.
    - 3줄: TTL + Protocol + Checksum — 살아있을 시간과 위 계층 안내.
    - 4·5줄: Source IP, Destination IP — 각각 한 줄을 통째로 차지.
    - 옵션은 IHL이 `5` 보다 클 때만 등장하고, 실무에서는 거의 안 보임.
    - [IP 주소와 라우팅의 IP 헤더 카드](../basic/02-ip-and-routing.md#ip-header-card){ data-preview } 4장은 사실 이 격자 위 13개 필드 중 일부였음.

[IP 주소와 라우팅](../basic/02-ip-and-routing.md){ data-preview } 에서 *"패킷 헤더에 출발지·도착지 IP, TTL, 프로토콜이 있다"* 까지만 잡고 갔던 감각이, 이제는 *"그게 32비트 줄 어디 어느 칸에 박혀 있다"* 로 한 단계 또렷해졌어요.

---

## 이어서 보면 좋은 글

이 헤더 격자는 다른 심화편 글에서 자주 다시 등장해요.

- 같은 자리에 다른 모양으로 다시 그려진 헤더가 보고 싶다면 — [IPv6 헤더는 왜 딱 40바이트일까요?](./ipv6-header-anatomy.md){ data-preview }
- 이 IP 헤더 바로 위에 얹히는 TCP 헤더가 어떻게 생겼는지 보고 싶다면 — [TCP 헤더는 왜 이렇게 칸이 많을까요?](./tcp-header-anatomy.md){ data-preview }
- 격자가 아니라 실제 캡처 한 줄 위에서 IP 헤더 값을 읽고 싶다면 — `tcpdump` 첫인상 (예정)

여기까지 읽었다면, 보통 이런 비교가 같이 궁금해져요.

> *"같은 IP 헤더인데, IPv6로 가면 왜 주소는 훨씬 길어지고 대신 기본 헤더 길이는 오히려 딱 고정돼 있죠?"*

그 감각은 바로 [IPv6 헤더는 왜 딱 40바이트일까요?](./ipv6-header-anatomy.md){ data-preview }에서 이어서 펼쳐볼 수 있어요.
