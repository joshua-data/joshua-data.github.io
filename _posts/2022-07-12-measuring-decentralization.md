---
layout: post
title: "탈중앙화: 개념과 측정 방법, 그리고 한계"
tags:
  - korean
  - blockchain
  - statistics
---

### CONTENTS
1. 탈중앙화의 개념
2. 탈중앙화의 측정
2.1. 준비: 데이터 수집
2.2. 유형별 측정
2.3. Recap
3. 결론: "탈중앙화와 빈부격차는 다르다!"

---

> "블록체인 트릴레마를 구성하는 요소 중 하나인 탈중앙화(Decentralization)를 측정할 수 있는 여러 가지 방법론이 제시되고 있다. 이번 아티클에서는 탈중앙화를 측정할 수 있는 4가지 방법을 토대로 실험을 진행한 후, 각 방법들의 한계점에 대해 진단하고자 한다."

## 1. 탈중앙화의 개념

![Blockchain Trilemma]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/blockchain-trilemma.webp)
> 블록체인 트릴레마(Trilemma)

블록체인 트릴레마(Trilemma)란, 확장성(Scalability), 보안성(Security), 탈중앙화(Decentralization) 세 가지 지표를 동시에 모두 향상시키기 어려운 블록체인의 기술적 성격을 의미한다. 즉, 블록체인 네트워크를 설계하는 과정에서 특정 두 가지 지표를 향상시키고자 할 경우, 나머지 하나는 반드시 약화될 수밖에 없다는 것이다.

아직까지 이러한 트릴레마를 극복한 뚜렷한 사례가 없는 가운데, 세 가지 지표 중 하나인 탈중앙화에 대한 여러 가지 측정 방법들이 제시되고 있다. 이번 시간에는 탈중앙화를 정량화할 수 있는 여러 가지 방법들에 대해 소개하고, 각 체인 별로 측정을 해보고자 한다.

탈중앙화는 조직이나 집단의 의사결정권이나 참여도가 얼마나 분산되었는지를 의미하는 용어이다. 특히, 블록체인 네트워크에서의 탈중앙화란 블록 생성과 합의에 대한 의사결정권이나 보상청구권이 얼마나 분산화되었는지를 의미한다. 구체적으로 의미를 파헤치자면, 작업증명(Proof of Work)과 지분증명(Proof of Stake)의 경우 탈중앙화는 각각 다음과 같은 의미를 지닐 것이다.

![Consensus Mechanisms]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/consensus-mechanisms.webp)
> Consensus Mechanism

* **작업증명 기반 네트워크에서의 탈중앙화**: 해시레이트(Hashrate) 혹은 연산 능력(Computing Power)이 얼마나 골고루 분산 되어 있는가
* **지분증명 기반 네트워크에서의 탈중앙화**: 스테이킹 자산(Staked Assets)으로 표현되는 지분량이 얼마나 골고루 분산 되어 있는가

## 2. 탈중앙화의 측정

### 2.1. 준비: 데이터 수집

다음 10개의 네트워크를 선정하고, 탈중앙화 정도를 측정하기 위한 데이터를 수집하였다.
* [Ethereum (ETH)](https://blockchair.com/ethereum/charts/hashrate-distribution): 해시레이트(Hashrate) 분포
* [Binance Smart Chain](https://bscscan.com/validators): 의사결정권(Voting Power) 분포
* [Avalanche (AVAX)](https://explorer-xp.avax.network/validators): 지분량(Staked Assets) 분포
* [Solana (SOL)](https://solanabeach.io/validators): 지분량(Staked Assets) 분포
* [Fantom (FTM)](https://explorer.fantom.network/staking): 지분량(Staked Assets) 분포
* [Polygon (MATIC)](https://polygonscan.com/stat/miner?range=14&blocktype=blocks): 블록 검증 횟수(Number of Blocks Validated) 분포
* [Tron (TRX)](https://tronscan.org/#/sr/votes): 의사결정권(Voting Power) 분포
* [Cronos (CRO)](https://crypto.org/explorer/validators): 지분량(Staked Assets) 분포
* [Klaytn (KLAY)](https://scope.klaytn.com/): 블록 생성 횟수(Total Proposed Blocks) 분포
* [Celo (CELO)](https://celo.org/validators/explore): 지분량(Staked Assets) 분포

이상적으로는 해시레이트나 지분량 데이터를 수집하는 것이 가장 바람직하지만, 블록체인 익스플로러들의 제공 데이터 한계로 인해 가능한 한 "의사결정권이나 보상청구권"의 의미와 직접적으로 연관되는 데이터를 대체 수집하였다. 가령, 다음의 데이터들이 있다.

* **의사결정권(Voting Power) 분포**: 해시레이트나 지분량에 비례하여 Voting Power를 행사할 것이므로, 탈중앙화를 측정하기 위한 수단으로 대체 활용 가능
* **블록 검증 횟수(Number of Blocks Validated) 분포**: 해시레이트나 지분량에 비례하여 검증 기회를 부여 받을 것이므로, 탈중앙화를 측정하기 위한 수단으로 대체 활용 가능
* **블록 생성 횟수(Total Proposed Blocks) 분포**: 해시레이트나 지분량에 비례하여 블록 생성 기회를 부여 받을 것이므로, 탈중앙화를 측정하기 위한 수단으로 대체 활용 가능

데이터를 수집한 후, Pie Chart로 각 분포를 시각화한 결과는 다음과 같다.
![Utilized Seaborn Library in Python 3]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/Utilized Seaborn Library in Python 3.webp)
> Utilized Seaborn Library in Python 3

### 2.2. 유형별 측정

**(1) 허핀달-허쉬만 지수 (HHI, Herfindal-Hershman Index)**

![HHI 공식]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/hhi.webp)
> HHI 공식

HHI 공식허핀달-허쉬만 지수(이하 HHI)는 특정 시장의 집중도를 평가할 때 사용되는 지표로서, 시장 내 모든 사업자들의 각 시장 점유율(%)을 제곱하여 합한 값을 말한다. 시장의 독과점에 대한 공정거래법을 적용하는 척도로 사용되기도 하는데, HHI는 다음과 같은 특징을 지니고 있다.

|**HHI**|**Value**|**탈중앙화 정도**|
|-|--|-|
|Minimum|`0.0000`|완전 탈중앙화|
|Maximum|`1.0000`|완전 중앙화|

* 특정 상위 N개 주체의 점유율뿐만 아니라, 모든 주체들의 점유율을 반영할 수 있다.
* [HHI의 역수는 이론상 당해 시장 내에 똑같은 규모를 갖는 기업들이 존재한다고 가정할 때 얼마나 많은 기업이 존재할 것인가를 나타내며 그 수효가 많으면 많을수록 그 시장은 보다 경쟁적이라는 것을 시사한다.](https://www.ftc.go.kr/callPop.do?url=%2FjargonSearchView.do%3Fkey%3D451&dicseq=428&titl=%ED%97%88%ED%95%80%EB%8B%AC-%ED%97%88%EC%89%AC%EB%A7%8C+%EC%A7%80%EC%88%98%28Herfindal-Hershman+Index%29)
* [미국은 합병 심사 시 시장집중 측정지표로 HHI를 다음과 같이 평가하고 있다.](https://www.ftc.go.kr/callPop.do?url=/jargonSearchView.do?key=451&dicseq=428&titl=%ED%97%88%ED%95%80%EB%8B%AC-%ED%97%88%EC%89%AC%EB%A7%8C%20%EC%A7%80%EC%88%98(Herfindal-Hershman%20Index))

**HHI**|**Class**
-|-
`0.0000 < HHI <= 0.1000`|비집중적인 시장
`0.1000 < HHI <= 0.1800`|어느 정도 집중적인 시장
`0.1800 < HHI <= 1.0000`|고도로 집중적인 시장

```python
# User-defined Function to get HHI in Python 3
def getHHI(series):
	total = np.sum(series)
	series_perc = series / float(total)
	HHI = np.sum(series_perc ** 2)
	return HHI
```

![(좌) 중앙화 ↑ (우) 탈중앙화 ↑]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/hhi-by-blockchain.webp)
> (좌) 중앙화 ↑ (우) 탈중앙화 ↑

**(2)지니 계수 (Gini Coefficient)**

![Gini Coefficient]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/gini.webp)
> [Source](https://ko.wikipedia.org/wiki/%EC%A7%80%EB%8B%88_%EA%B3%84%EC%88%98)

Source지니 계수(이하 Gini)는 경제적 불평등 및 빈부 격차의 정도를 계수화한 지표로, 한 국가 내애서의 소득 불평등 정도를 측정하기 위해 가장 널리 사용된다. 위 그림에서는 직각삼각형의 넓이 중 색칠된 영역의 넓이가 차지하는 비율로 산출된다. Gini는 다음과 같은 특징을 지닌다.

|**Gini**|**Value**|**탈중앙화 정도**|
|-|--|-|
|Minimum|`0.0000`|완전 탈중앙화|
|Maximum|`1.0000`|완전 중앙화|

* 각 주체의 점유율(%)을 오름차순으로 정렬한 후, 좌표평면(X축은 각 주체의 누적 수, Y축은 각 주체의 누적 점유율) 상에 표현한 것이 로렌츠 곡선(Lorenz Curve)이다.
* 경제적으로 완전히 평등할 경우, 로렌츠 곡선이 45도 각도의 직선 형태가 될 것이고, 불평등할수록 하방 굴곡도가 높아질 것이다.
* Gini는 시장 전체의 분배 상태를 하나의 수치로 나타내므로, 특정 소수의 영향력에 대해서는 정보가 누락될 가능성이 있다.

```python
# User-defined Function to get Gini Coefficient in Python 3
def getGini(series):  
	series_sorted = sorted(series)  
	height, area = 0, 0  
	for value in series_sorted:  
		height += value  
		area += height - value / 2.  
	fair_area = height * len(series) / 2.  
	Gini = (fair_area - area) / fair_area  
	return Gini
```

![(좌) 중앙화 ↑ (우) 탈중앙화 ↑]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/gini-by-blockchain.webp)
> (좌) 중앙화 ↑ (우) 탈중앙화 ↑

**(3) 엔트로피 (Entropy)**

![Entropy]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/entropy.webp)
> Entropy 공식

엔트로피는 자연과학이나 정보이론에서 중요하게 다뤄지는 지표로, 확률변수의 불확실성이나 데이터의 혼잡도를 측정하기 위해 사용된다. 엔트로피는 다음과 같은 특징을 지닌다.

|**Entropy**|**Value**|**탈중앙화 정도**|
|-|--|-|
|Minimum|`0.0000`|완전 중앙화|
|Maximum|`Infinite`|완전 탈중앙화|

* 주어진 데이터 집합 내에서 서로 다른 종류의 항목들(Datapoints)이 많을 수록 엔트로피가 높고, 같은 종류의 항목들(Datapoints)이 많을 수록 엔트로피가 낮다.
* 블록체인의 탈중앙화 지수로 활용할 경우, 엔트로피가 높을 수록 의사결정권이 잘 분산되어 있고, 엔트로피가 낮을 수록 의사결정권이 특정 소수에 집중되어 있다고 판단해볼 수 있다.

```python
# User-defined Function to get Entropy in Python 3
def getEntropy(series):
	total = np.sum(series)
	series_perc = series / float(total)
	series_perc = series_perc[series_perc > 0]
	series_perc_list = list(series_perc)
	Entropy = 0
	for each in series_perc_list:
		Entropy += np.log2(each) * each
	Entropy = -Entropy
	return Entropy
```

![(좌) 중앙화 ↑ (우) 탈중앙화 ↑]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/entropy-by-blockchain.webp)
> (좌) 중앙화 ↑ (우) 탈중앙화 ↑

**(4) 검열저항성 DQ (Censorship Resistance, Decentralization Quotient)**

![DQ 공식 (PoW 기반 네트워크]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/entropy-by-blockchain.webp)
> DQ 공식 (PoW 기반 네트워크)

![DQ 공식 (PoS 기반 네트워크]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/entropy-by-blockchain.webp)
> DQ 공식 (PoS 기반 네트워크)

DQ는 검열저항성(Censorship Resistance)에 기반한 탈중앙화 지수로, 특정 소수 노드의 허위 블록 생성이나 프론트러닝(Front-running) 등 악의적 행위에 대한 저항성을 의미한다. DQ는 다음과 같은 특징을 지닌다.

|**DQ**|**Value**|**탈중앙화 정도**|
|-|--|-|
|Minimum|`0.0000`|완전 탈중앙화|
|Maximum|`1.0000`|완전 중앙화|

* 위의 산식을 자세히 살펴보면, Herfindal-Hershman Index(HHI)로부터 입력값을 받아 변형된 형태임을 알 수 있다. (따라서 HHI로 측정하는 경우와 동일한 비교 우위 결과가 나올 것이다.)
* 작업증명(PoW) 기반 네트워크에서는 각 노드의 해시레이트 비율(%)로 계산된 HHI가 수식의 입력값이 된다.
* 지분증명(PoS) 기반 네트워크에서는 각 노드의 스테이킹 자산 비율(%)로 계산된 HHI가 수식의 입력값이 된다.

```python
# User-defined Function to get Decentralization Quotient in Python 3
def getDQ(series):
	DQ = 1 - 2 * (0.5 - getHHI(series))
	return DQ
```

![(좌) 중앙화 ↑ (우) 탈중앙화 ↑]({{ site.baseurl }}/assets/2022-07-12-measuring-decentralization/entropy-by-blockchain.webp)
> (좌) 중앙화 ↑ (우) 탈중앙화 ↑

**(5) Recap**

|**Network**|**HHI 탈중앙화 순위**|**Gini 탈중앙화 순위**|**Entropy 탈중앙화 순위**|**DQ 탈중앙화 순위**
|-|-|-|-|-|
|Ethereum|`10`|`8`|`10`|`10`|
|Binance Smart Chain|`6`|`1`|`8`|`6`|
|Avalanche|`1`|`9`|`2`|`1`|
|Solana|`2`|`4`|`1`|`2`|
|Fantom|`9`|`6`|`6`|`9`|
|Polygon|`8`|`7`|`7`|`8`|
|Tron|`4`|`10`|`5`|`4`|
|Cronos|`5`|`5`|`4`|`5`|
|Klaytn|`7`|`3`|`9`|`7`|
|Celo|`3`|`2`|`3`|`3`|

## 3. 결론

탈중앙화 개념에 대해 정량적으로 접근하는 방법에는 상술한 네 가지 방법 외에도 수많은 아이디어들이 있다. 이더리움 창시자 비탈릭 부테린이 2017년 처음으로 탈중앙화 개념을 추상적으로 제안한 이후, 여러 가지 측면에서 탈중앙화 지수가 등장했다.

**그러나 본 아티클에서 다룬 4가지 측정 방법들은 다음 측면에서 중대한 문제점이 있다.**
**1. 노드의 수(Total Absolute Number of Nodes in the Network)를 고려하지 않아, 네트워크 참여나 활성화 정도를 고려하지 않았다.**
**2. 노드 참여에 대한 자격 요건(Prerequisite)을 배제한 채 실험이 진행되었다.**

노드의 수와 자격 요건 등을 고려하지 않은 채 실험을 진행한 결과, Klaytn과 Solana가 Ethereum보다 탈중앙성이 더욱 높은 결과가 도출되었다. 가령, Klaytn의 경우 재단과 파트너십 관계에 있는 약 30개의 노드들만 선정되었고 일반인이 운영하는 노드의 자유로운 Entry/Exit이 불가능한 Governance를 지니고 있고, Solana의 경우 노드에 참여하기 위한 Resource Requirements가 매우 높은 편이다. 결국, Klaytn과 Solana가 Ethereum보다 높은 탈중앙성을 지니고 있다고 말하는 것은 선뜻 상식에 부합되기 어려워 보인다. 따라서, **탈중앙화 측정을 위해 소개한 4가지 방법들은 탈중앙화를 측정한다기보다는, 단순히 "현재 노드들 간의 빈부격차" 정도로만 해석하는 것이 바람직할 것으로 보인다.**

**노드들 간의 빈부격차 뿐만 아니라, 노드의 수와 노드 참여에 대한 자격 요건 등 더욱 많은 현황을 Input Data로 활용할 수 있는 종합 측정 방법이 필요할 것이다.** 학계와 업계 내에서 탈중앙화 측정에 대한 연구가 지속적으로 진행 중인 만큼, 탈중앙화에 특화된 더욱 정교한 Valuation 방법이 나오길 기대해본다.

## References
* [Blockchain Trilemma Image](https://www.researchgate.net/figure/The-Blockchain-Trilemma_fig2_352284073)
* [PoW and PoS consensus mechanisms comparison](https://www.researchgate.net/figure/PoW-and-PoS-consensus-mechanisms-comparison_fig2_334061880)
* [Ethereum On-chain Data](https://blockchair.com/ethereum/charts/hashrate-distribution)
* [Binance Smart Chain On-chain Data](https://bscscan.com/validators)
* [Avalanche On-chain Data](https://explorer-xp.avax.network/validators)
* [Solana On-chain Data](https://solanabeach.io/validators)
* [Fantom On-chain Data](https://explorer.fantom.network/staking)
* [Polygon On-chain Data](https://polygonscan.com/stat/miner?range=14&blocktype=blocks)
* [Tron On-chain Data](https://tronscan.org/#/sr/votes)
* [Cronos On-chain Data](https://crypto.org/explorer/validators)
* [Klaytn On-chain Data](https://scope.klaytn.com/)
* [Celo On-chain Data](https://celo.org/validators/explore)
* [공정거래위원회: 허핀달-허쉬만 지수](https://www.ftc.go.kr/callPop.do?url=%2FjargonSearchView.do%3Fkey%3D451&dicseq=428&titl=%ED%97%88%ED%95%80%EB%8B%AC-%ED%97%88%EC%89%AC%EB%A7%8C+%EC%A7%80%EC%88%98%28Herfindal-Hershman+Index%29)
* [Wikipedia: 지니 계수](https://ko.wikipedia.org/wiki/%EC%A7%80%EB%8B%88_%EA%B3%84%EC%88%98)
* [DQ: Two approaches to measure the degree of decentralization of blockchain](https://www.sciencedirect.com/science/article/pii/S2405959521000977)

---