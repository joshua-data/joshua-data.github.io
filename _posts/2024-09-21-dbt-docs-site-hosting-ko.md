---
layout: post
title: "dbt Docs 사내 공유 방법 (사이트 호스팅 후기)"
tags:
  - Language (Korean)
  - Article (Issue Resolution)
  - Level (1. Beginner)
  - Field (Analytics Engineering)
  - Skills (Linux)
---

> "사내에서 dbt Docs를 활용하여 데이터 웨어하우스 문서화를 자동화하고 이를 통해 사내 데이터 접근성과 효율성을 높이기 위한 작업을 수행했습니다. 특히, dbt의 자동 문서화 기능을 활용해 테이블 간 의존성 및 명세서를 최신화함으로써 데이터 활용의 정확성과 속도를 개선했습니다. 이를 위해 VM 인스턴스에서 dbt Docs를 호스팅하고 사내 IP 범위 내 구성원들이 접근할 수 있도록 방화벽 설정을 추가하는 등의 기술적 문제를 해결하며 성공적으로 시스템을 구축했습니다."

---

# 목차
1. dbt Docs란 무엇인가?
2. 배경
3. 목표
4. 진행 과정
5. 결론

---

# 1. dbt Docs란 무엇인가?

[dbt](https://www.getdbt.com/)는 ELT 파이프라인의 Transformation 단계에 특화된 자동화 프레임워크로, Data Analyst와 Analytics Engineer 분들을 중심으로 널리 사용됩니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/1.webp)
![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/2.webp)

dbt는 테이블 간의 의존 관계를 바탕으로 Data Lineage를 분석하고, 그 결과를 DAG (Directed Acyclic Graph) 형태로 컴파일하여 전체 Transformation 과정을 자동으로 실행해줍니다. 이를 통해 데이터 웨어하우스의 Orchestration 관리를 보다 효율적으로 진행할 수 있는데요. dbt의 가장 큰 장점 중 하나는 “자동 문서화” 기능입니다.

(1) **Lineage Graph**: 테이블 간의 의존성을 시각적으로 보여주어, 유지보수 작업시 영향을 받는 테이블들을 한 눈에 파악할 수 있도록 도와줍니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/3.webp)

(2) **명세서 확인**: 각 테이블과 컬럼의 Description 등 세부적인 명세서를 쉽게 확인할 수 있습니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/4.gif)
![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/5.gif)

dbt Docs는 데이터팀의 주요 Pain Point를 해결하는 데 큰 도움이 됩니다. 많은 기업이 데이터 활용도를 높이기 위해 데이터 웨어하우스를 도입하지만, 수많은 데이터 마트와 테이블 구조로 인해 혼란스러워 사내 구성원들의 접근성이 떨어지는 아이러니한 상황에 쉽게 직면하곤 합니다. 특히 프로덕트의 급성장에 따라 조직의 데이터 의존도가 높아지면, 데이터 웨어하우스의 빌딩 속도에 집중하느라 품질, 정합성, 접근성, 명세서 작성 관리를 유지하기가 어려워지기도 쉽습니다.

dbt는 데이터 웨어하우스 전체의 명세를 자동으로 문서화해 이러한 문제를 해결하며, 데이터의 품질과 활용성을 높이는 중요한 역할을 하는 것입니다.

---

# 2. 배경

저는 사내에서 쿼리 작성 역량을 갖춘 구성원 분들이 테이블과 Lineage 문서를 확인하여 Redash 대시보드를 직접 만들 수 있는 환경을 제공하고자 했습니다. 즉, 데이터 웨어하우스 문서화가 필요했던 것이죠. 구글 시트나 노션 페이지 등을 활용하는 것도 고려해봤지만, 애널리틱스 엔지니어링 작업과 문서화 작업이 분리되면 다음과 같은 문제가 발생할 수 있다는 노파심이 들었습니다.

- 데이터 마트 생성과 문서화 사이의 Latency로 인해 커뮤니케이션 속도가 저하될 수 있다.
- 개별적인 문서화 작업 중 휴먼 에러가 발생하여 부정확한 쿼리 결과를 낳을 수 있다.

따라서 저는 문서화 환경이 애널리틱스 엔지니어링 본연의 작업과 분리되어 이중으로 진행되는 것은 결코 바람직하지 않다고 판단했으며, 반복적인 작업 루틴을 줄임으로써 더 중요한 가치를 창출하는 데 시간을 쓰고 싶었습니다.

---

# 3. 목표

dbt Docs 기능을 통해 사내 구성원 분들이 dbt 프로젝트 버전 업데이트 즉시 최신 명세를 확인할 수 있는 Docs 사이트를 호스팅하는 것이 이번 작업의 목표였습니다.

---

# 4. 진행 과정

### 4.1. dbt 프로젝트 관리 현황

BigQuery 프로젝트 내에서 소스 테이블들을 Core Layer, Mart Layer로 변환하는 작업을 실행하고 있습니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/6.webp)

모든 Transformation 과정은 dbt 프로젝트를 통해 Google Cloud의 VM Instance 내에서 주기적으로 실행되고 있습니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/7.webp)

### 4.2. 로컬 호스팅의 문제점

여타 프레임워크와 마찬가지로, dbt Docs를 호스팅할 경우 기본적으로 해당 Host Machine에서만 접속이 가능합니다. 즉, dbt 프로젝트가 있는 VM Instance에서 접속하거나, 혹은 SSH Key를 사용해 Remote 연결된 Local Machine에서만 접속할 수 있는 것입니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/8.webp)

하지만 사내 구성원들도 접속할 수 있는 환경을 마련해야 했습니다. 즉, SSH Key가 없지만 동일한 IP 주소 범위 내에서 접속하는 각 Machine에서 dbt Docs 사이트에 접속할 수 있도록 지원해야 했던 것이죠.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/9.webp)

### 4.3. dbt Docs 호스팅 시작하기

다음은 사내 구성원들의 접속 환경을 마련하기 위해 설정한 단계들입니다.

(1) `tmux` 세션 생성

`tmux`를 통해 VM Instance에서 dbt Docs 호스팅을 유지하는 독립 세션을 만들었습니다.

```shell
   tmux new -s dbt_docs # dbt_docs 이름의 세션을 생성합니다.
   tmux attach -t dbt_docs # dbt_docs 세션에 Attach합니다.
```

(2) 사이트 빌드

dbt 프로젝트의 파일들을 컴파일하여 Docs 사이트를 빌드했습니다.

```shell
   source dbt-venv/bin/activate # Python Virtual Environment 활성화
   export DBT_PROFILES_DIR="path/to/profiles.yml" # DBT_PROFILES_DIR 환경변수 정의
   dbt docs generate --target prod # prod 스키마 기준으로 dbt Docs 빌드하기
```

(3) 사이트 호스팅 시작

Docs 사이트 호스팅을 시작한 후, 해당 세션으로부터 Detach하여 빠져나왔습니다.

```shell
   dbt docs serve --host 0.0.0.0 --port 8080 # host 도메인과 port를 파라미터로 명시하기
```

(4) VM Instance 설정

VM Instance의 External IP를 확인하고, 수정 페이지에서 Network Tag를 추가했습니다.

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/10.webp)
![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/11.webp)

(5) VPC 방화벽 규칙 추가

Firewall policies 콘솔에 들어가서 VPC fire rules를 다음과 같이 추가했습니다.

- **방향**: 인그레스 (Ingress)
- **소스 IPv4 범위**: 사내 IPv4 범위 (CIDR 형식)
- **타겟 Tags**: 방금 전 VM Instance에 추가한 Network Tag (dbt-docs-serve)
- **프로토콜 및 포트**: 방금 전 호스팅한 dbt Docs의 Port (8080)

(6) 접속 주소

이제 사내 IPv4 범위 내에서 다음 주소로 접속하면 됩니다.

- `http://{VM Instance의 External IP}:8080`

(7) 구성된 환경을 요약하면 다음과 같습니다.

> “사내 IPv4 범위 내에서 VM 인스턴스의 External IP 주소에 Port 8080으로 접속하면, 호스팅 중인 dbt Docs 사이트가 로드됩니다!”

![]({{ site.baseurl }}/assets/2024-09-21-dbt-docs-site-hosting/12.webp)

---

# 5. 결론

dbt Docs 사이트 링크를 슬랙 채널에 고정(Pin)하여 구성원 분들이 추후 편리하게 접속하실 수 있도록 설정했습니다. 앞으로 기업과 프로덕트가 성장함에 따라 데이터 활용의 수요는 지속적으로 커질 것입니다. dbt의 “자동 문서화” 기능을 통해 문서화 리소스를 절감하고, 데이터 본연의 업무 효율성을 높일 수 있을 것입니다.

---

## *Published by* Joshua Kim

![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)