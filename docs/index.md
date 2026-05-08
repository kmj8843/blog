---
title: Home
description: 어려운 기술 개념을 일상의 비유로 풀어내는 블로그. 비개발자도, 개발자도 환영해요.
comments: false
hide:
  - footer
  - navigation
  - toc
  - feedback
render_macros: true
---

# 어렵게 배운 걸, 쉽게 나누는 곳

> *"이거 결국 택배랑 똑같네?"* 하는 순간을 모아둔 블로그예요.

기술 이야기인데, 사전식 정의로 시작하지 않아요.
대신 **택배**, **편지**, **공항** 같은 일상의 장면에서 출발해서
"아~ 그래서 그렇게 동작하는구나!" 하는 지점까지 함께 걸어갑니다.

비개발자도 끝까지 따라올 수 있도록, 개발자에겐 *"이렇게 설명할 수도 있구나"* 싶도록.

[둘러보기 :material-arrow-right:](#2){ .md-button .md-button--primary }
[최신 글 보기 :material-newspaper:](#3){ .md-button }

---

## 카테고리

<div class="grid cards" markdown>

- :material-lan:{ .lg .middle } **네트워크**

    ---

    인터넷은 어떻게 정보를 주고받을까요?
    패킷, IP, 라우팅처럼 매일 쓰지만 잘 모르는 것들을
    택배 비유로 풀어봅니다.

    [:octicons-arrow-right-24: 네트워크 글 보기](Network/index.md)

- :material-rocket-launch-outline:{ .lg .middle } **더 많은 주제, 곧 추가돼요**

    ---

    프론트엔드, 백엔드, DevOps, 데이터베이스…
    하나씩 천천히, 하지만 꾸준히 채워나갈 예정이에요.

    *기다려주세요!*

</div>

---

## 최신 글

<div class="grid cards" markdown>

{% for post in latest_posts(2) %}

- :{{ post.icon | replace('/', '-') }}:{ .lg .middle } **{{ post.title }}**

    ---

    {{ post.description }}

    {% for tag in post.tags %}`{{ tag }}`{% if not loop.last %} · {% endif %}{% endfor %}

    [:octicons-arrow-right-24: 읽으러 가기]({{ post.url }})

{% endfor %}
</div>

---

## 이 블로그를 읽는 법

<div class="grid cards" markdown>

- :material-coffee-outline:{ .lg .middle } **편하게 읽으세요**

    ---

    딱딱한 정의 대신 **비유부터 시작**해요.
    한 번에 다 이해 안 돼도 괜찮아요. 비유만 기억해도 절반은 성공이에요.

- :material-image-multiple-outline:{ .lg .middle } **그림이 친구예요**

    ---

    글마다 **2~4개의 다이어그램**이 들어있어요.
    글이 막히면 그림부터 보세요. 머릿속에 구조가 그려질 거예요.

- :material-lightbulb-on-outline:{ .lg .middle } **"왜?"가 핵심이에요**

    ---

    "이게 뭔지"보다 **"왜 이렇게 됐는지"**에 더 시간을 써요.
    이유를 알면 잊혀지지 않거든요.

- :material-account-question-outline:{ .lg .middle } **비개발자도 환영**

    ---

    배경 지식이 없어도 따라올 수 있게 썼어요.
    어려운 주제도 *최대한* 풀어쓰지만, 솔직히 말할게요 —
    가끔은 어려운 부분도 등장할 거예요. 그땐 천천히, 같이 가요.

</div>

---

## About

작은 호기심에서 출발한 블로그예요.

스스로 공부하면서 *"이걸 누가 처음부터 비유로 설명해줬으면 얼마나 좋았을까"* 했던
순간들을 모아, 한 편씩 글로 옮기고 있어요.

- **글의 톤**: 친근한 구어체, 일상 비유, 솔직한 추임새
- **글의 구조**: 후킹 → 비유 → 개념 → "왜?" → 실제 사례 → 정리
- **다루는 주제**: 네트워크부터 시작해서, 점점 넓혀갈 예정

!!! note "한 가지 솔직한 이야기"
    가끔은 정말 어려운 주제도 마주칠 거예요. 그때는 *"무조건 쉽게 설명한다"*는
    약속을 다 못 지킬 수도 있어요. 대신 **정직하게**, 어려운 건 어렵다고 말하면서
    같이 헤쳐나가볼게요.

---

*그럼, 천천히 둘러보세요. 마음에 드는 글이 하나라도 있으면 좋겠어요.*
