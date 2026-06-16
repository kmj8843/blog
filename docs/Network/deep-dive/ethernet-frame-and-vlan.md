---
title: 이더넷 프레임과 VLAN 태그 해부하기
description: IP 패킷을 감싸서 로컬 네트워크로 실어 나르는 이더넷 프레임의 구조와, 그 사이에 끼어드는 VLAN 태그의 4바이트를 자세히 들여다봐요.
icon: lucide/layers-2
created: 2026-05-20
updated: 2026-06-16
tags:
  - Network
  - Ethernet
  - VLAN
  - MAC
---

# 이더넷 프레임과 VLAN 태그 해부하기

> 우리가 보내는 모든 데이터는 결국 **14바이트의 머리(Header)**와 **4바이트의 꼬리(FCS)**를 단 이더넷 프레임에 담겨 전선을 타고 흘러가요.

[ARP와 로컬 전달 — IP 주소와 MAC 주소의 협업](../basic/18-arp-and-local-delivery.md){ data-preview }에서 우리는 같은 동네(서브넷) 안에서 패킷이 어떻게 배달되는지 큰 그림을 봤어요. IP 패킷이 **이더넷 프레임**이라는 택배 상자에 담겨서 MAC 주소를 보고 배달된다는 사실을 배웠죠.

근데 이 글이 필요한 이유는, 로컬 네트워크 장면을 보다가 자꾸 **IP 위 이야기만 하다가 끝나기 쉽기 때문**이에요.

- 패킷이 실제 선 위에 올라갈 때는 **무슨 봉투**를 입고 가는지
- 왜 목적지 MAC이 출발지보다 **앞에 놓이는지**
- VLAN 태그는 왜 프레임 맨 앞이 아니라 **중간에 끼어드는지**

이걸 알아야 L2 장면이 따로 보이기 시작하거든요. 오늘은 그 택배 상자를 직접 열어볼 거예요. 상자 겉면에 MAC 주소가 어디에, 어떤 순서로 적혀 있는지, 그리고 기업 네트워크에서 방을 나누는 데 쓰는 **VLAN 태그**는 상자의 어느 틈새에 끼워 넣는지 비트 단위로 꼼꼼하게 읽어 내려갈 거예요.

!!! note "이 글의 범위"
    여기서는 현대 인터넷 트래픽의 표준인 **Ethernet II 프레임** 구조를 중심으로 다뤄요. 그리고 IEEE 802.1Q 표준에 따른 **VLAN 태깅**이 프레임 구조를 어떻게 바꾸는지 집중적으로 살펴볼 거예요. 스위칭 알고리즘이나 STP 같은 복잡한 스위치 내부 동작은 여기서 다루지 않아요. EtherType 값 구분은 [RFC 9542](https://www.rfc-editor.org/rfc/rfc9542.html) 쪽 정리를 가볍게 참고하고, VLAN 태그 자체는 [IEEE 802.1Q](https://standards.ieee.org/ieee/802.1Q/6844/)의 큰 그림을 따라 읽어볼게요.

---

## 그래서 이더넷 프레임은 한마디로 뭐예요?

기본편에서 이더넷 프레임을 단순히 **IP 패킷을 담는 봉투**라고 불렀다면, 이번 글에서는 그 봉투가 **정확히 어떤 칸으로 이루어져 있는지** 보는 거예요.

즉 여기서 확인할 건,

- 받는 사람 이름(도착지 MAC)은 어디에 적는지
- 보낸 사람(출발지 MAC)은 어디에 적는지
- 내용물이 `IP` 인지 `ARP` 인지 알려주는 **EtherType** 은 어디에 있는지

예요.

| 기본편에서 잡은 감각 | 비유에서는 | 실제로는 |
|---|---|---|
| 이더넷 프레임 | IP 패킷을 담는 봉투 | Ethernet II Frame |
| 도착지 MAC | 받는 사람 주소 | Destination MAC Address |
| 출발지 MAC | 보낸 사람 주소 | Source MAC Address |
| EtherType | 내용물의 종류(IP인지 ARP인지) | Type / Length Field |
| FCS | 봉투가 찢어지지 않았는지 확인하는 씰 | Frame Check Sequence |

그러니까 이 글은 단순히 "봉투가 있다"는 사실을 넘어, **봉투의 칸칸이 어떤 의미를 담고 있는지** 비트와 바이트 단위로 다시 연결해주는 글이에요.

---

## 이더넷 프레임 전체 그림 { #frame-grid }

현대 네트워크에서 가장 흔히 보는 **Ethernet II** 프레임 구조예요. 전체 길이는 헤더와 트레일러를 합쳐 **최소 64바이트에서 최대 1518바이트**까지 늘어날 수 있어요.

<div style="margin: 1.5rem 0; border: 2px solid var(--md-default-fg-color--lighter); border-radius: 0.75rem; overflow: hidden; background: color-mix(in srgb, var(--md-default-bg-color) 95%, var(--md-default-fg-color) 5%);">
  <div style="display: grid; grid-template-columns: repeat(14, 1fr); padding: 0.4rem 0.6rem; gap: 0; background: color-mix(in srgb, var(--md-primary-fg-color) 8%, var(--md-default-bg-color)); border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: 0.65rem; color: var(--md-default-fg-color--light); text-align: center;">
    <span style="grid-column: span 6;">6바이트</span>
    <span style="grid-column: span 6;">6바이트</span>
    <span style="grid-column: span 2;">2바이트</span>
  </div>
  <div style="display: grid; grid-template-columns: repeat(14, 1fr); gap: 2px; padding: 0.6rem; background: var(--md-default-fg-color--lightest);">
    <div style="grid-column: span 6; padding: 1rem 0.4rem; background: color-mix(in srgb, #ef4444 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.85rem; border-radius: 0.25rem;"><strong>Destination MAC</strong><br/><small>48b</small></div>
    <div style="grid-column: span 6; padding: 1rem 0.4rem; background: color-mix(in srgb, #3b82f6 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.85rem; border-radius: 0.25rem;"><strong>Source MAC</strong><br/><small>48b</small></div>
    <div style="grid-column: span 2; padding: 1rem 0.4rem; background: color-mix(in srgb, #22c55e 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.85rem; border-radius: 0.25rem;"><strong>Type</strong><br/><small>16b</small></div>
    
    <div style="grid-column: span 14; padding: 2rem 0.4rem; background: color-mix(in srgb, var(--md-default-fg-color) 5%, var(--md-default-bg-color)); text-align: center; font-size: 0.9rem; border-radius: 0.25rem; border: 1px dashed var(--md-default-fg-color--lighter);"><strong>Payload (Data)</strong><br/><small>IP 패킷, ARP 등 (46 ~ 1500바이트)</small></div>
    
    <div style="grid-column: span 14; padding: 0.5rem 0.4rem; background: color-mix(in srgb, #eab308 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>FCS (Frame Check Sequence)</strong><br/><small>32b (4바이트)</small></div>
  </div>
</div>

이 그림이 우리가 "이더넷 프레임"이라고 부르는 것의 정체예요. 특이한 점은 **도착지 주소가 출발지 주소보다 먼저 나온다**는 거예요. 스위치가 프레임을 받자마자 "어디로 보낼지" 빨리 결정해서 내보낼 수 있게 하려는 설계예요.

이제 각 칸이 어떤 숫자를 담고 있는지 자세히 살펴볼까요?

| 필드명 | 길이(bit) | 의미 | 자주 보는 값 |
|---|---|---|---|
| Destination MAC | 48비트 | 받는 장비의 물리적 주소 | `ff:ff:ff:ff:ff:ff` (브로드캐스트) |
| Source MAC | 48비트 | 보내는 장비의 물리적 주소 | 각 장비의 고유 MAC |
| Type (EtherType) | 16비트 | 상위 프로토콜 종류 | `0x0800` (IPv4), `0x0806` (ARP) |
| Payload | 최대 12,000비트 | 실제 데이터 (IP 패킷 등) | 46 ~ 1500 바이트 |
| FCS | 32비트 | 전송 중 에러 발생 여부 체크 | 하드웨어가 자동 계산 |

여기서 **EtherType** 필드는 아주 중요한 역할을 해요. 16비트(2바이트) 값인데, 이 값이 **0x0600(1536)** 이상이면 "이 데이터는 어떤 종류다"를 알려주는 **Type**으로 해석하고, 그보다 작으면 데이터의 길이를 나타내는 **Length**로 해석해요. 우리가 인터넷에서 쓰는 거의 모든 트래픽은 Ethernet II 형식을 따르기 때문에, 보통 `0x0800`(IPv4) 같은 타입을 보게 돼요.

---

## 4바이트의 침입자, VLAN 태그 { #vlan-tag }

기업이나 데이터 센터처럼 큰 네트워크에서는 물리적으로는 하나인 선을 논리적으로 여러 개의 방(VLAN)으로 나누어 써야 할 때가 있어요. 이때 사용하는 표준이 **IEEE 802.1Q**예요.

재밌는 건, VLAN 정보를 전달하기 위해 프레임 구조를 완전히 새로 만드는 게 아니라, 기존 이더넷 프레임의 **출발지 MAC과 Type 필드 사이에 4바이트짜리 태그를 쑥 끼워 넣는다**는 점이에요.

<div style="margin: 1.5rem 0; border: 2px solid var(--md-default-fg-color--lighter); border-radius: 0.75rem; overflow: hidden; background: color-mix(in srgb, var(--md-default-bg-color) 95%, var(--md-default-fg-color) 5%);">
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); padding: 0.4rem 0.6rem; gap: 0; background: color-mix(in srgb, var(--md-primary-fg-color) 8%, var(--md-default-bg-color)); border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: 0.65rem; color: var(--md-default-fg-color--light); text-align: center;">
    <span style="grid-column: span 16;">16비트 (TPID)</span>
    <span style="grid-column: span 3;">3비트</span>
    <span style="grid-column: span 1;">1b</span>
    <span style="grid-column: span 12;">12비트 (VID)</span>
  </div>
  <div style="display: grid; grid-template-columns: repeat(32, 1fr); gap: 2px; padding: 0.6rem; background: var(--md-default-fg-color--lightest);">
    <div style="grid-column: span 16; padding: 0.8rem 0.4rem; background: color-mix(in srgb, #8b5cf6 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>TPID</strong><br/><small>0x8100</small></div>
    <div style="grid-column: span 3; padding: 0.8rem 0.4rem; background: color-mix(in srgb, #f59e0b 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>PCP</strong></div>
    <div style="grid-column: span 1; padding: 0.8rem 0.4rem; background: color-mix(in srgb, #6b7280 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>D</strong></div>
    <div style="grid-column: span 12; padding: 0.8rem 0.4rem; background: color-mix(in srgb, #ec4899 18%, var(--md-default-bg-color)); text-align: center; font-size: 0.8rem; border-radius: 0.25rem;"><strong>VLAN ID</strong><br/><small>0~4095</small></div>
  </div>
</div>

VLAN 태그는 이렇게 네 부분으로 나뉘어요.

- **TPID (16비트)**: "지금부터 VLAN 태그가 시작된다"는 신호예요. 우리가 여기서 다루는 **일반적인 802.1Q 태그**에서는 보통 `0x8100`을 봐요. 스위치는 이 값을 보고 "아, 이건 일반 프레임이 아니라 태그가 달린 프레임이구나!" 하고 알게 되죠.
- **PCP (3비트)**: 우선순위(Priority)예요. 보이스톡처럼 끊기면 안 되는 데이터에 높은 숫자를 줘서 먼저 보내게 할 때 써요.
- **DEI (1비트)**: "길이 막히면 이 프레임은 버려도 돼"라고 표시하는 비트예요. (옛날 이름은 CFI였어요.)
- **VID (12비트)**: 가장 중요한 **VLAN ID**예요. 12비트라서 숫자 공간 자체는 `0`부터 `4095`까지지만, 보통 `0`과 `4095`는 예약 값으로 보고 실제로는 그 사이 번호를 방 번호처럼 써요.

이렇게 태그가 붙으면 프레임 전체 길이는 4바이트가 늘어나서 **최소 68바이트, 최대 1522바이트**가 돼요. 여기서 헷갈리기 쉬운 건, 기본편 [MTU와 단편화](../basic/21-mtu-fragmentation-and-path-mtu.md){ data-preview }에서 본 `1500`은 보통 **IP payload 기준의 L3 MTU**라는 점이에요. 즉 **프레임은 1522바이트까지 커질 수 있어도**, 그 안에 실린 IP 쪽 MTU는 여전히 `1500`으로 읽히는 장면이 흔해요.

여기서는 범위만 짧게 묶어둘게요.

> 여기서는 VLAN 태그가 **프레임 어느 칸에 들어가는지**까지만 볼게요. 실제로 이 태그가 왜 필요한지, 네트워크를 논리적인 방처럼 나누는 큰 그림은 [공유기와 홈 네트워크](../basic/13-router-and-home-network.md#home-packet-flow){ data-preview }에서 먼저 감을 잡고, 포트별 태그 처리 같은 장비 동작은 나중에 장비/실습 글에서 더 열어보면 좋아요.

---

## 근데 왜 굳이 MAC 주소 뒤에 끼워 넣나요?

VLAN 태그를 프레임 맨 앞에 붙이지 않고, 굳이 출발지 MAC 주소 뒤에 끼워 넣은 이유가 있어요. 바로 **"옛날 장비와의 호환성"** 때문이에요.

VLAN 태그가 뭔지 모르는 아주 오래된 스위치나 허브가 이 프레임을 받았다고 상상해볼까요? 만약 태그가 맨 앞에 있었다면 주소 위치가 다 뒤로 밀려서 아예 읽지 못했을 거예요. 하지만 주소 바로 뒤에 끼워 넣었기 때문에, 옛날 장비도 일단 "어디로 보내야 하는지(도착지 MAC)"는 정확히 읽을 수 있어요.

물론 EtherType 자리에서 `0x8100`이라는 생소한 값을 보고 당황해서 프레임을 버릴 수도 있지만, 적어도 **주소를 읽는 메커니즘 자체는 깨뜨리지 않으려는** 영리한 설계였던 셈이죠.

---

## 실제 패킷에서는 이렇게 보여요 { #real-bytes }

우리가 `tcpdump`나 `Wireshark`로 패킷을 캡처하면, 이더넷 헤더가 생각보다 짧게 보여서 놀랄 때가 있어요.

### Wireshark에서 본 모습
```text
Ethernet II, Src: 00:0c:29:ab:cd:ef, Dst: 00:0c:29:12:34:56
    Destination: 00:0c:29:12:34:56
    Source: 00:0c:29:ab:cd:ef
    Type: IPv4 (0x0800)
```
분명히 14바이트(6+6+2)가 다 보이죠? 그런데 여기서 질문이 하나 생길 거예요. **"아까 그림에서 본 꼬리표(FCS)는 어디 갔나요?"**

### 사라진 Preamble과 FCS의 비밀
사실 진짜 와이어 위를 흐르는 프레임에는 헤더 앞에 **Preamble(7바이트) + SFD(1바이트)**라는 "준비 운동" 신호가 붙고, 맨 뒤에는 에러 체크를 위한 **FCS(4바이트)**가 붙어요.

하지만 우리가 도구로 캡처한 화면에서는 이게 안 보일 때가 많아요. 왜냐하면 **랜카드(NIC) 수준에서 이 부분은 미리 처리하고 떼버린 뒤**, 진짜 알맹이(주소와 데이터)만 운영체제로 넘겨주기 때문이에요. 

- **Preamble**: "이제 데이터가 가니까 박자 맞춰!"라고 랜카드끼리 신호를 맞추는 부분이에요.
- **FCS**: "오는 길에 데이터 안 깨졌지?"라고 랜카드가 검사한 뒤, 깨졌으면 조용히 버려버려요.

그래서 소프트웨어 도구에서는 이미 검증이 끝난 깨끗한 데이터만 보게 되는 거예요. 마치 택배 상자를 받을 때 송장(Header)은 보지만, 상자를 고정했던 테이프나 완충재(Preamble/FCS)는 뜯어서 버린 뒤에 내용물을 확인하는 것과 비슷하죠.

그리고 이 장면은 [패킷 캡처는 뭘 보는 걸까요?](../basic/12-packet-capture.md#capture-location-matters){ data-preview }에서 말한 핵심이랑 그대로 이어져요. **어디서 잡았느냐**에 따라 이더넷 헤더가 더 잘 보일 수도 있고, 운영체제까지 올라오는 동안 일부 정보가 이미 정리된 상태일 수도 있거든요.

### 그럼 VLAN 태그는 캡처에 항상 보일까요?

그럴 것 같죠? **사실은 아니에요.**

- PC가 일반 사용자용 포트에 붙어 있을 때는 태그가 이미 제거된 채로 올라오는 경우가 많아요.
- 반대로 스위치와 스위치 사이처럼 여러 VLAN을 한 선으로 같이 실어 보내는 구간에서는 태그가 붙은 모습이 보일 수 있어요.
- 그리고 어떤 NIC/드라이버는 VLAN 태그도 하드웨어 수준에서 미리 처리해서, 캡처 화면에서는 평범한 Ethernet II처럼 보이게 만들기도 해요.

즉, [공유기와 홈 네트워크](../basic/13-router-and-home-network.md#home-packet-flow){ data-preview }에서 본 "우리 집 안에서 어디를 지나느냐"와 [패킷 캡처](../basic/12-packet-capture.md#capture-location-matters){ data-preview }에서 본 "어디서 바라보느냐"가 합쳐져야, *왜 어떤 캡처에는 VLAN 태그가 있고 어떤 캡처에는 없는지* 덜 헷갈려요.

---

## 잘못 읽기 쉬운 함정 { #pitfalls }

이더넷 프레임을 읽을 때 자주 헷갈리는 포인트 세 가지예요.

**하나, 프레임 크기(Frame Size)와 MTU를 섞어서 생각하기.**
[MTU와 단편화](../basic/21-mtu-fragmentation-and-path-mtu.md){ data-preview }에서 말하는 1500바이트는 **IP 패킷의 크기**를 말해요. 이더넷 입장에서는 **Payload** 칸에 들어가는 크기죠. 실제 와이어를 흐르는 프레임은 여기에 이더넷 헤더(14바이트)와 FCS(4바이트)를 더해 **1518바이트**가 됩니다. "MTU가 1500이면 프레임도 1500이겠지?"라고 생각하면 18바이트만큼의 오차가 생겨요.

**둘, 모든 VLAN 태그가 눈에 보인다고 생각하기.**
PC가 스위치에 연결된 일반적인 포트에서는 VLAN 태그가 붙지 않은 채로 패킷이 나가요. 스위치 내부에서만 "이건 10번 방 거야"라고 태그를 붙여서 관리하다가, 다시 PC로 보낼 때는 태그를 떼버리거든요. 태그가 직접 붙어서 돌아다니는 건 주로 여러 VLAN을 한 링크로 실어 보내는 구간에서예요. 그래서 평범한 PC에서 캡처하면 VLAN 태그를 구경하기 힘들답니다.

**셋, 이더넷 프레임의 목적지 MAC이 끝까지 유지된다고 생각하기.**
[기본 게이트웨이와 첫 번째 도약](../basic/19-default-gateway-and-first-hop.md){ data-preview }에서 봤듯이, 게이트웨이를 한 번 지나면 바깥 포장은 다시 싸요. 즉 **IP 목적지는 멀리까지 유지되지만, MAC 주소는 홉마다 바뀔 수 있어요.** 그래서 이더넷 프레임은 "인터넷 전체 주소"가 아니라 **지금 이 링크에서 누구에게 건넬지**를 적는 봉투라고 읽어야 해요.

---

## 자, 정리해볼까요?

!!! abstract "오늘 우리가 배운 것"
    - **이더넷 프레임**은 IP 패킷을 로컬 네트워크에서 나르기 위한 "봉투"예요.
    - 구조: **도착지 MAC(6바이트) + 출발지 MAC(6바이트) + EtherType(2바이트)** + 데이터 + FCS(4바이트).
    - **도착지 주소가 먼저 나오는 이유**는 스위치가 더 빨리 배달할 곳을 찾게 하기 위해서예요.
    - **VLAN 태그(802.1Q)**는 MAC 주소 뒤에 **4바이트**를 끼워 넣어 논리적인 방 번호(VID)를 매겨요.
    - 우리가 캡처 도구에서 보는 프레임에는 **Preamble과 FCS**가 안 보일 수 있는데, 랜카드가 미리 처리하고 떼버렸기 때문이에요.
    - [ARP와 로컬 전달](../basic/18-arp-and-local-delivery.md){ data-preview }에서 본 MAC 주소 배달은 사실 이 14바이트 헤더를 읽는 과정이었어요.

---

## 이어서 보면 좋은 글

이더넷 프레임이라는 봉투를 열어봤으니, 이제 그 봉투 안에 담긴 내용물들을 더 깊게 살펴볼 차례예요.

- 봉투 안에 든 IP 편지가 어떻게 생겼는지 궁금하다면 — [IPv4 헤더 한 줄 한 줄 읽기](./ipv4-header-anatomy.md#header-grid){ data-preview }
- 이 봉투가 왜 2계층에 놓이고, IP 패킷과 어떻게 역할이 갈리는지 지도로 다시 보고 싶다면 — [OSI 7계층과 TCP/IP 모델](../basic/08-osi-and-tcp-ip-layers.md){ data-preview }
- 같은 집 안에서 ARP가 왜 브로드캐스트로 흘러가고, 게이트웨이 앞에서 어떤 봉투가 만들어지는지 다시 잇고 싶다면 — [ARP와 로컬 전달](../basic/18-arp-and-local-delivery.md#arp-sequence){ data-preview }
- 이 봉투를 뚫고 들어오는 외부의 위협을 어떻게 막는지 궁금하다면 — [방화벽과 상태 기반 필터링](../basic/15-firewall-and-stateful-filtering.md){ data-preview }

우리는 지금 2계층(이더넷)의 구조를 봤어요. 하지만 이 프레임이 게이트웨이를 넘어 세상 밖으로 나갈 때, 또 다른 모험이 시작돼요.

> *"집 밖으로 나가는 패킷은 왜 항상 게이트웨이라는 문을 거쳐야 할까요?"*

그 첫 번째 문턱에 대한 이야기는 [디폴트 게이트웨이와 세상 밖으로의 첫 발자국](../basic/19-default-gateway-and-first-hop.md){ data-preview }에서 이어서 해볼게요.
