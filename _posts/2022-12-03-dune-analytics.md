---
layout: post
title: "온체인 데이터 분석하기 | Dune Analytics 101"
tags:
  - Blockchain
  - On-chain Data
  - SQL
---

> 이번 시간에는 온체인 데이터 애널리틱스 플랫폼들 중 가장 핫하고 커뮤니티가 큰 [Dune Analytics](https://dune.com/home)의 구조와 사용 방법에 대해 알아볼 것이다. 데이터 사이언스를 공부하고 블록체인 기업에서 일하는 본인에게 Dune Analytics는 가만히 쳐다보기만 해도 늘 심장이 쿵쾅거리며 텐션이 업되는 유토피아 같은 곳이다. 하지만 안타깝게도, 이 설레는 마음을 이어 받아 데이터 구조를 이해하고 사용 방법을 익히기 위한 레퍼런스가 상당히 부족하다는 것을 알게 되었다. 그리하여 나 처럼 데이터만 보면 마음이 벅차오르는 이 시대 모든 온체인 데이터 러버들에게 이 글을 바치고자 한다. Happy Duning!

### CONTENTS
1. Intro: Web 3.0는 데이터 천국
2. 온체인 데이터를 떠먹여주는 Dune
3. Dune, 돈 내고 써야 하는가
4. Dune DB Schema
	* 4.1. 데이터 조회 가능한 블록체인 리스트
	* 4.2. 어떤 테이블들로 구성되어 있는가
5. 5개의 엔진
	* 5.1. 데이터베이스 엔진
	* 5.2. PostgreSQL vs Spark SQL
6. Case Study
	* 6.1. Ethereum NFT Project WAU (Weekly Active Users)
	* 6.2. Ethereum DEX TX Volume (Token-wise)
7. 팁 대방출
	* 7.1. CTE를 적극적으로 사용하자.
	* 7.2. 주요 CA Address Labeling을 해두자.
	* 7.3. Spark SQL 문법 공부를 하자.
8. Outro: Let’s mingle in!

---

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/dune-logo.webp)
> Dune Analytics

# 1. Intro: Web 3.0는 데이터 천국

데이터 담당자인 나에게 있어 Web 3.0은 사랑 그 자체다. Web 2.0 플랫폼에서 근무하시는 분들은 다 아시겠지만, 매우 단순한 분석이나 ML Model Fitting을 위해 데이터를 확보하는 것은 매우 어렵고 장애 요소가 많은 일이다. 개인정보 보호법 준수를 위한 거버넌스 조건이 매우 많기 때문에, 고객의 식별자가 가명화(Pseudonymization)된 채로 Raw Data를 받게 되는 경우가 빈번하고, 또 특정 고객 Segment를 위한 타겟 프로모션 실행을 위해 Classifier ML Model을 구현했다고 하더라도 고객의 개인정보 보호를 위해 해당 Model을 각 고객들에게 매핑하여 Serving 하기에도 제약이 많다. (특히, Web 2.0 금융 기업일수록 이런 문제로 인한 데이터 활용 폭이 매우 좁은 것 같다.)

그러나 Web 3.0는 다르다. 우선, 데이터 접근성이 매우 민주적이다. 해당 블록체인 네트워크 내에서 노드를 돌리기만 하면 누구나 자유롭게 모든 데이터를 추출하여 적재할 수 있다. 대부분의 블록체인이 가명성 철학을 기반으로 이루어져 있기 때문에 개인정보 이슈가 적을 뿐 아니라, 특정 플랫폼의 운영 기업이 데이터를 독점하지도 않기 때문에 추출 용이성과 활용성이 무궁무진하다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/web3-platform.webp)
> Web 3.0는 플랫폼 참여자 모두가 데이터 소유권을 부여 받을 수 있다.

또한, Web 3.0 데이터는 Data Cleaning 작업도 상당히 덜 요구되는 편이다. 데이터 팀에서 근무하시는 분들은 다 아시겠지만, 분석을 하기 위한 대부분의 Raw Data는 매우 지저분하다. Null 값, Typos, Outliers, Special Characters 등을 해결하는 것이 분석을 위한 필수 선결 과제다. 즉, 우리는 대부분의 시간을 데이터 “분석”이 아닌, 데이터 “전처리”를 하는 데 쓴다. (물론, Category Features Encoding, Imputation with Mean, Median, and Mode와 같은 전처리는 매우 중요한 과정이니, 여기에서 말하는 “전처리”란 인간의 직관이 요구되지 않는 단순 작업에 가까운 것들을 의미한다. 오해하시지 말라.)

반면, Web 3.0 데이터는 이미 정합성과 거버넌스를 프로토콜로 명확하게 규정된 채로 블록에 쌓이기 때문에, 예외적인 Instance나 Naming Rule로부터 벗어난 Feature가 매우 드물다. 가령, Ethereum의 Block Data는  [Ethereum Docs](https://ethereum.org/ko/developers/docs/blocks/)에서 확인할 수 있듯이 명확하게 규정되어 있기 때문에, 매우 클린한 데이터를 추출할 수 있다. 또한, Ethereum의 State를 변화시키는 모든 Transactions의 Input Data 자체가 Typo나 Null Value가 존재할 경우 Validators에 의해 Fail되거나 Contract의 Function Call이 되지 않을 것이므로 이는 Miners나 Validators가 데이터 Screening의 기능을 하는 것으로도 이해될 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/eth-state-change.webp)
> [Ethereum State Change](https://ethereum.org/ko/developers/docs/blocks/)

아무튼 그래서 Web 3.0는 데이터의 보물섬(?) 같은 곳이다. 이러한 점 때문에, 몇 년 전부터 전세계의 수많은 데이터 분석가들이 온체인 데이터에 주목하기 시작했고, 수많은 온체인 데이터 연구와 작업들이 진행되고 있다.

# 2. 온체인 데이터를 떠먹여주는 Dune

사실 블록체인 데이터를 독자적으로 추출하여 적재하는 일은 상당히 어려운 일이다. 방금 필자가 다음과 같이 상술했는데, 사실 이건 말이 쉽지, 필자의 랩탑으로 노드를 돌린다면 아마 펑 하고 터질 것이다.

> “해당 블록체인 네트워크 내에서 노드를 돌리기만 하면 누구나 자유롭게 모든 데이터를 추출하여 적재할 수 있다.”

노드를 On-premise로 구축하는 작업은 상당한 수준의 리소스를 요구한다. 살짝 오래된 자료이지만, 아래 테이블을 보면 각 블록체인 별로 노드의 최소 사양 수준이 만만치 않다는 것을 알 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/node-specs.webp)
> Validator Node Specifications

이러한 문제를 해결해주고자 한 것이 바로 Dune Analytics다. 즉, Dune은 자체적으로 각 블록체인 별로 노드를 구축함으로써 최종 사용자가 로컬 환경에서 굳이 노드를 운영하지 않고도 Dune의 DB를 조회하고, 실시간으로 온체인 데이터를 조회할 수 있도록 만든 서비스인 것이다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/dune-flow.webp)
> [how-the-data-flows](https://dune.com/docs/#how-the-data-flows)  를 읽고 직접 만들어본 Flow Chart

이보다 더 상세한 Dune의 Operational Flow를 확인하고 싶다면,  [여기](https://dune.com/docs/)를 클릭하여 매우 명쾌한 설명을 확인해보도록 하자.

# 3. Dune, 돈 내고 써야 하는가

참고로 Dune은 Freemium (Free + Premium) 형태로 서비스를 제공하고 있다. Dune도 영리적 기업이기 때문에 Pricing Plan이 수시로 변동될 수 있는데, 2022년 12월 현재 Plan은 다음과 같다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/dune-pricing.webp)
> [Dune Pricing](https://dune.com/docs/reference/pricing/)

예전에는 Plan이 Free or Premium의 Binary Classification 형태로만 구분되어 있었지만, 최근에 이렇게 다양한 Plan으로 업데이트 되었다. Free Plan을 써본 필자의 경험을 정리해보면 다음과 같다.
1.  Free Plan을 쓰더라도 Query 속도와 처리량이 심각하게 느리지는 않다.
	* 물론 약간의 코드 최적화를 통해 Request 처리량을 조절하는 스킬이 필요하다. (이게 무슨 의미인지 잠시 후에 팁으로 설명하겠다.)
2.  자신이 저장한 쿼리 결과와 차트는 항상 공개된다.  
	* 비즈니스의 대외비와 연관된 중요한 데이터일 경우, Premium Plan을 사용하거나 혹은 SQL 문을 로컬에 따로 보관한 뒤 필요할 때마다 돌린 후 바로 삭제해야 한다.

따라서 각자 자신의 온체인 데이터 활용 환경 및 요구사항에 맞는 Plan을 사용하는 것이 중요할 것 같다.

# 4. Dune DB Schema

## 4.1. 데이터 조회 가능한 블록체인 리스트

2022년 12월 현재, Dune이 제공하는 온체인 데이터는 크게 다음의 8개 블록체인으로 구성된다. 앞으로 설명하는 모든 DB Schema는 모두 기본적으로 아래 8개 블록체인으로부터 끌어온 것이라고 생각하면 된다.

-   Ethereum ([Etherscan](https://etherscan.io/))
-   Gnosis Chain — xDai ([GnosisScan](https://gnosisscan.io/))
-   Polygon — PoS Mainnet ([Polygonscan](https://medium.com/iotrustlab/Arbiscan))
-   Optimism — Ethereum L2 ([Optimism Etherscan](https://optimistic.etherscan.io/))
-   Arbitrum — Ethereum L2 ([Arbiscan](https://arbiscan.io/))
-   BNB Chain ([BscScan](https://bscscan.com/))
-   Solana ([Solscan](https://solscan.io/))
-   Avalanche C-Chain ([Snowtrace](https://snowtrace.io/))

## 4.2. 어떤 테이블들로 구성되어 있는가

Dune의 DB에는 수많은 테이블들이 존재한다. 그렇다고 해서, 모든 테이블들을 하나하나 조회해보는 것은 매우 비효율적이므로, 카테고리로 구분하여 큰 기둥을 잡아보자.
* `Raw Tables`
* `Decoded Tables`
* `Spells`
* `Community Tables`
* `Prices Tables`

### Raw Tables

Dune에서 조회할 수 있는 테이블들 중 첫번째 종류는 바로 Raw Tables다. 단어에서 느낄 수 있듯이, 가장 원시적인 형태의 데이터가 담긴 곳을 의미한다. Dune Docs에서는 다음과 같이 개념을 서술하고 있다.

> “Raw tables provide you raw, unfiltered and unedited data.”

가령, Raw Tables에는 다음과 같은 테이블이 있어서 직접 조회할 수 있다.
* `ethereum.blocks`
* `ethereum.creation_traces`
* `ethereum.traces`
* `ethereum.logs`
* `ethereum.transactions`
* `ethereum.contracts`

(1) `ethereum.blocks`

각 Block에 존재하는 데이터를 확인할 수 있는 테이블이다. Block Header 영역에 존재하는 데이터 중 Merkle Root를 제외한 거의 모든 데이터를 확인할 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/etherscan-block.webp)
> 즉,  [Etherscan](https://etherscan.io/block/16095248)에서 각 Block을 조회했을 때 나오는 이 데이터들을 직접 조회할 수 있다는 말이다.

```sql
	SELECT
		*  
	FROM
		ethereum.blocks  
	ORDER BY
		number DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum.blocks.webp)

(2) `ethereum.creation_traces`

CA (Contract Account) 생성을 한 TX들의 데이터를 확인할 수 있는 테이블이다. TX를 서명한 EOA Address는 물론이고, Input Data까지 조회할 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/transaction-types.webp)
> 위 그림에서 Contract Account를 Externally Owned Account로부터 생성하는 TX들을 의미한다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/contract-creation-message-call.webp)
> [Creates and Calls Contract](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

```sql
	SELECT
		*  
	FROM
		ethereum.creation_traces  
	ORDER BY
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum-creation-traces.webp)

(3) `ethereum.traces`

CA로부터 실행된 TX들의 데이터를 확인할 수 있는 테이블이다. Ethereum에서는 이러한 TX를 특별히  Internal Transaction이라고 부르는데, Dune에서는 이를 trace로 표현하고 있는 것이다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/transaction-types.webp)
> 위 그림에서 CA → CA에 해당하는 TX들을 확인할 수 있다는 의미이다. (물론 CA → EOA 유형도 포함한다.)

```sql
	SELECT
		*  
	FROM
		ethereum.traces  
	ORDER BY
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum-traces.webp)

(4) `ethereum.logs`

CA를 실행했을 때 발생하는 이벤트 로그 내의 데이터를 조회할 수 있는 테이블이다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/transaction-types.webp)
> 위 그림에서 EOA → CA에 해당하는 TX의 로그를 확인할 수 있다는 의미이다. (물론, CA → CA 유형도 있다.)

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/etherscan-ca-call.webp)
> 즉,  [Etherscan](https://etherscan.io/tx/0x218b632d932371478d1ae5a01620ebab1a2030f9dad6f8fba4a044ea6335a57e#eventlog)에서 CA Call을 실행한 TX의 Logs 탭의 데이터를 확인할 수 있다.

```sql
	SELECT
		*  
	FROM
		ethereum.logs  
	ORDER BY 
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum-logs.webp)

(5) `ethereum.transactions`

Internal Transaction을 제외한 모든 TX 데이터를 확인할 수 있는 테이블이다. 즉, EOA로부터 브로드캐스트된 TX들에 대해서만 데이터를 조회할 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/transaction-types.webp)
> 위 그림에서 EOA → CA, EOA → EOA 유형의 TX들을 확인할 수 있다는 의미이다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/etherscan-transaction.webp)
> 즉,  [Etherscan](https://etherscan.io/tx/0xbcd46c6c6befc4c6ecf234c3385a1caea6601688105fcc7c48037c80d7414613)에서 각 TX을 조회했을 때 나오는 이 데이터들을 직접 조회할 수 있다는 말이다.

```sql
	SELECT
		*  
	FROM
		ethereum.transactions  
	ORDER BY
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum-transactions.webp)

(6) `ethereum.contracts`

Ethereum Network 상에 배포된 CA 관련 데이터를 확인할 수 있는 테이블이다. CA Address는 물론이고, Contract Name, ABI, Creation Code 등 실질적인 데이터까지 모두 조회할 수 있다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/etherscan-contract.webp)
> 즉,  [Etherscan](https://etherscan.io/address/0x00000000219ab540356cbb839cbe05303d7705fa#code)에서 각 CA를 조회했을 때 나오는 이 Contract 관련 데이터를 직접 조회할 수 있다는 말이다.

```sql
	SELECT
		*  
	FROM
		ethereum.contracts  
	ORDER BY
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/ethereum-contracts.webp)

### Decoded Tables

> “Instead of working with the transactions, logs, and traces in their raw states, on Dune we decode smart contract activity into nice human-readable tables.”

Raw Tables는 가장 Original한 데이터를 조회할 수 있다는 측면에서 매우 귀중한 1차 소스적 가치를 지니고 있지만, 특히 CA의 실행 관련 데이터라면 ABI나 Bytecode 포맷으로 되어 있기 때문에 이를 해석하는 것은 매우 어렵다. (물론 천재 개발자 분들이라면 뇌 내 디코딩(?)을 통해 즉각 해석하실 수도…?) 따라서 Dune은 Raw Tables에 적재되고 있는 데이터들을 Key-Value 형태로 디코딩함으로써 Decoded Tables에 Column-wise로 데이터를 가공하여 제공하고 있다.

이러한 Decoded Tables를 활용하면, Uniswap이나 Sushiswap 등 DEX가 자체적으로 발표한 실적 데이터에 의존하지 않고, 오로지 Decoded Tables를 통해 거래대금이나 활성 사용자 규모 등을 실시간으로 확인할 수 있기 때문에 매우 유용하고 그만큼 인기도 많은 테이블이다.

Decoded Tables는 크게 두 가지 유형으로 구분된다.

(1) CA에서 브로드캐스트된 Internal TX 데이터
* `{projectname_blockchain}.{contractName}_evt_{eventName}`

```sql
	SELECT
		*
	FROM
		uniswap_v2_ethereum.Pair_evt_Swap  
	ORDER BY
		evt_block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/uniswap_v2_ethereum.Pair_evt_Swap.webp)

(2) EOA → CA / CA → CA (Function Call) 실행 관련 데이터
* `{projectname_blockchain}.{contractName}_call_{eventName}`

```sql
	SELECT
		*
	FROM
		uniswap_v2_ethereum.Pair_call_Swap  
	ORDER BY
		call_block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/uniswap_v2_ethereum.Pair_call_Swap.webp)

### Prices Tables

> “We pull price data from the coinpaprika API. The Price is the volume-weighted price based on real-time market data, translated to USD.”

Prices Tables는 각 크립토 자산의 시장 가격 데이터를 실시간으로 조회할 수 있는 테이블이다. 블록체인에 Chainlink의 Price Feed가 있다면, Dune에는 Prices Tables가 있다고 비유해보면 적절할까. 이 시장 가격 데이터는 3rd Party Data Partner인  [Coinpaprika](https://coinpaprika.com/)의 API를 활용하여 데이터를 적재하고 있는 것으로 보인다. 그리고 각 시장 가격은 각 거래소의 거래대금 기준으로 가중평균되어 USD로 환산된다. 가장 많이 사용되는 prices.usd 테이블은 분(minute) 단위로 시장 가격을 적재하고 있다.

```sql
	SELECT
		DISTINCT symbol
	FROM
		prices.usd  
	ORDER BY
		symbol  
	LIMIT 10
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/prices-usd.webp)

### Spells

> “Spells are custom tables that are built and maintained by Dune and our community.”

Spells는 Dune과 커뮤니티에 의해 생성되고 유지보수되는 커스텀 테이블들을 의미한다. 필자가 경험했을 때 Spells는 장/단점을 매우 뚜렷하게 지니고 있었다.

**장점**
* Raw Tables와 Decoded Tables을 이해하기에 매우 벅찬 사람들을 위해, 커뮤니티 마법사(Wizard)들이 데이터를 N차 가공하여 예쁘고 편리하게 만들어준다. 가령, Contract 별로 플랫폼명 Labeling을 해주거나, 혹은 유명한 dApps들을 중심으로 Table을 생성하기도 한다. 따라서 데이터 추출에 필요한 시간을 드라마틱하게 절약해줄 수 있다.

**단점**
* 데이터의 안정성이 매우(X100) 떨어진다. 아무래도 오픈소스로 관리되는 테이블이므로, 종종 말도 안되는 데이터 로그가 발견되기도 한다. 이는 데이터 기반 의사결정에 매우 치명적인 위험성이 있음을 의미한다. 반드시 유념하도록 하자.

Spells에 해당되는 테이블들은 굉장히 많으므로, 직접 관심 있는 것들부터 하나하나 조회해보는 것을 추천한다. 다만, 대표적인 3가지 테이블만 사례로 나열해보겠다.

(1) **`dex.trades`**

Ethereum 기반의 DEX 상에서 발생한 거래내역을 DEX 별로 상세하게 확인할 수 있는 테이블이다. 그러나, Labeled된 DEX의 수가 매우 제한적이고, 특정 기간 별로 누락된 데이터가 많으니 아직까지는 유지보수가 필요한 것으로 보인다.

```sql
	SELECT
		*  
	FROM
		dex.trades  
	ORDER BY
		block_time DESC  
	LIMIT 5;
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/dex-trades.webp)

(2) **`erc20.stablecoins`**

Ethereum ERC-20 표준 Stablecoin의 데이터를 확인할 수 있는 테이블이다. 해당 CA가 스테이블코인 프로젝트인지 여부를 매뉴얼하게 Labeling한 것으로 보이며, 이 테이블을 Mapper로 두고  `ethereum.traces`  상에서 각 스테이블코인의 Mint & Burn 현황을 실시간으로 확인하는 데 매우 유용할 것으로 보인다. 그러나 방심은 금물. 언제든지 데이터 정합성이 훼손될 수도 있음을 반드시 명심하자.

```sql
	SELECT
		*  
	FROM
		erc20.stablecoins  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/erc20.stablecoins.webp)

(3) **`lending.borrow`**

Ethereum 기반의 대출 플랫폼들에서 발생한 대출 실행 TX들을 확인할 수 있는 테이블이다. 대표적인 Aave, Compound 등을 중심으로 대출 실행자의 Address, 대출액, 토큰 등 상세 정보를 조회할 수 있다. 다만,  `dex.trades`  테이블과 마찬가지로, 모든 대출 플랫폼들의 데이터를 확인할 수 없으며, 시장 전체의 트렌드를 반영하려면 좀 더 많은 Labeling 작업이 요구될 것으로 보인다.

```sql
	SELECT
		*  
	FROM
		lending.borrow  
	ORDER BY
		block_time DESC  
	LIMIT 5
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/lending.borrow.webp)

이 외에도 수많은 Spells 테이블들이 있다. 자세한 내용은 Dune에서 제공하는 아래 링크들을 확인하여 여러 각도로 데이터를 추출하고 가공해볼 수 있을 것이다.

-   [Spellbook](https://dune.com/docs/spellbook/)
-   [Spellbook Model Docs](https://dune.com/docs/spellbook/spellbook-model-docs/)

# 5. 5개의 엔진

## 5.1. 데이터베이스 엔진

Dune에서 New Query 버튼을 클릭하여 SQL 작성을 하려고 하면 다음과 같은 엔진 리스트가 있음을 확인할 수 있을 것이다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/engine.webp)

데이터베이스 엔진은 스토리지 엔진(Storage Engine)으로 불리기도 하는데, DBMS가 데이터를 CRUD (Create, Read, Update, and Delete) 하기 위해 사용하는 컴포넌트를 의미한다. 포트 번호를 달리하여 구분하기 하고 UI로 구분하기도 하는데, 아무튼 Dune을 활용하는 우리 입장에서 중요한 점은 다음과 같다.
* 동일한 엔진 내의 테이블끼리는 JOIN이나 UNION을 할 수 있다.
* 서로 다른 엔진 내에 존재하는 테이블끼리는 JOIN이나 UNION을 할 수 없다.

## 5.2. PostgreSQL vs Spark SQL

위 엔진 5개 중에서 1~4는 Row-oriented DB, 5는 Column-oriented DB이다.
1.  Ethereum: PostgreSQL (Row-oriented DB)
2.  Gnosis Chain: PostgreSQL (Row-oriented DB)
3.  Optimism (OVM 1.0): PostgreSQL (Row-oriented DB)
4.  Optimism (OVM 2.0): PostgreSQL (Row-oriented DB)
5.  Dune Engine v2: Spark SQL (Column-oriented DB)

그리고 Dune은 점진적으로 Row-oriented DB에서 Column-oriented로 DB로의 Migration 로드맵을 공시했다. (즉, 현재 Dune Engine v2로 데이터를 이관하는 작업을 단계적으로 진행 중이다. 2023년 1분기 내로 1~4 엔진은 모두 폐기될 예정이니,  [여기](https://dune.com/docs/reference/v1-sunsetting/)를 참고하여 일정 관리를 하도록 하자.)

지나치게 개발적인 내용은 본 글에서 다루지 않겠지만, Row-oriented DB와 Column-orinted DB는 일반적으로 다음과 같은 개념으로 이해하면 된다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/facebook.webp)
> [Row- vs. Column-oriented-databases](https://dataschool.com/data-modeling-101/row-vs-column-oriented-databases)

* Row-oriented DB가 위 테이블을 디스크에 저장하고 새로운 데이터를 추가(append)하는 메커니즘

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/raw-oriented-1.webp)
![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/raw-oriented-2.webp)

* Column-oriented DB가 위 테이블을 디스크에 저장하고 새로운 데이터를 추가(append)하는 메커니즘

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/col-oriented-1.webp)
![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/col-oriented-2.webp)

Row-oriented DB의 장점
* 데이터를 추가(append)할 때, 기존 데이터의 Index 고려 없이 단순히 제일 마지막에 붙여넣기만 하면 되므로 연산 요구량이 적다.

Row-oriented DB의 단점
* 특정 칼럼의 값을 조회할 때 메모리 사용량이 많다. 가령, 위 사례에서 모든 사람들의 Age 평균값을 구하려고 한다면, 각 Instance의 Age를 Memory에 저장하여 AVERAGE Method를 사용해야 한다.

Column-oriented DB의 장점
* 특정 칼럼의 값을 조회할 때 메모리 사용량이 적다. 가령, 위 사례에서 Age 평균값을 구하려고 한다면, Age 값들이 하나의 Instance 안에 존재하므로 곧바로 AVERAGE Method를 사용할 수 있다.

Column-oriented DB의 단점
* 데이터를 추가(append)할 때, 기존 데이터의 Index를 고려한 후 각 Instance마다 일일이 데이터를 추가해야 한다. 따라서 연산 요구량이 많다.

중요한 점은, Column-oriented DB의 단점이 데이터를 조회하고자 하는 최종 사용자인 우리에게는 해당하지 않는다는 점이다. 이는 Dune이 노드로부터 데이터를 적재하는 시간과 비용을 더욱 늘리는 대신, 최종 사용자에게 속도가 더욱 개선된 퀴리 환경 UX를 제공하고자 하는 의지로 표현된다.

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/row-store-col-store.webp)
> [Columnar Databases]([https://www.heavy.ai/technical-glossary/columnar-database](https://www.heavy.ai/technical-glossary/columnar-database))

# 6. Case Study

필자는 최근 DeFi 및 NFT 시장 트렌드를 팔로우업하고자 데이터를 추출하여 간단한 차트를 만들어봤다. 매우 기초적인 차트이므로, 독자 분들이 더욱 멋진 차트로 가공해보시길 바란다.

## 6.1. Ethereum NFT Project WAU (Weekly Active Users)

NFT Project 별로 인기도를 확인하기 위해서는 실제 거래대금, 활성 사용자 수 등 다양한 측면을 고려하여 트렌드를 확인해야 할 것이다. 이 차트에서는 각 NFT Project 거래에 참여한 Account Address 수의 Market Share(%)를 주 단위로 표현해보았다.

```sql
	WITH CTE_raw AS (  
	    SELECT  
	        DATE_TRUNC('WEEK', block_time) AS yyyymmdd,  
	        project,  
	        COUNT(DISTINCT sellerbuyer) AS wau  
	    FROM (  
	        SELECT  
	            block_time,  
	            nft_project_name AS project, seller as sellerbuyer  
	        FROM  
	            nft.trades  
	        WHERE  
	            block_time >= NOW() - '1 YEAR'::INTERVAL  
	            AND nft_project_name IS NOT NULL  
	            AND usd_amount IS NOT NULL  
	            AND seller IS NOT NULL  
	            AND buyer IS NOT NULL  
	            AND seller != buyer  
	        UNION ALL  
	        SELECT  
	            block_time,  
	            nft_project_name AS project, buyer as sellerbuyer  
	        FROM  
	            nft.trades  
	        WHERE  
	            block_time >= NOW() - '1 YEAR'::INTERVAL  
	            AND nft_project_name IS NOT NULL  
	            AND usd_amount IS NOT NULL  
	            AND seller IS NOT NULL  
	            AND buyer IS NOT NULL  
	            AND seller != buyer  
	        ) SUB  
	    GROUP BY  
	        DATE_TRUNC('WEEK', block_time),  
	        project  
	),  
	CTE_top_projects AS (  
	    SELECT  
	        project,  
	        COUNT(DISTINCT sellerbuyer) AS active_users  
	    FROM (  
	        SELECT  
	            nft_project_name AS project, seller AS sellerbuyer  
	        FROM  
	            nft.trades  
	        WHERE  
	            block_time >= NOW() - '1 YEAR'::INTERVAL  
	            AND nft_project_name IS NOT NULL  
	            AND usd_amount IS NOT NULL  
	            AND seller IS NOT NULL  
	            AND buyer IS NOT NULL  
	            AND seller != buyer  
	        UNION ALL  
	        SELECT  
	            nft_project_name AS project, seller AS sellerbuyer  
	        FROM  
	            nft.trades  
	        WHERE  
	            block_time >= NOW() - '1 YEAR'::INTERVAL  
	            AND nft_project_name IS NOT NULL  
	            AND usd_amount IS NOT NULL  
	            AND seller IS NOT NULL  
	            AND buyer IS NOT NULL  
	            AND seller != buyer  
	        ) SUB  
	    GROUP BY  
	        project  
	    ORDER BY  
	        active_users DESC  
	    LIMIT  
	        50  
	),  
	CTE_final AS (  
	    SELECT  
	        yyyymmdd,  
	        CASE  
	            WHEN project IN (SELECT project FROM CTE_top_projects) THEN project  
	            ELSE 'Others'  
	        END AS project,  
	        SUM(wau) AS wau  
	    FROM  
	        CTE_raw  
	    GROUP BY  
	        yyyymmdd,  
	        CASE  
	            WHEN project IN (SELECT project FROM CTE_top_projects) THEN project  
	            ELSE 'Others'  
	        END  
	    ORDER BY  
	        yyyymmdd DESC,  
	        wau DESC  
	)  
	SELECT * FROM CTE_final;
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/Ethereum NFT Project WAU (Weekly Active Users).webp)

## 6.2. Ethereum DEX TX Volume (Token-wise)

각 DEX 내에서 발생한 거래들을 토큰 별로 규모를 확인하는 것 역시, 시장 트렌드를 파악하기 위해 매우 중요한 데이터가 될 것이다. 어떤 토큰들이 Short되거나 Long되는지를 실시간으로 조회함으로써 토큰의 시장 가격이나 Needs에 맞는 액션을 취할 수 있지 않을까.

```sql
	WITH CTE_raw AS (  
	    SELECT  
	        DATE_TRUNC('WEEK', block_time) AS yyyymmdd,  
	        token_a_symbol AS from_token,  
	        SUM(usd_amount) AS tx_volume  
	    FROM  
	        dex.trades  
	    WHERE  
	        block_time >= NOW() - '1 YEAR'::INTERVAL   
	        AND category = 'DEX'  
	        AND project IS NOT NULL  
	        AND token_a_symbol IS NOT NULL  
	        AND tx_from IS NOT NULL  
	        AND tx_hash IS NOT NULL  
	        AND usd_amount IS NOT NULL  
	    GROUP BY  
	        DATE_TRUNC('WEEK', block_time),  
	        token_a_symbol  
	),  
	CTE_top_from_tokens AS (  
	    SELECT  
	        from_token,  
	        SUM(tx_volume) AS tx_volume  
	    FROM  
	        CTE_raw  
	    GROUP BY  
	        from_token  
	    ORDER BY  
	        tx_volume DESC  
	    LIMIT  
	        50  
	),  
	CTE_final AS (  
	    SELECT  
	        yyyymmdd,  
	        CASE  
	            WHEN from_token IN (SELECT from_token FROM CTE_top_from_tokens) THEN from_token  
	            ELSE 'Others'  
	        END AS from_token,  
	        SUM(tx_volume) AS tx_volume  
	    FROM  
	        CTE_raw  
	    GROUP BY  
	        yyyymmdd,  
	        CASE  
	            WHEN from_token IN (SELECT from_token FROM CTE_top_from_tokens) THEN from_token  
	            ELSE 'Others'  
	        END  
	    ORDER BY  
	        yyyymmdd DESC,  
	        tx_volume DESC  
	)  
	SELECT * FROM CTE_final;
```

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/Ethereum DEX TX Volume (Token-wise).webp)

# 7. 팁 대방출

## 7.1. CTE를 적극적으로 사용하자.

조회를 해보면 느낄 수 있는데 Instance가 엄청나게 많은 테이블의 경우, 쿼리 속도가 매우(X100) 느리다. 이 때문에 멘탈 케어를 위해 Premium Plan을 구독하고 싶은 욕구가 샘솟기도 한다. 그러나 Free Plan 상에서도 쿼리 속도를 10배 이상 늘릴 수 있는 방법이 있다. 바로  CTE(Common Table Expression)이다.

DB를 공부해보신 분들이라면 CTE 개념은 너무나도 기초적인 내용이지만, Dune 처럼 쿼리 속도가 심각하게 느린 환경일수록 CTE는 매우 중요한 가치를 지닌다. 필자가 경험해보니, 30분 걸리던 쿼리에 CTE를 활용함으로써 3분으로 단축된 적도 있었다.

CTE는 비단 쿼리문의 가독성을 높일 뿐 아니라, 여러 번 참조해야 할 테이블을 미리 Virtual Table로 메모리에 생성해둔 후 Re-read DB 과정 없이 메모리만을 참조할 수 있으므로 성능과 속도 역시 크게 향상될 수 있다. 다음 Framework를 항상 머리 속에 새겨놓도록 하자.

```sql
	WITH  
	CTE_a AS (  
		SELECT *  
		FROM raw1  
	),  
	CTE_b AS (  
		SELECT *  
		FROM raw2  
	)  
	SELECT *  
	FROM CTE_a  
	LEFT JOIN CTE_b  
		USING (id)  
	WHERE CTE_a.id IN (SELECT id FROM CTE_b)  
	;
```

## 7.2.  주요 CA Address Labeling을 해두자.

Data Labeling 작업은 비단 머신러닝의 지도학습(Supervised Learning)에만 요구되는 작업이 아니다. DeFi나 NFT 섹터 별로 주요 프로젝트들을 팔로우업 해야 한다면 각 프로젝트들이 배포한 CA Address를 꾸준히 찾아서 별도 데이터셋으로 관리하고, 또 업데이트 시 CA가 변경될 경우 해당 데이터셋 역시 주기적으로 변경해줘야 한다.

물론, `dex.trades` 같은 Spells 테이블의 경우 커뮤니티가 함께 DEX Name Labeling을 하여 편리하게 프로젝트별 현황을 파악할 수 있지만, 데이터 정합성을 결코 보장할 수 없다. 데이터 정합성을 위한 최고의 방법은 Uniswap, Sushiswap, BAYC, CryptoPunk 등 별로 배포한 CA Address를 직접 찾아 이를 Raw Tables나 Encoded Tables에서 조회하는 것이다.

## 7.3.  Spark SQL  문법 공부를 하자.

앞서 언급했듯이, 2023년 1분기 중으로 PostgreSQL 기반 DB Engine은 모두 사라지고, Spark SQL 기반인 Dune Engine v2로 개편될 예정이다. 그런데, MySQL, Oracle, PostgreSQL에 비해 Spark SQL은 문법이 상대적으로 까칠한(?) 편이다. 대부분의 데이터 분석가 분들이 Spark SQL보다 다른 SQL에 더욱 익숙하실 것이다. 따라서 이에 대한 대비가 필요하다.

Dune V1에서는 문법 요소가 Optional한 것들이 많아 개인의 쿼리 작성 취향에 따라 취사선택할 수 있어 부담이 적었다면, Dune V2에서는 아래와 같이 Requirable한 것들이 많아지므로 이를 반드시 정리를 하고 넘어가는 것을 추천한다. 자세한 비교표는  [여기](https://dune.com/docs/reference/dune-v2/query-engine/#spark-sql-postgressql-operator-changes)를 참고하면 된다.

|**구분**|**PostgreSQL**|**SparkSQL**|
|-|-|-|
|Index Base|`1`|`0`|
|Column 키워드|`"block_time"`|`block_time` (Back Tick)|
|Alias Naming|`AS "dt"`|`AS dt` (Back Tick|
|Interval 표현|`INTERVAL '1day'`|`INTERVAL '1 day'`|
|NULL Array 정의|`NULL::integer[]`|`CAST(NULL AS ARRAY<int>)`|

# 8. Outro: Let’s mingle in!

글을 읽으며 공감 되었겠지만, Dune은 커뮤니티를 활용하는 것이 굉장히 중요한 온체인 데이터 플랫폼이다. Raw Tables, Decoded Tables 외에 수많은 테이블들은 커뮤니티에 의해 유지보수되고, 데이터 정합성 이슈를 어떻게 개선해가고 있는지, 그리고 어떤 식으로 데이터를 추출하고 있는지 등 이 모든 것들을 제대로 공부하고 이해해가기 위해서는 꾸준히 커뮤니티 내 Dune Wizard들과 교류를 해야 한다.
* [Wizard들이 만들어놓은 대시보드들](https://dune.com/browse/dashboards/favorite)
* [Dune Community](https://dune.com/community)

따라서 독자 분들께 감히 손을 내밀고 싶다. 우리 함께 온체인 데이터를 잘 활용하기 위해서 함께 많은 것들을 공유하고, 다양한 피드백들을 주고 받자고. 우리는 Web 3.0 시대의 데이터 마법사, Dune Wizard이니까. Let’s web 3.0 the data analytics!

![]({{ site.baseurl }}/assets/2022-12-03-dune-analytics/dune-xmas.webp)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)