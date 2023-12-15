---
layout: post
title: "OpenSea에서 발생한 트랜잭션 데이터 구조"
tags:
  - Blockchain
  - On-chain Data
---

> 안녕하세요. 저는 블록체인 기반 서비스 기업에서 데이터 분석을 담당하고 있는 Joshua라고 합니다. 이번 아티클에서는 OpenSea에서 NFT Transfer가 발생했을 때, EVM 계열 블록체인의 온체인 상에 데이터가 어떤 모습으로 남아 있는지 파헤쳐 보도록 하겠습니다.

### CONTENTS
1. 오늘의 토픽
2. 바쁘신 분들을 위한 두괄식 결론
3. 상세 내용 파헤치기
	* 3.1. TransactionReceipt
	* 3.2. OpenSea의 Wyvern 컨트랙트로부터 발생한 Internal TXs
	* 3.3. `atomicMatch_` 함수로부터 발생한 Events
4. 정리하기

---

# 1. 오늘의 토픽

먼저 오늘 사례로 살펴볼 NFT는 **Bored Ape Yacht Club**의 `tokenId` = `3238`인 NFT입니다.

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/bayc.webp)
> [Source](https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/3238)

이 NFT의 활동 내역을 보면 Transfers 히스토리가 많이 남아 있는데요. 그 중에서, `wizmo` 계정으로부터 `LGHTWRK` 계정으로의 Transfer 내역을 뜯어보도록 할게요.

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/bayc-transfers.webp)
> [Source](https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/3238)

이 Transfer 내역의 우측 바로가기 버튼을 클릭하면 아래와 같이 Etherscan의 `Transaction Receipt` 페이지가 팝업합니다. 하지만 안타깝게도 일반적인 ETH 송금과 달리, 트랜잭션이 상당히 난해하여 도대체 어떤 구조와 절차를 통해 실행된 것인지 알기란 참 어려워요. 특히, 블록체인 초심자라면 더욱 난감하겠죠.

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/etherscan-overview.webp)
> [Source](https://etherscan.io/tx/0xe769c002eb1a13e9384d8b62270c963188a686068f2833a9c1b07b160468e80c)

# 2. 바쁘신 분들을 위한 두괄식 결론

> **`wizmo`의 NFT 경매에 대하여 `LGHTWRK`의 Offer가 수락되어, `wizmo`가 `LGHTWRK`에게 NFT를 전송하는 거래가 성사되었다.**

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/flowchart.webp)
> Joshua가 작성한 Flowchart

# 3. 상세 내용 파헤치기

## 3.1. TransactionReceipt

우선, 크게 다음과 같은 내용을 알 수 있습니다.

| **파라미터** | **값** | **참고내용** |
| - | - | - |
| **from** | 0x869c…Bf89 | `LGHTWRK`의 주소
| **to** | 0x7Be8…D12b | `OpenSea: Wyvern Exchange v1`의 주소
| **value** | 2.1000 ETH | 0.1050 ETH + 1.9950 ETH
| **tx fee** | 0.0084 ETH | -
| **data** | `atomicMatch_` | 함수 호출

즉, 이 트랜잭션의 기본 골격은 다음과 같습니다.
> **`LGHTWRK`로부터 `OpenSea의 Wyvern 컨트랙트`를 향해 `2.1000` ETH를 송금함과 동시에 해당 컨트랙트의 ABI에 정의되어 있는  `atomicMatch_`  함수를 실행하는 것을 목표로 한다.**

참고로, 제가 `2.1000` ETH를 `0.1050` ETH + `1.9950` ETH 로 쪼개어 표현했는데요. 제가 왜 그랬을까요? 바로 아래를 보시죠.

## 3.2. OpenSea의 Wyvern 컨트랙트로부터 발생한 Internal TXs

`LGHTWRK`가 `OpenSea의 Wyvern 컨트랙트`를 향해 송금하게 되면서, 컨트랙트로부터 총 2개의 트랜잭션이 파생적으로 발생했습니다. 바로, NFT를 구매하고 싶은 `LGHTWRK`가 OpenSea에 수수료를 납부하고, NFT 소유자인 `wizmo`에게 제시한 가격을 지불해야 하는 내용인 것이죠.

**1. `OpenSea의 Wyvern 컨트랙트`가  `OpenSea 수수료 전용 EOA`에 `0.1050` ETH를 송금한다.**
* **from**  = 0x7Be8…D12b (`OpenSea: Wyvern Exchange v1`)
* **to**  = 0x5b32…1073 (`OpenSea: Wallet`)

**2. `OpenSea의 Wyvern 컨트랙트`가  `wizmo`에게 `1.9950` ETH를 송금한다.**
* **from**  = 0x7Be8…D12b (`OpenSea: Wyvern Exchange v1`)
* **to**  = 0xc4CB…9B26 (`wizmo`)

참고로, Etherscan의 Transaction Receipt 페이지에서 **Internal Txns 탭**을 클릭하면 위 내용을 확인하실 수 있는데요. 블록체인 데이터 측면에서는 이러한 **Internal TX**를 흔히 `Trace`라고도 표현합니다.

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/ethersacn-internal-tx.webp)
> [Source](https://etherscan.io/tx/0xe769c002eb1a13e9384d8b62270c963188a686068f2833a9c1b07b160468e80c#internal)

## 3.3. `atomicMatch_` 함수로부터 발생한 Events

`OpenSea의 Wyvern 컨트랙트`에게 Input Data로 적어준  **_atomicMatch__**  함수를 통해,  `OpenSea의 Wyvern 컨트랙트`  에서는 총 3개의 Events가 발생(emit)하게 됩니다.

사실, **_atomicMatch__** 함수를 통해 어떤 Events가 실행되는지 명확하게 알기 위해서는 아래와 같이  `OpenSea의 Wyvern 컨트랙트`의 코드를 분석해야 하는데요. 이것까지 살펴보려면 분량이 너무 길어질 것 같으니, 오늘은 생략할게요.

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/etherscan-source-code.webp)
> [Source](https://etherscan.io/address/0x7be8076f4ea4a4ad08075c2508e481d6c946d12b#code)

**1. Approval 이벤트**
* ERC-721 ABI의 `Approval` 이벤트와 파라미터 구조가 똑같습니다. ERC-721 ABI의 `Approval` 이벤트는 “특정 Address가 소유자를 대신하여 NFT를 사용할 수 있는 권한을 주게는” 것을 의미합니다.
* Approval 이벤트는 ERC-721 ABI의 `approve` 함수를 통해 발생하게 되는데, 이번 아티클에서 소개 드리고 있는 트랜잭션에서는 approve 함수가 실행된 적이 없는 것으로 보아, 아마 소유자인  `wizmo`가 자신의 NFT를 경매에 올린 시점에 오프체인 상에서 Signed된 트랜잭션 메시지를 본 트랜잭션과 묶음 단위로 브로드캐스트했기 때문이지 않을까 추측해봅니다.

```python
owner = 0xc4cb…9b26 # wizmo
approved = 0x0000…0000  
tokenId = 3238
```

**2. Transfer 이벤트**
-   NFT의 소유권이 `wizmo`로부터 `LGHTWRK`로 넘어가게 되는 이벤트입니다.

```python
from = 0xc4cb…9b26 # wizmo  
to = 0x869c…bf89 # LGHTWRK
tokenId = 3238
```

**3. OrdersMatched 이벤트**
* 정확히 어떤 것을 의미하는지 알기 위해서는  `OpenSea의 Wyvern 컨트랙트`  의 코드를 분석해야 하겠지만, 우선 경매를 통해 성사된 거래 내역이 기록된 것이라고 생각하고 넘어가봅시다.

```python
maker = 0xc4cb…9b26 # wizmo (OpenSea 경매 시장의 Maker)
taker = 0x869c…bf89 # LGHTWRK (OpenSea 경매 시장의 Taker)
metadata = 0x0000…0000 # data  
buyHash = 0000…0000  
sellHash = A7B1…297F  
price = 2.1000 # ETH
```

# 4. 정리하기

지금까지 가벼운 마음으로(?) 아래 내용을 데이터적으로 뜯어보았습니다.

> **`wizmo`의 NFT 경매에 대하여 `LGHTWRK`의 Offer가 수락되어, `wizmo`가 `LGHTWRK`에게 NFT를 전송하는 거래가 성사되었다.**

![]({{ site.baseurl }}/assets/2023-09-18-opensea-transaction/flowchart.webp)
> Joshua가 작성한 Flowchart

ETH, ERC-20의 송금과 달리, ERC-721은 좀 더 다양한 메타데이터를 지니고 있고, 심지어 OpenSea는 자체적으로 컨트랙트를 구현하여 ERC-721 토큰의 경매가 자동으로 성사될 수 있도록 프로토콜을 구현했습니다. `OpenSea의 Wyvern 컨트랙트`는 사실 최근에는 사용 빈도가 줄어들게 되었는데요. 그럼에도 불구하고, OpenSea와 같은 NFT Marketplace에서 발생한 NFT 매매 과정이 온체인 상에 어떻게 기록되어 있는지 조회하기에 좋은 예시라고 생각합니다.

참고로, OpenSea는 경매 과정의 각 특정 행위가 발생할 때마다 매번 온체인 상에 기록하는 것이 아니라, 오프체인 상에서 서명이 완료된 트랜잭션 메시지를 보관하고 있다가, 한꺼번에 Bulk 단위로 온체인 상에 메시지를 브로드캐스트하는 방식을 사용하곤 합니다. 이는 최종 사용자 측면에서 TX Fee의 부담을 줄여 사업의 P&L을 최적화하기 위한 작업으로 보이지만, 블록체인의 트릴레마 항목 중 하나인 “탈중앙화” 훼손 논란의 여지가 있어 보이기도 합니다.

읽어주셔서 감사합니다.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)