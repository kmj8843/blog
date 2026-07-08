---
title: JWT와 OAuth2 Resource Server는 왜 로그인 구현과 다를까요?
description: JWT access token, OAuth2 login, resource server, issuer, JWK Set, scope, refresh token 경계를 Spring Security 요청 흐름으로 나누어 읽어봐요.
icon: lucide/key-round
created: 2026-07-08
updated: 2026-07-08
tags:
  - Spring Boot
  - Spring Security
  - OAuth2
---

# JWT와 OAuth2 Resource Server는 왜 로그인 구현과 다를까요?

> API 서버가 JWT를 받는다는 말은, 그 서버가 반드시 로그인 화면과 회원가입까지 만든다는 뜻은 아니에요.

지난 글에서는 Spring Security를 filter chain부터 봐야 한다고 했어요. 요청은 컨트롤러로 바로 들어오지 않고, 먼저 보안 filter를 지나면서 인증(authentication), 인가(authorization), CSRF, CORS 같은 경계를 만났죠.

오늘은 그중에서도 API에서 자주 만나는 장면을 볼 거예요.

```http
GET /api/orders/42
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

처음에는 이렇게 생각하기 쉬워요.

> "JWT를 쓰면 로그인 기능을 만든 거 아닌가요?"

사실은 아니에요. JWT(JSON Web Token)는 **토큰의 모양과 서명 검증 방식**에 가까워요. OAuth2는 **권한을 위임하고 access token을 발급하는 흐름**이에요. 그리고 OAuth2 resource server는 **이미 발급된 access token을 받아서 이 요청을 허용할지 판단하는 API 서버 역할**이에요.

이 셋을 한 덩어리로 외우면 금방 헷갈려요.

- 로그인 화면은 누가 보여주나요?
- 비밀번호는 누가 검증하나요?
- access token은 누가 발급하나요?
- API 서버는 token 안에서 무엇을 믿어도 되나요?
- refresh token은 API 서버가 받아도 되나요?
- scope와 role은 Spring Security에서 어떤 권한으로 바뀌나요?

오늘 목표는 "JWT 설정 코드 복붙"이 아니에요. **토큰을 발급하는 쪽과 토큰을 검증하는 쪽을 나누고, Spring Boot API 서버가 resource server로 동작할 때 어디까지 책임지는지**를 잡는 거예요.

!!! note "이 글의 기준"
    이 글은 Spring Boot 4.x의 OAuth2 설정 문서와 Spring Security 7.x의 Servlet OAuth2 Resource Server JWT 문서를 기준으로 작성했어요. Spring Boot 3.x 프로젝트에서도 issuer, JWK Set, scope, `SecurityFilterChain`이라는 핵심 모델은 비슷하게 읽을 수 있지만, starter 이름과 세부 dependency는 프로젝트의 Boot 버전 문서를 확인하세요.

---

## 먼저 역할을 나눠야 덜 헷갈려요

쇼핑몰 API를 생각해볼게요. 사용자는 브라우저나 모바일 앱에서 로그인하고, 주문 목록을 보려고 해요.

겉으로는 한 흐름처럼 보여요.

1. 사용자가 로그인해요.
2. access token을 받아요.
3. API를 호출해요.
4. 서버가 token을 보고 주문 정보를 내려줘요.

그런데 시스템 안에서는 역할이 나뉘어요.

| 역할 | 하는 일 | Spring Security에서 자주 만나는 이름 |
|---|---|---|
| 사용자 | 로그인하려는 사람 | resource owner |
| 클라이언트 앱 | 브라우저 SPA, 모바일 앱, 서버 앱 | OAuth2 client |
| 인증/인가 서버 | 로그인, 동의, token 발급 | authorization server, identity provider |
| API 서버 | token을 검증하고 resource를 제공 | resource server |
| access token | API 호출에 붙는 짧은 수명의 권한 증명 | JWT 또는 opaque token |

```mermaid
sequenceDiagram
    participant User as User
    participant Client as Client app
    participant Auth as Authorization server
    participant API as Resource server

    User->>Client: 로그인 시작
    Client->>Auth: 로그인과 권한 요청
    Auth-->>Client: access token 발급
    Client->>API: Authorization: Bearer access_token
    API->>API: token 검증
    API-->>Client: protected resource
```

이 그림에서 API 서버는 사용자의 비밀번호를 직접 확인하지 않아요. API 서버는 Authorization header에 담긴 bearer token을 보고, "이 token이 믿을 수 있는 발급자에게서 왔고, 아직 유효하고, 이 API를 호출할 권한이 있나?"를 확인해요.

그래서 resource server 글에서 가장 먼저 버려야 할 생각은 이거예요.

> "JWT를 받으니까 로그인 서버까지 만든다."

Resource server의 기본 책임은 로그인 화면이 아니라 **검증과 인가**예요.

---

## JWT는 서버가 읽을 수 있는 서명된 주장 묶음이에요

JWT는 보통 세 부분으로 생겼어요.

```text
header.payload.signature
```

각 부분은 Base64URL로 표현돼요. 그래서 JWT 문자열을 보면 암호처럼 보이지만, **JWT는 기본적으로 암호화가 아니라 인코딩과 서명**으로 이해하는 편이 안전해요. Payload는 도구로 쉽게 디코딩해서 볼 수 있어요.

예를 들어 access token payload에는 이런 claim이 들어갈 수 있어요.

```json
{
  "iss": "https://auth.example.com",
  "sub": "user-123",
  "aud": "orders-api",
  "exp": 1793500000,
  "iat": 1793496400,
  "scope": "orders:read orders:write"
}
```

| claim | 읽는 법 | API 서버가 보는 이유 |
|---|---|---|
| `iss` | issuer, 발급자 | 우리가 믿는 인증 서버가 발급했는지 확인해요 |
| `sub` | subject, 사용자 식별자 | 이 token의 주체가 누구인지 읽어요 |
| `aud` | audience, 대상 API | 이 token이 우리 API용인지 확인해요 |
| `exp` | 만료 시각 | 이미 끝난 token을 거절해요 |
| `iat` | 발급 시각 | 언제 발급됐는지 추적할 수 있어요 |
| `scope` 또는 `scp` | 허용된 범위 | endpoint 접근 권한으로 바꿔 읽을 수 있어요 |

여기서 중요한 건 **서명(signature)**이에요. Resource server는 payload를 그냥 믿지 않아요. 인증 서버가 공개한 public key로 signature를 검증해서, token이 중간에 바뀌지 않았고 믿는 발급자가 서명했다는 점을 확인해요.

```mermaid
flowchart LR
    A[Bearer token]
    B[Header<br/><small>alg, kid</small>]
    C[Payload<br/><small>iss, sub, aud, exp, scope</small>]
    D[Signature]
    E[JWK Set<br/><small>public keys</small>]
    F{검증}
    G[Authentication 생성]
    H[401 Unauthorized]

    A --> B
    A --> C
    A --> D
    B --> F
    C --> F
    D --> F
    E --> F
    F -->|성공| G
    F -->|실패| H
```

이 그림에서 payload를 읽는 일과 payload를 믿는 일은 달라요. 누구나 payload를 읽을 수 있지만, resource server는 signature, issuer, 만료 시각, audience 같은 조건을 통과한 token만 인증 정보로 바꿔요.

!!! warning "JWT payload에 비밀을 넣지 마세요"
    JWT가 서명되어 있다고 해서 payload가 숨겨지는 건 아니에요. Access token을 누가 볼 수 있는지, 로그에 남지 않는지, 브라우저 저장소에 어떻게 보관되는지까지 함께 설계해야 해요.

---

## Spring Boot Resource Server는 issuer나 JWK Set으로 검증 준비를 해요

Spring Boot에서 resource server를 만들 때 핵심은 두 가지예요.

1. Resource server 관련 Spring Security module이 classpath에 있어야 해요.
2. JWT를 검증할 기준을 알려줘야 해요.

Spring Boot 문서는 JWT resource server 설정에서 `issuer-uri` 또는 `jwk-set-uri`를 사용할 수 있다고 설명해요.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "https://auth.example.com"
```

`issuer-uri`를 쓰면 Spring Security는 issuer의 discovery metadata를 통해 JWK Set 위치를 찾고, 그 public key들로 token signature를 검증할 수 있어요.

인증 서버가 discovery endpoint를 제공하지 않거나 JWK Set 위치를 직접 고정해야 한다면 이렇게 쓸 수 있어요.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "https://auth.example.com"
          jwk-set-uri: "https://auth.example.com/.well-known/jwks.json"
```

Audience까지 명시하고 싶다면 Boot property로 기대하는 `aud` 값을 둘 수 있어요.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "https://auth.example.com"
          audiences:
            - "orders-api"
```

처음에는 `issuer-uri`와 `audiences`를 같이 보는 습관이 좋아요. `iss`는 "누가 발급했는가"이고, `aud`는 "누구에게 쓰라고 발급했는가"예요. 둘 중 하나만 보면 다른 서비스용 token이 실수로 받아들여지는 설계를 놓칠 수 있어요.

Servlet 기반 Spring MVC 앱에서는 보통 `SecurityFilterChain`에서 resource server JWT 지원을 켜요.

```java
package com.example.security;

import static org.springframework.security.oauth2.core.authorization.OAuth2AuthorizationManagers.hasScope;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/orders/**").access(hasScope("orders:read"))
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer((oauth2) -> oauth2
                        .jwt(Customizer.withDefaults())
                );

        return http.build();
    }
}
```

이 코드는 "모든 것을 JWT로 해결한다"가 아니에요. 요청을 이렇게 읽겠다는 뜻이에요.

| 요청 | 필요한 조건 |
|---|---|
| `/api/public/**` | token 없이 허용 |
| `/api/orders/**` | 유효한 JWT + `orders:read` scope |
| 나머지 | 유효한 인증 필요 |

Spring Security는 bearer token이 오면 JWT를 검증하고, 성공하면 `Authentication` 객체를 SecurityContext에 넣어요. 그 다음 인가 규칙이 이 인증 정보와 권한을 보고 요청을 통과시킬지 결정해요.

---

## Scope는 Spring Security 권한으로 바뀌어요

OAuth2에서 scope는 "이 token이 어디까지 할 수 있는가"를 표현하는 값이에요.

예를 들어 token에 이런 claim이 있다고 해볼게요.

```json
{
  "sub": "user-123",
  "scope": "orders:read orders:write"
}
```

Spring Security Resource Server는 기본적으로 `scope`나 `scp` claim을 읽어서 권한(authority)으로 바꿔요. 이때 `SCOPE_` prefix가 붙어요.

| JWT claim | Spring Security authority |
|---|---|
| `orders:read` | `SCOPE_orders:read` |
| `orders:write` | `SCOPE_orders:write` |

그래서 아래 두 표현은 같은 방향으로 읽을 수 있어요.

```java
.requestMatchers("/api/orders/**").access(hasScope("orders:read"))
```

```java
.requestMatchers("/api/orders/**").hasAuthority("SCOPE_orders:read")
```

처음에는 `hasScope(...)`가 더 읽기 쉬워요. 하지만 디버깅할 때는 실제 `Authentication` 안에 `SCOPE_orders:read`처럼 들어간다는 점을 기억해야 해요.

!!! tip "scope와 role을 섞어 읽지 마세요"
    `scope`는 token에 담긴 API 사용 범위에 가깝고, `ROLE_ADMIN` 같은 role은 애플리케이션의 사용자 역할 모델에 가까워요. 둘을 같은 문자열로 맞출 수는 있지만, 설계 질문은 다르게 가져가는 편이 안전해요.

인증 서버가 `scope`나 `scp` 대신 `roles`, `permissions`, `authorities` 같은 custom claim을 준다면 기본 매핑만으로는 부족할 수 있어요. 그때는 `JwtAuthenticationConverter`로 어떤 claim을 Spring Security authority로 바꿀지 직접 정해요.

```java
package com.example.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer((oauth2) -> oauth2
                        .jwt((jwt) -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }
}
```

이 예시는 "roles claim을 무조건 이렇게 쓰세요"가 아니에요. 핵심은 **token claim 이름과 애플리케이션 권한 모델 사이에 변환 경계가 있다**는 점이에요. 이 경계를 숨기면 나중에 "token에는 admin이 있는데 왜 403이 나죠?" 같은 문제가 생겨요.

---

## OAuth2 login과 Resource Server는 다른 기능이에요

Spring Security에서 OAuth2를 검색하면 `oauth2Login`과 `oauth2ResourceServer`를 같이 보게 돼요. 이름이 비슷해서 같은 기능처럼 느껴지지만 역할이 달라요.

| 기능 | 주로 하는 일 | 대표 장면 |
|---|---|---|
| OAuth2 Login | 사용자를 외부 provider로 로그인시키고 local session을 만들어요 | "Google로 로그인" 버튼 |
| OAuth2 Client | 다른 서버의 API를 호출하기 위해 token을 얻고 관리해요 | 서버가 외부 calendar API 호출 |
| OAuth2 Resource Server | 들어온 bearer token을 검증하고 API 접근을 제어해요 | 모바일 앱이 `Authorization: Bearer`로 주문 API 호출 |

예를 들어 "Google로 로그인해서 우리 웹 화면을 보여준다"면 `oauth2Login`이 중심일 수 있어요. 반대로 "이미 발급된 access token으로 `/api/orders`를 보호한다"면 resource server가 중심이에요.

둘을 한 애플리케이션에서 같이 쓸 수도 있어요. 하지만 그때도 질문을 분리해야 해요.

- 이 요청은 브라우저 session으로 인증하나요?
- 이 요청은 bearer token으로 인증하나요?
- API endpoint와 web page endpoint가 같은 `SecurityFilterChain`에 있나요?
- CSRF는 cookie 기반 흐름에 맞게 설계됐나요?

```mermaid
flowchart TD
    A[Spring Boot app]
    B[Web page 요청<br/><small>browser session</small>]
    C[API 요청<br/><small>Bearer token</small>]
    D[oauth2Login]
    E[oauth2ResourceServer]
    F[Controller]

    A --> B --> D --> F
    A --> C --> E --> F
```

이 그림의 핵심은 같은 앱이라도 인증 방식이 요청 경로에 따라 달라질 수 있다는 점이에요. 그래서 실무에서는 API와 web 화면을 같은 security chain에 섞기보다, matcher와 order를 명확히 나누는 설계가 자주 필요해져요.

---

## Refresh token은 API 서버에 아무 때나 보내는 토큰이 아니에요

Access token은 보통 수명이 짧아요. 유출됐을 때 피해를 줄이기 위해서예요. 그러면 사용자는 매번 다시 로그인해야 할까요? 그래서 refresh token이 등장해요.

하지만 refresh token을 이해할 때 가장 중요한 경계가 있어요.

> Resource server는 보통 refresh token을 받아서 API 권한을 판단하지 않아요.

Refresh token은 access token을 새로 받기 위한 자격에 가까워요. 그래서 보통 authorization server나 token을 관리하는 OAuth2 client 쪽에서 다뤄요. 주문 API 같은 resource server가 refresh token을 받아서 주문 목록을 내려주면 역할이 섞여요.

| 토큰 | 보통 쓰는 곳 | 수명 | 노출 위험 |
|---|---|---|---|
| access token | Resource server API 호출 | 짧게 | API 호출마다 전송돼요 |
| refresh token | 새 access token 발급 | 더 길게 | 유출되면 장기 접근으로 이어질 수 있어요 |

Refresh token 설계에서 자주 생기는 실수는 이런 것들이에요.

- 브라우저 localStorage에 refresh token을 오래 보관해요.
- API 서버 여러 곳이 refresh token을 직접 받도록 만들어요.
- 로그나 error report에 bearer token 전체가 남아요.
- access token 만료와 refresh 실패를 구분하지 못해 무한 재시도를 만들어요.
- refresh token rotation, 재사용 감지, 폐기 전략 없이 긴 수명만 줘요.

처음에는 이렇게 나눠서 생각하세요.

```mermaid
sequenceDiagram
    participant Client as Client app
    participant Auth as Authorization server
    participant API as Resource server

    Client->>API: access token으로 API 호출
    API-->>Client: 401 token expired
    Client->>Auth: refresh token으로 새 access token 요청
    Auth-->>Client: 새 access token
    Client->>API: 새 access token으로 다시 호출
    API-->>Client: response
```

이 흐름에서 resource server는 "만료된 token이라서 401"을 줄 수 있어요. 하지만 refresh token으로 새 access token을 발급하는 책임은 authorization server 쪽에 있어요.

!!! warning "Refresh token은 오래 사는 비밀에 가깝게 다루세요"
    Access token보다 오래 살기 때문에 저장 위치, 회전(rotation), 폐기(revocation), 재사용 감지 전략이 더 중요해요. Resource server 글에서 refresh token을 자세히 구현하지 않는 이유도 이 경계를 지키기 위해서예요.

---

## 401과 403은 token API에서 특히 다르게 읽어야 해요

JWT resource server를 붙이면 가장 자주 보는 증상은 401과 403이에요.

둘 다 "안 된다"처럼 보이지만 질문이 달라요.

| 응답 | 먼저 볼 질문 | 흔한 원인 |
|---|---|---|
| 401 Unauthorized | 인증 정보가 유효한가요? | bearer token 없음, signature 실패, 만료, issuer/audience 불일치 |
| 403 Forbidden | 인증은 됐는데 권한이 있나요? | scope 부족, role 매핑 실패, method security 거절 |

예를 들어 token이 아예 없으면 보통 401이에요.

```http
GET /api/orders/42
```

만료된 token을 보내도 401이에요.

```http
GET /api/orders/42
Authorization: Bearer expired.jwt.value
```

반대로 token은 유효한데 `orders:read` scope가 없다면 403이 더 자연스러워요.

```json
{
  "sub": "user-123",
  "scope": "profile:read"
}
```

이 차이를 모르면 frontend에서 "로그아웃시켜야 하나요, 권한 없음 화면을 보여줘야 하나요?"를 계속 틀리게 돼요.

디버깅할 때는 아래 순서가 좋아요.

1. Authorization header가 정확히 `Bearer <token>` 모양인가요?
2. Token의 `iss`가 설정한 `issuer-uri`와 맞나요?
3. `aud` 검증을 켰다면 우리 API audience가 들어 있나요?
4. `exp`, `nbf` 시간이 현재 서버 시간과 맞나요?
5. JWK Set에서 token header의 `kid`에 맞는 key를 찾을 수 있나요?
6. Spring Security authority에 기대한 `SCOPE_...` 또는 `ROLE_...` 값이 들어갔나요?

!!! tip "JWT 디버깅의 순서"
    401이면 token 자체의 신뢰 조건을 먼저 보고, 403이면 token에서 Spring Security 권한으로 바뀐 결과를 먼저 보세요.

---

## Opaque token을 쓰는 시스템도 있어요

JWT가 흔하지만 모든 access token이 JWT인 건 아니에요. 어떤 시스템은 token 문자열 자체만 봐서는 내용을 알 수 없는 opaque token을 써요.

Opaque token은 resource server가 token을 직접 검증하기보다 authorization server의 introspection endpoint에 물어보는 방식으로 확인할 수 있어요.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          introspection-uri: "https://auth.example.com/oauth2/introspect"
          client-id: "orders-api"
          client-secret: "${INTROSPECTION_CLIENT_SECRET}"
```

| 방식 | 장점 | 조심할 점 |
|---|---|---|
| JWT | API 서버가 public key로 자체 검증할 수 있어요 | 이미 발급된 token 폐기가 어렵고 payload 노출에 조심해야 해요 |
| Opaque token | 서버 쪽에서 중앙 검증과 폐기를 제어하기 쉬워요 | introspection 호출 지연, 장애, client secret 관리가 중요해요 |

이 글은 JWT resource server를 중심으로 봤지만, 실무에서는 "JWT가 더 최신이라서 무조건 낫다"가 아니에요. Token을 어디서 폐기해야 하는지, API 서버가 인증 서버와 얼마나 강하게 연결되어도 되는지, 지연 시간과 장애 전파를 어떻게 감당할지로 선택해야 해요.

---

## 실무 설정은 "검증 기준"과 "권한 모델"을 분리해서 리뷰해요

JWT resource server 설정을 code review할 때는 코드 줄 수보다 경계를 보는 편이 좋아요.

| 리뷰 질문 | 이유 |
|---|---|
| `issuer-uri` 또는 `jwk-set-uri`가 환경별로 명확한가요? | 개발, staging, 운영 token이 섞이면 안 돼요 |
| `audiences`를 검증하나요? | 다른 API용 token을 받아들이지 않게 막아요 |
| Public endpoint가 의도적으로만 열려 있나요? | `permitAll()`이 넓게 퍼지면 보호가 무너져요 |
| Scope와 role 매핑이 문서화되어 있나요? | 인증 서버 claim 변경이 API 403으로 이어질 수 있어요 |
| Token 전체가 로그에 남지 않나요? | Bearer token은 그 자체로 권한 증명이에요 |
| Refresh token은 resource server로 들어오지 않나요? | 발급/갱신 책임과 API 검증 책임을 분리해야 해요 |
| 401과 403을 frontend가 다르게 처리하나요? | 재로그인, 권한 없음, 재시도 UX가 달라져요 |

처음에는 이 정도만 잡아도 Spring Security 설정을 훨씬 덜 무섭게 읽을 수 있어요. JWT가 들어와도 결국 요청 흐름은 지난 글과 이어져요.

1. Security filter chain이 요청을 받아요.
2. Bearer token을 찾고 검증해요.
3. 검증에 성공하면 `Authentication`을 만들어요.
4. Scope나 claim을 authority로 바꿔요.
5. `authorizeHttpRequests`나 method security가 접근을 결정해요.

Resource server는 이 다섯 단계를 안정적으로 수행하는 API 서버예요. 로그인 화면까지 모두 가진 만능 보안 서버가 아니에요.

---

## 참고한 링크

- [Spring Boot Reference - OAuth2](https://docs.spring.io/spring-boot/reference/security/oauth2.html)
- [Spring Boot Reference - Spring Security](https://docs.spring.io/spring-boot/reference/web/spring-security.html)
- [Spring Security Reference - OAuth2 Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [Spring Security Reference - OAuth2 Resource Server Opaque Token](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/opaque-token.html)

---

## 자, 정리해볼까요?

!!! abstract "오늘 우리가 배운 것"
    - JWT는 로그인 기능 전체가 아니라, claim과 signature를 가진 token 형식으로 읽어야 해요.
    - OAuth2 resource server는 token을 발급하는 서버가 아니라, 들어온 access token을 검증하고 API 접근을 판단하는 서버예요.
    - Spring Boot resource server는 `issuer-uri`, `jwk-set-uri`, `audiences` 같은 기준으로 JWT를 검증해요.
    - `scope`나 `scp` claim은 기본적으로 `SCOPE_...` authority로 바뀌고, custom claim은 converter로 매핑해야 해요.
    - Refresh token은 access token 갱신을 위한 더 민감한 자격이라서 resource server 책임과 분리해서 다뤄야 해요.
    - 401은 token 신뢰 문제, 403은 권한 문제로 나눠 보면 디버깅이 쉬워져요.

처음에는 여기까지만 잡아도 충분해요. 더 깊게 보면 핵심은 하나예요. **토큰 기반 보안은 문자열 하나를 믿는 기술이 아니라, 발급자와 대상과 만료와 권한을 runtime에 계속 검증하는 경계**예요.

다음에는 이 token 위에서 method security와 도메인 권한 검사를 어디에 둬야 하는지 이어서 볼게요.
