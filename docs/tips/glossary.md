---
title: 용어집
description: 약어, 서비스명, 도구 이름처럼 자주 보이지만 읽는 법과 뜻이 헷갈리는 단어를 한 페이지에서 찾을 수 있게 모아둔 글이에요.
icon: lucide/book-open-text
hide:
  - feedback
tags:
  - Tips
  - Glossary
created: 2026-07-01
updated: 2026-07-07
---

# 용어집

> "이거 뭐라고 읽지?"에서 막히면, 내용도 같이 멈출 때가 있어요.

이 페이지는 그런 순간에 Ctrl-F로 바로 찾으려고 만든 용어집이에요.
정확한 사전 정의보다 먼저, **읽는 법**과 **짧은 감각**을 잡는 데 집중할게요.

근데요, 발음은 팀이나 회사마다 조금씩 다를 때가 있어요.
그래서 여기서는 한국 개발 현장에서 비교적 자주 들리는 읽는 법을 먼저 적고, 헷갈리기 쉬운 말은 괄호로 덧붙였어요.

---

## 네트워크와 웹

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| A record | **A**ddress record | 에이 레코드 | 도메인 이름을 IPv4 주소에 연결하는 DNS 레코드 |
| AAAA record | **AAAA** record | 쿼드 에이 레코드 | 도메인 이름을 IPv6 주소에 연결하는 DNS 레코드 |
| ACME | **A**utomatic **C**ertificate **M**anagement **E**nvironment | 애크미 | TLS 인증서를 자동으로 발급하고 갱신할 때 쓰는 방식 |
| AJAX | **A**synchronous **J**avaScript **a**nd **X**ML | 에이잭스 | 페이지 전체를 새로고침하지 않고 서버와 데이터를 주고받는 웹 개발 방식 |
| ALPN | **A**pplication-**L**ayer **P**rotocol **N**egotiation | 에이엘피엔 | TLS 연결 중 HTTP/2나 HTTP/3 같은 프로토콜을 고르는 확장 |
| ARP | **A**ddress **R**esolution **P**rotocol | 에이알피 | 같은 네트워크 안에서 IP 주소에 맞는 장치 주소를 찾는 방식 |
| BGP | **B**order **G**ateway **P**rotocol | 비지피 | 인터넷의 큰 네트워크들이 길을 서로 알려줄 때 쓰는 라우팅 프로토콜 |
| BOM | **B**rowser **O**bject **M**odel | 비오엠 | 브라우저 창, 주소, 기록 같은 기능을 JavaScript에서 다루는 객체 묶음 |
| CIDR | **C**lassless **I**nter-**D**omain **R**outing | 사이더 | `192.168.0.0/24`처럼 IP 범위를 짧게 쓰는 표기법 |
| CNAME | **C**anonical **Name** | 씨네임 | 한 도메인 이름을 다른 도메인 이름의 별명처럼 연결하는 DNS 레코드 |
| CSP | **C**ontent **S**ecurity **P**olicy | 씨에스피 | 브라우저가 어떤 스크립트와 파일을 허용할지 정하는 보안 규칙 |
| CSRF | **C**ross-**S**ite **R**equest **F**orgery | 씨에스알에프 | 사용자가 원하지 않은 요청을 몰래 보내게 만드는 공격 방식 |
| CSR | **C**lient-**S**ide **R**endering | 씨에스알 | 브라우저가 JavaScript를 실행해 화면을 그리는 웹 렌더링 방식 |
| CSS | **C**ascading **S**tyle **S**heets | 씨에스에스 | 웹 페이지의 색, 크기, 배치 같은 겉모습을 정하는 언어 |
| DHCP | **D**ynamic **H**ost **C**onfiguration **P**rotocol | 디에이치씨피 | 기기에 IP 주소, 게이트웨이, DNS 설정을 자동으로 나눠주는 방식 |
| DNS | **D**omain **N**ame **S**ystem | 디엔에스 | `blog.example.com` 같은 이름을 서버 주소로 찾아주는 체계 |
| DOM | **D**ocument **O**bject **M**odel | 돔 | HTML 문서를 JavaScript가 다룰 수 있게 객체처럼 표현한 구조 |
| DoH | **D**NS **o**ver **H**TTPS | 디오에이치 | DNS 질문을 HTTPS 안에 넣어 암호화해서 보내는 방식 |
| DoT | **D**NS **o**ver **T**LS | 디오티 | DNS 질문을 TLS로 암호화해서 보내는 방식 |
| ETag | **E**ntity **Tag** | 이태그 | 캐시된 파일이 바뀌었는지 확인할 때 쓰는 버전표 같은 값 |
| FTP | **F**ile **T**ransfer **P**rotocol | 에프티피 | 파일을 서버와 주고받기 위해 오래전부터 쓰인 프로토콜 |
| HTML | **H**yper**T**ext **M**arkup **L**anguage | 에이치티엠엘 | 웹 페이지의 제목, 문단, 링크 같은 뼈대를 적는 언어 |
| HTTP | **H**yper**t**ext **T**ransfer **P**rotocol | 에이치티티피 | 브라우저와 서버가 웹 문서를 주고받을 때 쓰는 약속 |
| HTTP/2 | **HTTP** version 2 | 에이치티티피 투 | 하나의 연결에서 여러 요청을 더 효율적으로 처리하는 HTTP 버전 |
| HTTP/3 | **HTTP** version 3 | 에이치티티피 쓰리 | QUIC 위에서 동작하는 최신 HTTP 계열 |
| HTTPS | **H**yper**t**ext **T**ransfer **P**rotocol **S**ecure | 에이치티티피에스 | HTTP에 암호화된 통로를 더한 웹 통신 방식 |
| ICMP | **I**nternet **C**ontrol **M**essage **P**rotocol | 아이씨엠피 | `ping`처럼 네트워크 상태나 오류를 알려줄 때 쓰는 메시지 방식 |
| IP | **I**nternet **P**rotocol | 아이피 | 인터넷에서 장치를 찾기 위해 쓰는 주소 체계 |
| IPv4 | **IP** version 4 | 아이피 브이포 | `192.0.2.1`처럼 점 네 개 느낌으로 쓰는 오래된 IP 주소 체계 |
| IPv6 | **IP** version 6 | 아이피 브이식스 | 주소 공간을 크게 늘린 새로운 IP 주소 체계 |
| ISP | **I**nternet **S**ervice **P**rovider | 아이에스피 | 인터넷 회선을 제공하는 통신사나 사업자 |
| LAN | **L**ocal **A**rea **N**etwork | 랜 | 집, 회사, 학교처럼 가까운 범위 안의 네트워크 |
| MAC address | **M**edia **A**ccess **C**ontrol address | 맥 주소 | 네트워크 장치에 붙은 하드웨어 주소 |
| MIME | **M**ultipurpose **I**nternet **M**ail **E**xtensions | 마임 | 파일이나 응답이 HTML인지 이미지인지 알려주는 형식 이름 |
| MTU | **M**aximum **T**ransmission **U**nit | 엠티유 | 한 번에 보낼 수 있는 가장 큰 데이터 조각 크기 |
| MX record | **M**ail e**X**changer record | 엠엑스 레코드 | 이메일을 받을 서버를 알려주는 DNS 레코드 |
| NAT | **N**etwork **A**ddress **T**ranslation | 나트 | 내부 주소와 외부 주소를 바꿔가며 통신하게 해주는 방식 |
| NTP | **N**etwork **T**ime **P**rotocol | 엔티피 | 컴퓨터 시간을 네트워크로 맞추는 프로토콜 |
| OpenAPI | **OpenAPI** Specification | 오픈에이피아이 | REST API의 주소, 요청, 응답 모양을 문서와 기계가 읽는 형식으로 적는 규격 |
| OSI | **O**pen **S**ystems **I**nterconnection | 오에스아이 | 네트워크 통신을 층으로 나눠 이해하는 기준 모델 |
| PTR record | **P**oin**t**e**r** record | 피티알 레코드 | IP 주소에서 도메인 이름을 거꾸로 찾을 때 쓰는 DNS 레코드 |
| PWA | **P**rogressive **W**eb **A**pp | 피더블유에이 | 웹 앱에 설치, 오프라인, 알림 같은 앱 느낌 기능을 더한 형태 |
| QUIC | **Q**uick **U**DP **I**nternet **C**onnections | 퀵 | HTTP/3에서 쓰이는 빠른 인터넷 전송 방식 |
| REST | **Re**presentational **S**tate **T**ransfer | 레스트 | 웹 API를 자원 중심으로 설계할 때 자주 쓰는 방식 |
| RESTful | **REST**-ful | 레스트풀 | REST 스타일의 원칙을 비교적 잘 따르는 API를 가리키는 말 |
| RSS | **R**eally **S**imple **S**yndication | 알에스에스 | 새 글 목록을 구독 앱이나 리더로 받아볼 때 쓰는 형식 |
| SMTP | **S**imple **M**ail **T**ransfer **P**rotocol | 에스엠티피 | 이메일을 보내고 전달할 때 쓰는 프로토콜 |
| SNI | **S**erver **N**ame **I**ndication | 에스엔아이 | TLS 연결을 시작할 때 어떤 도메인에 접속하려는지 알려주는 정보 |
| SPA | **S**ingle-**P**age **A**pplication | 에스피에이 | 처음 받은 한 페이지 안에서 화면을 바꿔가며 동작하는 웹 앱 |
| SSE | **S**erver-**S**ent **E**vents | 에스에스이 | 서버가 브라우저로 이벤트를 계속 밀어 보내는 단방향 실시간 통신 방식 |
| SSG | **S**tatic **S**ite **G**eneration | 에스에스지 | 빌드할 때 HTML을 미리 만들어두고 빠르게 제공하는 방식 |
| SSR | **S**erver-**S**ide **R**endering | 에스에스알 | 서버가 HTML 화면을 먼저 만들어 브라우저에 보내는 렌더링 방식 |
| Swagger | - | 스웨거 | OpenAPI 문서를 보고 API를 읽고 시험해볼 수 있게 돕는 도구 이름 |
| TCP | **T**ransmission **C**ontrol **P**rotocol | 티씨피 | 순서와 도착 확인을 챙기는 안정적인 전송 방식 |
| TLS | **T**ransport **L**ayer **S**ecurity | 티엘에스 | 인터넷 통신을 암호화하고 상대를 확인하는 보안 기술 |
| TXT record | **T**e**xt** record | 티엑스티 레코드 | 도메인에 짧은 텍스트 정보를 붙여두는 DNS 레코드 |
| TTL | **T**ime **T**o **L**ive | 티티엘 | DNS나 패킷 같은 정보가 얼마나 오래 살아있는지 나타내는 값 |
| UDP | **U**ser **D**atagram **P**rotocol | 유디피 | 확인 절차를 줄이고 빠르게 보내는 전송 방식 |
| URI | **U**niform **R**esource **I**dentifier | 유알아이 | 웹 자원을 식별하는 이름이나 주소의 큰 범주 |
| URL | **U**niform **R**esource **L**ocator | 유알엘 | 웹에서 특정 페이지나 파일의 위치를 가리키는 주소 |
| VLAN | **V**irtual **LAN** | 브이랜 | 하나의 물리 네트워크를 여러 개의 논리 네트워크처럼 나누는 방식 |
| VPN | **V**irtual **P**rivate **N**etwork | 브이피엔 | 다른 네트워크에 안전하게 들어가는 암호화된 통로 |
| WAN | **W**ide **A**rea **N**etwork | 왠 | 멀리 떨어진 지역을 잇는 넓은 범위의 네트워크 |
| WebRTC | **Web** **R**eal-**T**ime **C**ommunication | 웹알티씨 | 브라우저끼리 영상, 음성, 데이터를 실시간으로 주고받는 기술 |
| WebSocket | **Web** **Socket** | 웹소켓 | 브라우저와 서버가 연결을 열어둔 채 양방향으로 주고받는 방식 |
| WOL | **W**ake **O**n **LAN** | 더블유오엘 | 네트워크 신호로 절전 중이거나 꺼진 PC를 깨우는 기능 |
| WWW | **W**orld **W**ide **W**eb | 더블유더블유더블유 | 웹 주소 앞에서 보던 `www` 이름 |

---

## 클라우드와 인프라

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| ALB | **A**pplication **L**oad **B**alancer | 에이엘비 | HTTP 같은 애플리케이션 계층 요청을 나눠주는 로드 밸런서 |
| AMI | **A**mazon **M**achine **I**mage | 에이엠아이 | EC2 서버를 만들 때 쓰는 운영체제와 기본 설정 묶음 |
| AWS | **A**mazon **W**eb **S**ervices | 에이더블유에스 | Amazon의 클라우드 서비스 묶음 |
| Azure | - | 애저 | Microsoft의 클라우드 서비스 이름. "아주르"보다 "애저"가 흔해요 |
| AZ | **A**vailability **Z**one | 에이젯 | 한 리전 안에서 장애가 따로 나도록 나뉜 데이터센터 구역 |
| Bastion | - | 바스천 | 내부 서버에 들어갈 때 거치는 점프 서버나 관문 서버 |
| CDN | **C**ontent **D**elivery **N**etwork | 씨디엔 | 사용자와 가까운 서버에서 이미지, 파일, 페이지를 빠르게 보내주는 분산 네트워크 |
| CloudFront | - | 클라우드프런트 | AWS의 CDN 서비스 |
| Cloudflare | - | 클라우드플레어 | DNS, CDN, 보안, Workers 같은 서비스를 제공하는 플랫폼 |
| D1 | - | 디원 | Cloudflare에서 제공하는 SQLite 기반 서버리스 데이터베이스 |
| DDoS | **D**istributed **D**enial **o**f **S**ervice | 디도스 | 여러 곳에서 한꺼번에 몰아쳐 서비스를 마비시키는 공격 |
| DR | **D**isaster **R**ecovery | 디알 | 큰 장애가 났을 때 서비스를 복구하기 위한 준비와 절차 |
| EBS | **E**lastic **B**lock **S**tore | 이비에스 | AWS EC2에 붙여 쓰는 디스크 같은 블록 저장소 |
| EC2 | **E**lastic **C**ompute **C**loud | 이씨투 | AWS에서 가상 서버를 빌려 쓰는 서비스 |
| ECR | **E**lastic **C**ontainer **R**egistry | 이씨알 | AWS에서 컨테이너 이미지를 보관하는 저장소 |
| ECS | **E**lastic **C**ontainer **S**ervice | 이씨에스 | AWS에서 컨테이너를 실행하고 관리하는 서비스 |
| EFS | **E**lastic **F**ile **S**ystem | 이에프에스 | 여러 EC2에서 함께 붙여 쓸 수 있는 파일 저장소 |
| EKS | **E**lastic **K**ubernetes **S**ervice | 이케이에스 | AWS의 관리형 Kubernetes 서비스 |
| ELB | **E**lastic **L**oad **B**alancing | 이엘비 | AWS의 로드 밸런싱 서비스 묶음 |
| GCP | **G**oogle **C**loud **P**latform | 지씨피 | Google의 클라우드 서비스 묶음 |
| GCS | **G**oogle **C**loud **S**torage | 지씨에스 | Google Cloud의 객체 저장소 |
| HA | **H**igh **A**vailability | 에이치에이 | 일부가 고장 나도 서비스가 계속되도록 만드는 설계 |
| IAM | **I**dentity and **A**ccess **M**anagement | 아이에이엠 | 누가 어떤 리소스에 접근할 수 있는지 정하는 권한 관리 체계 |
| IaC | **I**nfrastructure **a**s **C**ode | 아이에이씨 | 서버, 네트워크, 권한 같은 인프라 설정을 코드로 관리하는 방식 |
| KMS | **K**ey **M**anagement **S**ervice | 케이엠에스 | 암호화 키를 만들고 보관하고 사용하는 관리 서비스 |
| Lambda | - | 람다 | AWS의 서버리스 함수 실행 서비스 |
| LB | **L**oad **B**alancer | 엘비 | 여러 서버에 요청을 나눠 보내는 장치나 서비스 |
| NAS | **N**etwork **A**ttached **S**torage | 나스 | 네트워크로 함께 쓰는 저장장치 |
| NAT Gateway | **NAT** Gateway | 나트 게이트웨이 | 사설 네트워크의 서버가 바깥 인터넷으로 나갈 때 거치는 출구 |
| NLB | **N**etwork **L**oad **B**alancer | 엔엘비 | TCP, UDP 같은 네트워크 계층 요청을 빠르게 나눠주는 로드 밸런서 |
| OCI | **O**racle **C**loud **I**nfrastructure | 오씨아이 | Oracle의 클라우드 서비스 묶음 |
| R2 | - | 알투 | Cloudflare에서 제공하는 객체 저장소 서비스 |
| RAID | **R**edundant **A**rray of **I**ndependent **D**isks | 레이드 | 여러 디스크를 묶어 속도나 안정성을 높이는 방식 |
| RDS | **R**elational **D**atabase **S**ervice | 알디에스 | 클라우드에서 관계형 데이터베이스를 관리형으로 쓰는 서비스 |
| Region | - | 리전 | 클라우드 리소스를 배치하는 큰 지역 단위 |
| Route 53 | - | 라우트 피프티쓰리 | AWS의 DNS 서비스 |
| S3 | **S**imple **S**torage **S**ervice | 에스쓰리 | AWS에서 파일 같은 객체 데이터를 저장하는 서비스 |
| SAN | **S**torage **A**rea **N**etwork | 샌 | 서버들이 빠르게 공유 저장소에 접근하도록 만든 전용 저장소 네트워크 |
| SG | **S**ecurity **G**roup | 에스지 | 클라우드에서 서버 주변의 방화벽 규칙처럼 쓰는 설정 |
| SSH | **S**ecure **Sh**ell | 에스에스에이치 | 원격 서버에 안전하게 접속할 때 쓰는 방식 |
| UPS | **U**ninterruptible **P**ower **S**upply | 유피에스 | 정전이 나도 잠시 전원을 공급해주는 배터리 장치 |
| VM | **V**irtual **M**achine | 브이엠 | 실제 컴퓨터처럼 동작하도록 만든 가상 컴퓨터 |
| VPC | **V**irtual **P**rivate **C**loud | 브이피씨 | 클라우드 안에 따로 만든 내 전용 네트워크 공간 |
| WAF | **W**eb **A**pplication **F**irewall | 와프 | 웹 공격 요청을 걸러주는 방화벽 |
| Worker | - | 워커 | Cloudflare Workers처럼 요청을 받아 짧은 코드를 실행하는 실행 단위 |

---

## 리눅스와 컴퓨터

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| ACL | **A**ccess **C**ontrol **L**ist | 에이씨엘 | 누가 파일이나 자원에 접근할 수 있는지 적어둔 권한 목록 |
| apt | **A**dvanced **P**ackage **T**ool | 앱트 | Debian, Ubuntu 계열에서 패키지를 설치하고 업데이트하는 명령 |
| BIOS | **B**asic **I**nput/**O**utput **S**ystem | 바이오스 | 컴퓨터가 켜질 때 하드웨어를 먼저 깨우는 기본 펌웨어 |
| Btrfs | **B**-**t**ree **f**ile **s**ystem | 비트리 에프에스 | 리눅스에서 쓰는 현대적인 파일 시스템 |
| CLI | **C**ommand **L**ine **I**nterface | 씨엘아이 | 마우스 대신 명령어로 프로그램을 다루는 화면이나 방식 |
| CPU | **C**entral **P**rocessing **U**nit | 씨피유 | 프로그램 명령을 실제로 계산하고 실행하는 핵심 칩 |
| cron | - | 크론 | 정해진 시간마다 명령을 실행하게 해주는 유닉스 계열 도구 |
| CRLF | **C**arriage **R**eturn, **L**ine **F**eed | 씨알엘에프 | Windows에서 자주 보이는 줄바꿈 문자 조합 |
| daemon | - | 데몬 | 뒤에서 계속 실행되며 일을 처리하는 프로그램 |
| dnf | **D**andified **YUM** | 디엔에프 | Fedora 계열에서 패키지를 설치하고 업데이트하는 명령 |
| Fcitx | - | 파이틱스 | 리눅스에서 한글, 중국어, 일본어 같은 입력기를 연결해주는 입력 프레임워크 |
| FIFO | **F**irst **I**n, **F**irst **O**ut | 파이포 | 먼저 들어온 것이 먼저 나가는 구조나 특수 파일 |
| FUSE | **F**ilesystem in **U**ser**s**pac**e** | 퓨즈 | 커널 밖 사용자 공간에서 파일 시스템을 만들게 해주는 방식 |
| GID | **G**roup **ID** | 지아이디 | 리눅스에서 그룹 하나를 구분하는 번호 |
| GNU | **G**NU's **N**ot **U**nix | 그누 | 자유 소프트웨어 도구와 운영체제 프로젝트 이름 |
| GPU | **G**raphics **P**rocessing **U**nit | 지피유 | 그래픽 계산과 병렬 계산에 강한 처리 장치 |
| GUI | **G**raphical **U**ser **I**nterface | 지유아이 | 버튼, 창, 메뉴처럼 그래픽으로 조작하는 화면 |
| HDD | **H**ard **D**isk **D**rive | 에이치디디 | 회전하는 디스크에 데이터를 저장하는 저장장치 |
| I/O | **I**nput/**O**utput | 아이오 | 입력과 출력을 함께 가리키는 말 |
| IPC | **I**nter-**P**rocess **C**ommunication | 아이피씨 | 실행 중인 프로그램끼리 데이터를 주고받는 방식 |
| ISO | **I**nternational **O**rganization for **S**tandardization | 아이에스오 | 표준 이름이나 디스크 이미지 파일에서 자주 보는 말 |
| LF | **L**ine **F**eed | 엘에프 | Unix, Linux, macOS에서 자주 쓰는 줄바꿈 문자 |
| LVM | **L**ogical **V**olume **M**anager | 엘브이엠 | 디스크 공간을 논리 볼륨으로 나눠 관리하는 리눅스 기능 |
| NVMe | **N**on-**V**olatile **M**emory **E**xpress | 엔브이엠이 | SSD가 빠르게 통신할 때 쓰는 저장장치 인터페이스 |
| PATH | - | 패스 | 터미널이 실행할 프로그램을 찾을 때 뒤지는 경로 목록 |
| PCIe | **P**eripheral **C**omponent **I**nterconnect **E**xpress | 피씨아이 익스프레스 | 그래픽카드나 NVMe SSD가 메인보드와 빠르게 통신하는 통로 |
| PID | **P**rocess **ID** | 피아이디 | 실행 중인 프로그램 하나를 구분하는 번호 |
| POSIX | **P**ortable **O**perating **S**ystem **I**nterface | 포직스 | 유닉스 계열 운영체제들이 비슷하게 동작하도록 정한 표준 |
| RAM | **R**andom **A**ccess **M**emory | 램 | 프로그램이 실행되는 동안 잠깐 올려두는 빠른 임시 메모리 |
| REPL | **R**ead-**E**val-**P**rint **L**oop | 레플 | 코드를 한 줄씩 입력하고 바로 결과를 보는 대화형 실행 환경 |
| Shell | - | 셸 | 사용자가 입력한 명령어를 운영체제에 전달해주는 프로그램 |
| SSD | **S**olid **S**tate **D**rive | 에스에스디 | 반도체 메모리로 데이터를 저장하는 빠른 저장장치 |
| stderr | **st**andar**d** **err**or | 스탠다드 에러 | 프로그램의 오류 메시지가 나가는 기본 통로 |
| stdin | **st**andar**d** **in**put | 스탠다드 인풋 | 프로그램이 입력을 받는 기본 통로 |
| stdout | **st**andar**d** **out**put | 스탠다드 아웃풋 | 프로그램의 일반 출력이 나가는 기본 통로 |
| sudo | **s**uper**u**ser **do** | 수도 | 관리자 권한으로 명령을 실행할 때 쓰는 명령 |
| systemd | - | 시스템디 | 리눅스에서 서비스 시작과 관리를 맡는 시스템 관리자 |
| TTY | **T**ele**ty**pewriter | 티티와이 | 터미널 장치나 터미널 세션을 가리킬 때 쓰는 말 |
| UEFI | **U**nified **E**xtensible **F**irmware **I**nterface | 유이에프아이 | BIOS를 대체하는 현대적인 펌웨어 방식 |
| UID | **U**ser **ID** | 유아이디 | 리눅스에서 사용자 하나를 구분하는 번호 |
| USB | **U**niversal **S**erial **B**us | 유에스비 | 주변기기를 연결할 때 쓰는 표준 연결 방식 |
| WSL | **W**indows **S**ubsystem for **L**inux | 더블유에스엘 | Windows 안에서 Linux 환경을 돌리는 기능 |
| XFS | **X** **F**ile **S**ystem | 엑스에프에스 | 리눅스에서 대용량 파일 시스템으로 자주 쓰이는 형식 |
| yum | **Y**ellowdog **U**pdater, **M**odified | 얌 | 예전 Red Hat 계열에서 많이 쓰던 패키지 관리 명령 |

---

## 개발과 운영

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| API | **A**pplication **P**rogramming **I**nterface | 에이피아이 | 프로그램끼리 정해진 방식으로 기능이나 데이터를 주고받는 통로 |
| APM | **A**pplication **P**erformance **M**onitoring | 에이피엠 | 애플리케이션 속도, 오류, 요청 흐름을 관찰하는 모니터링 방식 |
| Blue-green deployment | **Blue-green** deployment | 블루그린 디플로이먼트 | 기존 환경과 새 환경을 나란히 두고 트래픽을 한 번에 옮기는 배포 방식 |
| Canary deployment | **Canary** deployment | 카나리 디플로이먼트 | 일부 사용자에게만 새 버전을 먼저 보내 확인하는 배포 방식 |
| CD | **C**ontinuous **D**elivery / **D**eployment | 씨디 | 테스트를 통과한 코드를 배포 가능한 상태나 실제 배포까지 자동으로 이어가는 흐름 |
| CI | **C**ontinuous **I**ntegration | 씨아이 | 코드 변경을 자주 합치고 자동으로 검사하는 흐름 |
| CORS | **C**ross-**O**rigin **R**esource **S**haring | 코스 | 다른 출처의 웹 페이지가 서버 자원에 접근해도 되는지 정하는 브라우저 보안 규칙 |
| CRUD | **C**reate, **R**ead, **U**pdate, **D**elete | 크러드 | 데이터를 만들고, 읽고, 고치고, 지우는 기본 작업 묶음 |
| CSV | **C**omma-**S**eparated **V**alues | 씨에스브이 | 쉼표로 칸을 나눠 데이터를 저장하는 단순한 표 형식 |
| DB | **D**ata**b**ase | 디비 | 데이터를 모아두고 찾기 쉽게 관리하는 저장소 |
| DTO | **D**ata **T**ransfer **O**bject | 디티오 | 계층 사이에서 데이터를 옮기기 위해 만든 객체 |
| DX | **D**eveloper **E**xperience | 디엑스 | 개발자가 도구나 API를 쓰면서 느끼는 편의성과 경험 |
| E2E | **E**nd **t**o **E**nd | 이투이 | 처음부터 끝까지 실제 흐름에 가깝게 확인하는 테스트 방식 |
| ERD | **E**ntity **R**elationship **D**iagram | 이알디 | 데이터베이스 테이블과 관계를 그림으로 나타낸 것 |
| Git | - | 깃 | 코드 변경 이력을 관리하는 버전 관리 도구 |
| GitHub | - | 깃허브 | Git 저장소를 웹에서 협업할 수 있게 해주는 서비스 |
| GitLab | - | 깃랩 | Git 저장소와 CI/CD를 함께 제공하는 협업 플랫폼 |
| GraphQL | **Graph** **Q**uery **L**anguage | 그래프큐엘 | 클라이언트가 필요한 데이터 모양을 직접 요청하는 API 질의 언어 |
| gRPC | **g**oogle **R**emote **P**rocedure **C**all | 지알피씨 | 서비스끼리 빠르게 함수 호출처럼 통신하게 해주는 방식 |
| IDE | **I**ntegrated **D**evelopment **E**nvironment | 아이디이 | 코드 작성, 실행, 디버깅을 한곳에서 하는 개발 환경 |
| Incident | - | 인시던트 | 서비스에 영향을 주는 장애나 보안 문제 같은 운영 사건 |
| JSON | **J**ava**S**cript **O**bject **N**otation | 제이슨 | 사람이 읽기 쉬운 형태로 데이터를 주고받는 형식 |
| JWT | **J**SON **W**eb **T**oken | 제이더블유티 | 로그인 상태나 권한 정보를 담아 주고받는 토큰 형식 |
| LSP | **L**anguage **S**erver **P**rotocol | 엘에스피 | 에디터와 언어 도구가 자동완성, 진단 정보를 주고받는 약속 |
| LTS | **L**ong-**T**erm **S**upport | 엘티에스 | 오래 안정적으로 지원되는 버전 |
| MVC | **M**odel-**V**iew-**C**ontroller | 엠브이씨 | 화면, 데이터, 제어 흐름을 나눠 생각하는 설계 방식 |
| MTTD | **M**ean **T**ime **T**o **D**etect | 엠티티디 | 문제가 생긴 뒤 알아차리기까지 걸리는 평균 시간 |
| MTTR | **M**ean **T**ime **T**o **R**ecover | 엠티티알 | 장애를 고쳐 서비스가 회복되기까지 걸리는 평균 시간 |
| npm | **N**ode **P**ackage **M**anager | 엔피엠 | JavaScript 패키지를 설치하고 스크립트를 실행하는 도구 |
| npx | **n**pm **p**ackage e**x**ecute | 엔피엑스 | 패키지를 설치 없이 바로 실행할 때 자주 쓰는 npm 도구 |
| OAuth | **O**pen **Auth**orization | 오어스 | 비밀번호를 직접 주지 않고 다른 서비스 접근 권한을 위임하는 방식 |
| OIDC | **O**pen**ID** **C**onnect | 오아이디씨 | OAuth 위에 로그인 사용자 확인 정보를 더한 인증 방식 |
| On-call | - | 온콜 | 장애가 나면 바로 대응하도록 정해둔 담당 대기 순번 |
| OpenTelemetry | **Open** **Telemetry** | 오픈텔레메트리 | 로그, 지표, 추적 데이터를 표준 방식으로 수집하게 돕는 프로젝트 |
| ORM | **O**bject-**R**elational **M**apping | 오알엠 | 코드의 객체와 데이터베이스 테이블을 연결해주는 방식 |
| Playbook | - | 플레이북 | 반복되는 상황에서 어떤 순서로 처리할지 적은 운영 절차 |
| POC | **P**roof **O**f **C**oncept | 피오씨 | 아이디어가 실제로 가능한지 작게 확인해보는 실험 |
| Postmortem | - | 포스트모템 | 장애가 끝난 뒤 원인과 재발 방지책을 정리하는 회고 문서 |
| PR | **P**ull **R**equest | 피알 | 코드 변경을 합치기 전에 리뷰받는 요청 |
| RBAC | **R**ole-**B**ased **A**ccess **C**ontrol | 알백 | 사용자 역할에 따라 권한을 나눠주는 방식 |
| RFC | **R**equest **F**or **C**omments | 알에프씨 | 기술 제안이나 약속을 문서로 정리해 의견을 받는 형식 |
| RUM | **R**eal **U**ser **M**onitoring | 럼 | 실제 사용자의 브라우저에서 성능과 오류를 측정하는 방식 |
| Runbook | - | 런북 | 장애 대응이나 운영 작업을 실제 명령과 절차로 적어둔 문서 |
| SDK | **S**oftware **D**evelopment **K**it | 에스디케이 | 특정 서비스나 플랫폼을 개발할 때 필요한 도구 묶음 |
| SLA | **S**ervice **L**evel **A**greement | 에스엘에이 | 서비스 품질에 대해 고객과 공식적으로 약속한 기준 |
| SLI | **S**ervice **L**evel **I**ndicator | 에스엘아이 | 서비스 상태를 판단하기 위해 실제로 재는 지표 |
| SLO | **S**ervice **L**evel **O**bjective | 에스엘오 | 서비스가 어느 정도 수준을 지켜야 하는지 정한 목표 |
| SRE | **S**ite **R**eliability **E**ngineering | 에스알이 | 소프트웨어 방식으로 서비스 안정성과 운영을 다루는 분야 |
| SQL | **S**tructured **Q**uery **L**anguage | 에스큐엘 | 데이터베이스에 데이터를 묻고 바꾸는 데 쓰는 언어 |
| TOML | **T**om's **O**bvious **M**inimal **L**anguage | 톰엘 | 설정 파일에서 자주 쓰는 단순한 데이터 형식 |
| UUID | **U**niversally **U**nique **Id**entifier | 유유아이디 | 거의 겹치지 않게 만든 긴 식별자 |
| XML | e**X**tensible **M**arkup **L**anguage | 엑스엠엘 | 태그로 데이터를 구조화해서 표현하는 형식 |
| YAML | **Y**AML **A**in't **M**arkup **L**anguage | 야믈 | 설정 파일에서 자주 쓰는 들여쓰기 기반 데이터 형식 |

---

## 보안과 인증

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| 2FA | **T**wo-**F**actor **A**uthentication | 투에프에이 | 비밀번호 말고 한 가지 확인을 더 요구하는 인증 방식 |
| ABAC | **A**ttribute-**B**ased **A**ccess **C**ontrol | 에이백 | 사용자, 자원, 환경 같은 속성으로 접근 권한을 정하는 방식 |
| AES | **A**dvanced **E**ncryption **S**tandard | 에이이에스 | 데이터를 암호화할 때 널리 쓰는 대칭키 암호 방식 |
| CA | **C**ertificate **A**uthority | 씨에이 | TLS 인증서를 발급하고 신뢰를 보증하는 기관 |
| CAPTCHA | **C**ompletely **A**utomated **P**ublic **T**uring test to tell **C**omputers and **H**umans **A**part | 캡차 | 사람이 맞는지 확인하려고 보여주는 테스트 |
| CORS preflight | **CORS** preflight request | 코스 프리플라이트 | 브라우저가 실제 요청 전에 허용 여부를 먼저 물어보는 요청 |
| CVE | **C**ommon **V**ulnerabilities and **E**xposures | 씨브이이 | 공개적으로 식별된 보안 취약점 번호 |
| CVSS | **C**ommon **V**ulnerability **S**coring **S**ystem | 씨브이에스에스 | 취약점의 심각도를 점수로 나타내는 체계 |
| DKIM | **D**omain**K**eys **I**dentified **M**ail | 디킴 | 이메일이 도메인 소유자에게서 왔는지 서명으로 확인하는 방식 |
| DLP | **D**ata **L**oss **P**revention | 디엘피 | 민감한 데이터가 밖으로 새는 것을 막는 보안 체계 |
| DMARC | **D**omain-based **M**essage **A**uthentication, **R**eporting and **C**onformance | 디마크 | SPF와 DKIM 결과를 바탕으로 이메일 위조를 막는 정책 |
| FIDO2 | **F**ast **ID**entity **O**nline 2 | 파이도 투 | 패스키와 보안 키로 비밀번호 없는 로그인을 가능하게 하는 표준 묶음 |
| HMAC | **H**ash-based **M**essage **A**uthentication **C**ode | 에이치맥 | 비밀키와 해시로 메시지가 바뀌지 않았는지 확인하는 값 |
| KDF | **K**ey **D**erivation **F**unction | 케이디에프 | 비밀번호나 키 재료에서 암호화 키를 만들어내는 함수 |
| LDAP | **L**ightweight **D**irectory **A**ccess **P**rotocol | 엘댑 | 조직의 사용자와 그룹 정보를 조회할 때 쓰는 프로토콜 |
| MFA | **M**ulti-**F**actor **A**uthentication | 엠에프에이 | 여러 인증 요소를 함께 확인하는 방식 |
| OTP | **O**ne-**T**ime **P**assword | 오티피 | 한 번만 쓰고 버리는 임시 비밀번호 |
| OWASP | **O**pen **W**orldwide **A**pplication **S**ecurity **P**roject | 오와스프 | 웹 애플리케이션 보안 지식을 정리하는 공개 프로젝트 |
| PAM | **P**luggable **A**uthentication **M**odules | 팸 | 리눅스에서 로그인과 인증 방식을 모듈로 연결하는 체계 |
| Passkey | - | 패스키 | 비밀번호 대신 기기와 생체 인증 등을 이용해 로그인하는 인증 방식 |
| PKI | **P**ublic **K**ey **I**nfrastructure | 피케이아이 | 공개키와 인증서를 이용해 신뢰를 관리하는 기반 구조 |
| RSA | **R**ivest-**S**hamir-**A**dleman | 알에스에이 | 공개키 암호 방식 중 하나 |
| SAML | **S**ecurity **A**ssertion **M**arkup **L**anguage | 새믈 | 회사 로그인 연동에서 자주 쓰는 인증 정보 교환 표준 |
| SCIM | **S**ystem for **C**ross-domain **I**dentity **M**anagement | 스킴 | 회사 사용자 계정을 여러 서비스에 자동으로 만들고 지우는 표준 |
| Secrets | - | 시크릿 | 비밀번호, API 키, 토큰처럼 공개되면 안 되는 민감한 값 |
| SPF | **S**ender **P**olicy **F**ramework | 에스피에프 | 어떤 서버가 내 도메인 이메일을 보낼 수 있는지 알려주는 DNS 기반 정책 |
| SSO | **S**ingle **S**ign-**O**n | 에스에스오 | 한 번 로그인해서 여러 서비스를 함께 쓰는 방식 |
| TOTP | **T**ime-based **O**ne-**T**ime **P**assword | 티오티피 | 시간에 따라 바뀌는 일회용 비밀번호 방식 |
| Vault | - | 볼트 | 비밀값과 암호화 키를 안전하게 보관하고 꺼내 쓰게 돕는 도구 |
| WebAuthn | **Web** **Auth**entication | 웹오슨 | 브라우저에서 패스키나 보안 키 로그인을 가능하게 하는 표준 API |
| XSS | **C**ross-**S**ite **S**cripting | 엑스에스에스 | 웹 페이지에 악성 스크립트를 끼워 넣는 공격 |
| Zero Trust | - | 제로 트러스트 | 내부라고 무조건 믿지 않고 계속 확인하는 보안 접근 방식 |

---

## 데이터베이스와 데이터

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| ACID | **A**tomicity, **C**onsistency, **I**solation, **D**urability | 애시드 | 트랜잭션이 지켜야 하는 네 가지 성질 |
| Avro | - | 애브로 | 스키마와 함께 데이터를 저장하거나 주고받는 바이너리 데이터 형식 |
| Backup | - | 백업 | 문제가 생겼을 때 되돌리려고 데이터를 따로 복사해두는 것 |
| Backward compatibility | - | 백워드 컴패터빌리티 | 새 구조로 바뀌어도 예전 코드가 당분간 계속 동작하게 맞추는 성질 |
| Baseline | - | 베이스라인 | 이미 운영 중인 데이터베이스를 "여기까지는 적용된 상태"라고 기준 잡는 것 |
| Blue/green database | **Blue**/**green** database | 블루 그린 데이터베이스 | 두 데이터베이스 환경을 준비해두고 전환으로 배포 위험을 줄이는 방식 |
| BSON | **B**inary **JSON** | 비슨 | MongoDB에서 쓰는 JSON 비슷한 바이너리 데이터 형식 |
| B-tree | **B**-tree | 비트리 | 데이터베이스 인덱스에서 자주 쓰는 트리 구조 |
| CDC | **C**hange **D**ata **C**apture | 씨디씨 | 데이터 변경 내용을 잡아 다른 곳으로 흘려보내는 방식 |
| Changelog | **Change** **log** | 체인지로그 | 어떤 DB 변경을 어떤 순서로 적용할지 적어둔 기록 |
| Checksum | **Check** **sum** | 체크섬 | 마이그레이션 파일이 나중에 몰래 바뀌었는지 확인하는 짧은 검사용 값 |
| Constraint | - | 컨스트레인트 | 데이터가 지켜야 하는 규칙. 예를 들면 중복 금지나 필수값 같은 것 |
| Data backfill | **Data** **backfill** | 데이터 백필 | 새 컬럼이나 새 테이블에 과거 데이터를 뒤늦게 채워 넣는 작업 |
| Database refactoring | **Database** **refactoring** | 데이터베이스 리팩터링 | 데이터 의미는 지키면서 테이블, 컬럼, 인덱스 구조를 더 낫게 고치는 일 |
| Database trigger | **Database** **trigger** | 데이터베이스 트리거 | 데이터가 바뀔 때 자동으로 실행되도록 DB 안에 걸어둔 동작 |
| DCL | **D**ata **C**ontrol **L**anguage | 디씨엘 | 데이터베이스 권한을 다루는 SQL 명령 묶음 |
| DDL | **D**ata **D**efinition **L**anguage | 디디엘 | 테이블이나 인덱스 같은 구조를 만들고 바꾸는 SQL 명령 묶음 |
| DDL transaction | **DDL** **transaction** | 디디엘 트랜잭션 | 테이블 구조 변경도 트랜잭션처럼 한 번에 성공하거나 되돌릴 수 있게 처리하는 것 |
| DML | **D**ata **M**anipulation **L**anguage | 디엠엘 | 데이터를 넣고, 고치고, 지우는 SQL 명령 묶음 |
| DQL | **D**ata **Q**uery **L**anguage | 디큐엘 | 데이터를 조회하는 SQL 명령 묶음 |
| Debezium | - | 데비지움 | 데이터베이스 변경 내용을 이벤트로 읽어내는 CDC 도구 |
| Denormalization | **De**normalization | 디노멀라이제이션 | 읽기 성능이나 단순함을 위해 일부러 데이터를 중복해 저장하는 설계 |
| Dirty state | **Dirty** state | 더티 스테이트 | 마이그레이션이 중간에 실패해 적용 상태가 애매하게 남은 상황 |
| Down migration | **Down** migration | 다운 마이그레이션 | 이미 적용한 DB 변경을 이전 구조로 되돌리는 마이그레이션 |
| Dry run | **Dry** **run** | 드라이 런 | 실제로 바꾸기 전에 어떤 작업이 실행될지 미리 확인하는 시험 실행 |
| ETL | **E**xtract, **T**ransform, **L**oad | 이티엘 | 데이터를 꺼내고 변환해서 다른 저장소에 넣는 과정 |
| Expand-contract migration | **Expand**-**contract** migration | 익스팬드 컨트랙트 마이그레이션 | 먼저 새 구조를 넓혀 추가하고, 모두 옮긴 뒤 옛 구조를 줄여 없애는 방식 |
| Flyway | - | 플라이웨이 | SQL 파일 버전을 따라가며 DB 마이그레이션을 적용하는 도구 |
| Foreign key | **Foreign** **key** | 포린 키 | 다른 테이블의 행을 가리켜 관계를 이어주는 키 |
| Forward-only migration | **Forward**-**only** migration | 포워드 온리 마이그레이션 | 되돌리기보다 다음 변경으로 앞으로 고쳐 나가는 마이그레이션 방식 |
| Idempotent | - | 아이뎀포턴트 | 같은 작업을 여러 번 실행해도 결과가 한 번 실행한 것과 같게 만드는 성질 |
| Index | - | 인덱스 | 테이블에서 원하는 행을 빨리 찾도록 따로 만들어두는 찾아보기 구조 |
| Liquibase | - | 리퀴베이스 | changelog로 DB 변경을 관리하고 여러 DB에 적용할 수 있게 돕는 도구 |
| Materialized view | **Materialized** **view** | 머티리얼라이즈드 뷰 | 자주 쓰는 조회 결과를 실제 데이터처럼 저장해두는 뷰 |
| Migration | - | 마이그레이션 | 데이터베이스 구조나 데이터를 한 상태에서 다음 상태로 옮기는 변경 작업 |
| Migration lock | **Migration** **lock** | 마이그레이션 락 | 여러 서버가 같은 마이그레이션을 동시에 실행하지 못하게 잡는 잠금 |
| MQ | **M**essage **Q**ueue | 엠큐 | 메시지를 줄 세워두고 서비스끼리 비동기로 주고받게 하는 방식 |
| Normalization | **Normalization** | 노멀라이제이션 | 데이터 중복을 줄이고 관계를 깔끔하게 나누는 설계 방식 |
| OLAP | **O**n**l**ine **A**nalytical **P**rocessing | 오랩 | 분석용으로 데이터를 모아 읽는 처리 방식 |
| Online DDL | **Online** **DDL** | 온라인 디디엘 | 서비스 중에도 테이블 구조를 최대한 멈춤 없이 바꾸는 기능이나 방식 |
| OLTP | **O**n**l**ine **T**ransaction **P**rocessing | 올티피 | 주문, 결제처럼 작은 거래를 빠르게 처리하는 방식 |
| ORC | **O**ptimized **R**ow **C**olumnar | 오알씨 | 빅데이터 분석에서 쓰는 컬럼 기반 파일 형식 |
| Outbox pattern | **Outbox** pattern | 아웃박스 패턴 | DB 변경과 이벤트 발행을 함께 안전하게 처리하려고 메시지를 테이블에 먼저 적는 방식 |
| Parquet | - | 파케이 | 분석용 데이터를 효율적으로 저장하는 컬럼 기반 파일 형식 |
| PITR | **P**oint-**I**n-**T**ime **R**ecovery | 피아이티알 | 백업과 로그를 이용해 특정 시각의 데이터 상태로 복구하는 방법 |
| Primary key | **Primary** **key** | 프라이머리 키 | 테이블에서 한 행을 딱 하나로 구분하는 대표 키 |
| Pub/Sub | **Pub**lish/**Sub**scribe | 펍섭 | 발행자가 메시지를 내고 구독자가 받아가는 메시징 방식 |
| RDBMS | **R**elational **D**ata**b**ase **M**anagement **S**ystem | 알디비엠에스 | 관계형 데이터베이스를 관리하는 시스템 |
| Read replica | **Read** **replica** | 리드 레플리카 | 읽기 요청을 나눠 받도록 원본 DB를 복제해둔 데이터베이스 |
| Repeatable migration | **Repeatable** migration | 리피터블 마이그레이션 | 내용이 바뀌면 다시 적용되는 마이그레이션. 뷰나 함수 갱신에 자주 써요 |
| Roll forward | **Roll** **forward** | 롤 포워드 | 되돌리기 대신 새 수정 마이그레이션을 더 적용해 문제를 고치는 방식 |
| Rollback | **Roll** **back** | 롤백 | 적용한 변경을 이전 상태로 되돌리는 일 |
| Schema drift | **Schema** **drift** | 스키마 드리프트 | 환경마다 DB 구조가 조금씩 달라져 버린 상태 |
| Schema registry | **Schema** **registry** | 스키마 레지스트리 | 이벤트나 메시지의 데이터 모양을 버전별로 등록해두는 저장소 |
| Seed data | **Seed** **data** | 시드 데이터 | 앱을 처음 띄우거나 테스트할 때 미리 넣어두는 기본 데이터 |
| Shadow table | **Shadow** **table** | 섀도 테이블 | 기존 테이블을 바로 건드리지 않고 새 구조를 옆에 만들어 옮길 때 쓰는 임시 테이블 |
| Versioned migration | **Versioned** migration | 버전드 마이그레이션 | `V1`, `V2`처럼 버전 순서대로 한 번씩 적용되는 마이그레이션 |
| WAL | **W**rite-**A**head **L**og | 월 | 데이터를 바꾸기 전에 변경 기록을 먼저 남기는 로그 방식 |
| Zero-downtime migration | **Zero**-**downtime** migration | 제로 다운타임 마이그레이션 | 서비스를 멈추지 않거나 거의 티 나지 않게 DB를 바꾸는 마이그레이션 |
| Cassandra | - | 카산드라 | 분산 환경에서 큰 데이터를 저장하는 NoSQL 데이터베이스 |
| ClickHouse | - | 클릭하우스 | 분석 쿼리에 강한 컬럼 기반 데이터베이스 |
| Elasticsearch | - | 엘라스틱서치 | 검색과 로그 분석에 자주 쓰는 검색 엔진 |
| Kafka | - | 카프카 | 많은 이벤트를 순서 있게 흘려보내는 분산 메시지 플랫폼 |
| MariaDB | - | 마리아디비 | MySQL 계열의 관계형 데이터베이스 |
| MongoDB | - | 몽고디비 | 문서 형태 데이터를 저장하는 NoSQL 데이터베이스 |
| MySQL | - | 마이에스큐엘 | 널리 쓰이는 관계형 데이터베이스 |
| NATS | - | 나츠 | 가볍고 빠른 메시징과 Pub/Sub에 쓰는 오픈소스 시스템 |
| NoSQL | **No**t only **SQL** | 노에스큐엘 | 관계형 모델만 쓰지 않는 여러 데이터베이스 계열 |
| PostgreSQL | - | 포스트그레스큐엘 | 기능이 풍부한 오픈소스 관계형 데이터베이스 |
| RabbitMQ | - | 래빗엠큐 | 메시지를 큐에 넣고 서비스 사이에 전달하는 메시지 브로커 |
| Redis | **Re**mote **Di**ctionary **S**erver | 레디스 | 메모리에 데이터를 빠르게 저장하고 읽는 저장소 |
| SNS | **S**imple **N**otification **S**ervice | 에스엔에스 | AWS에서 메시지를 여러 구독 대상으로 보내는 알림 서비스 |
| SQS | **S**imple **Q**ueue **S**ervice | 에스큐에스 | AWS에서 메시지 큐를 관리형으로 제공하는 서비스 |
| SQLite | - | 에스큐라이트 | 파일 하나로 동작하는 가벼운 관계형 데이터베이스 |
| TimescaleDB | - | 타임스케일디비 | 시간 순서 데이터에 특화된 PostgreSQL 확장 데이터베이스 |

---

## 언어, 프레임워크, 런타임

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| C | - | 씨 | 오래전부터 쓰인 시스템 프로그래밍 언어 |
| C# | - | 씨샵 | Microsoft 생태계에서 많이 쓰는 프로그래밍 언어 |
| C++ | - | 씨플러스플러스 | C에 객체지향과 여러 기능을 더한 프로그래밍 언어 |
| Babel | - | 바벨 | 최신 JavaScript 문법을 다른 실행 환경에 맞게 변환하는 도구 |
| Biome | - | 바이옴 | JavaScript와 TypeScript 코드 포맷팅과 린트를 빠르게 처리하는 도구 |
| Bun | - | 번 | JavaScript 런타임과 패키지 도구를 함께 제공하는 도구 |
| Cargo | - | 카고 | Rust 프로젝트의 패키지 관리와 빌드를 맡는 도구 |
| Deno | - | 디노 | 보안을 기본으로 강조한 JavaScript와 TypeScript 런타임 |
| Django | - | 장고 | Python으로 웹 서비스를 만들 때 쓰는 프레임워크 |
| ESLint | - | 이에스린트 | JavaScript와 TypeScript 코드의 문제를 찾아주는 린트 도구 |
| Express | - | 익스프레스 | Node.js에서 웹 서버를 만들 때 자주 쓰는 프레임워크 |
| FastAPI | - | 패스트에이피아이 | Python으로 API 서버를 빠르게 만들 때 쓰는 프레임워크 |
| Flask | - | 플라스크 | Python의 가벼운 웹 프레임워크 |
| Go | - | 고 | Google에서 만든 간결한 시스템 프로그래밍 언어 |
| Gradle | - | 그레이들 | Java, Kotlin 프로젝트에서 자주 쓰는 빌드 자동화 도구 |
| Hono | - | 호노 | 웹 표준 API에 맞춰 가볍게 만든 TypeScript 웹 프레임워크 |
| Java | - | 자바 | JVM 위에서 실행되는 대표적인 프로그래밍 언어 |
| JavaScript | - | 자바스크립트 | 웹 브라우저와 서버에서 널리 쓰는 프로그래밍 언어 |
| Jest | - | 제스트 | JavaScript 테스트 프레임워크 |
| Kotlin | - | 코틀린 | JVM과 Android에서 많이 쓰는 현대적인 프로그래밍 언어 |
| Maven | - | 메이븐 | Java 프로젝트의 빌드와 의존성을 관리하는 도구 |
| NestJS | - | 네스트제이에스 | Node.js 백엔드 애플리케이션을 구조적으로 만들게 해주는 프레임워크 |
| Next.js | - | 넥스트제이에스 | React 기반 웹 애플리케이션 프레임워크 |
| Node.js | - | 노드제이에스 | 서버에서도 JavaScript를 실행하게 해주는 런타임 |
| PHP | - | 피에이치피 | 웹 서버 쪽에서 오래 쓰인 프로그래밍 언어 |
| Prettier | - | 프리티어 | 코드 모양을 정해진 규칙대로 자동 정리하는 포매터 |
| Python | - | 파이썬 | 문법이 읽기 쉬워 자동화, 데이터, 웹 개발에 널리 쓰는 언어 |
| React | - | 리액트 | 웹 화면을 컴포넌트로 만드는 JavaScript 라이브러리 |
| Rollup | - | 롤업 | JavaScript 라이브러리와 앱을 묶어주는 번들러 |
| Ruby | - | 루비 | 읽기 쉬운 문법을 강조하는 프로그래밍 언어 |
| Rust | - | 러스트 | 메모리 안전성과 성능을 함께 노리는 시스템 프로그래밍 언어 |
| Spring | - | 스프링 | Java 생태계에서 많이 쓰는 애플리케이션 프레임워크 |
| Spring Boot | - | 스프링 부트 | Spring 앱을 빠르게 시작하고 운영하기 쉽게 만든 프레임워크 |
| Svelte | - | 스벨트 | 컴파일러 중심의 웹 UI 프레임워크 |
| Turbopack | - | 터보팩 | Rust 기반으로 만든 빠른 JavaScript 번들러 |
| TypeScript | - | 타입스크립트 | JavaScript에 타입 시스템을 더한 언어 |
| Vite | - | 비트 | 빠른 개발 서버와 빌드를 제공하는 프론트엔드 도구 |
| Vitest | - | 바이테스트 | Vite 생태계에서 자주 쓰는 테스트 프레임워크 |
| Vue | - | 뷰 | 웹 화면을 컴포넌트로 만드는 JavaScript 프레임워크 |
| Webpack | - | 웹팩 | JavaScript와 CSS 같은 파일을 묶어 브라우저용 결과물로 만드는 번들러 |

---

## 도구와 제품 이름

| 용어 | 원래 단어 | 읽는 법 | 간단한 설명 |
|---|---|---|---|
| Apache | - | 아파치 | 웹 서버나 여러 오픈소스 프로젝트 이름에서 자주 보는 이름 |
| Ansible | - | 앤서블 | 서버 설정과 배포 작업을 자동화하는 도구 |
| asdf | - | 에이에스디에프 | 여러 언어와 도구 버전을 프로젝트별로 맞춰 쓰게 해주는 버전 관리자 |
| asdf-vm | **asdf** **v**ersion **m**anager | 에이에스디에프 브이엠 | asdf 프로젝트를 정확히 가리킬 때 쓰는 이름 |
| Chocolatey | - | 초콜리티 | Windows에서 프로그램을 명령어로 설치하고 관리하는 패키지 관리자 |
| Docker | - | 도커 | 애플리케이션을 컨테이너로 묶어 실행하게 해주는 도구 |
| Docker Compose | - | 도커 컴포즈 | 여러 컨테이너를 한 번에 정의하고 실행하는 도구 |
| Grafana | - | 그라파나 | 지표와 로그를 대시보드로 보여주는 도구 |
| Helm | - | 헬름 | Kubernetes 앱 설치와 설정을 패키지처럼 관리하는 도구 |
| Homebrew | - | 홈브루 | macOS와 Linux에서 개발 도구를 설치할 때 많이 쓰는 패키지 관리자 |
| Jenkins | - | 젠킨스 | CI/CD 자동화 서버 |
| Jira | - | 지라 | 이슈와 작업 흐름을 관리하는 협업 도구 |
| Kubernetes | - | 쿠버네티스 | 컨테이너를 여러 서버에 배치하고 운영하는 플랫폼 |
| K8s | **K**ubernete**s** | 케이에이츠 | Kubernetes를 줄여 쓴 표기 |
| Make | - | 메이크 | 정해둔 작업 순서대로 빌드나 자동화 명령을 실행하는 도구 |
| Makefile | - | 메이크파일 | `make`가 어떤 명령을 실행할지 적어두는 파일 |
| mise | - | 미즈 | Node, Python 같은 도구 버전을 프로젝트별로 맞추고 작업 명령도 관리하는 도구 |
| Nginx | - | 엔진엑스 | 웹 서버와 리버스 프록시로 많이 쓰는 서버 |
| nvm | **N**ode **V**ersion **M**anager | 엔브이엠 | Node.js 버전을 바꿔가며 설치하고 쓰게 해주는 도구 |
| Notion | - | 노션 | 문서, 위키, 작업 관리를 함께 하는 협업 도구 |
| pnpm | **p**erformant **npm** | 피엔피엠 | 디스크 공간을 아끼는 방식으로 JavaScript 패키지를 설치하는 패키지 관리자 |
| Prometheus | - | 프로메테우스 | 지표를 수집하고 경고를 만들 때 쓰는 모니터링 도구 |
| pyenv | **Py**thon **env**ironment | 파이엔브 | Python 버전을 프로젝트나 셸마다 바꿔 쓰게 해주는 도구 |
| rbenv | **R**u**b**y **env**ironment | 알비엔브 | Ruby 버전을 프로젝트나 셸마다 바꿔 쓰게 해주는 도구 |
| Scoop | - | 스쿱 | Windows에서 개발 도구를 명령어로 설치하는 패키지 관리자 |
| SDKMAN! | **SDK** **Man**ager | 에스디케이맨 | Java, Kotlin, Gradle 같은 JVM 계열 도구 버전을 관리하는 도구 |
| Slack | - | 슬랙 | 팀 채팅과 알림을 모아보는 협업 도구 |
| Terraform | - | 테라폼 | 인프라를 코드로 정의하고 적용하는 도구 |
| Traefik | - | 트래픽 | 컨테이너 환경에서 자주 쓰는 리버스 프록시와 로드 밸런서 |
| Vercel | - | 버셀 | 프론트엔드와 서버리스 배포에 자주 쓰는 플랫폼 |
| Wrangler | - | 랭글러 | Cloudflare Workers 프로젝트를 개발하고 배포하는 CLI |
| Yarn | - | 얀 | JavaScript 패키지를 설치하고 스크립트를 실행하는 패키지 관리자 |

---

!!! note
    이 표는 "무조건 이것만 맞다"는 규칙표가 아니에요. 다만 처음 말문을 틀 때 덜 민망하고, 회의에서 상대가 알아듣기 쉬운 쪽을 먼저 잡아주는 지도에 가까워요. 혹시 잘못된 정보가 있거나 궁금한 발음이 있으면 댓글로 알려주세요.
