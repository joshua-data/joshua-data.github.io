---
layout: post
title: "『마스터링 이더리움』 중요한 내용 모조리 요약"
tags:
  - Blockchain
---

> 개발적인 용어가 난무해서 당시에는 도저히 펼쳐 볼 엄두가 안 났지만, 이 업계에서 약 3년 가까이 구르다보니 어느 정도 잘 읽히게 되었다. 그래서 2023년 1월 1일 새해 목표 중 하나로 “**마스터링 이더리움 완독하고 정리하기**”를 세우게 되었다. 그리고 약 1개월 만에 다 읽게 되었다.

### CONTENTS
1. 들어가는 글
2. 주의사항
3. **[Chapter 01–02]** What is Ethereum? & Intro to Ethereum
4. **[Chapter 03]** Ethereum Clients
5. **[Chapter 04]** Cryptography
6. **[Chapter 05]** Wallets
7. **[Chapter 06]** Transactions
8. **[Chapter 07]** Smart Contracts & Solidity
9. **[Chapter 08]** Smart Contracts & Vyper
10. **[Chapter 09]** Smart Contracts & Security
11. **[Chapter 10]** Tokens
12. **[Chapter 11]** Oracles
13. **[Chapter 12]** Decentralized Applications (dApps)
14. **[Chapter 13]** Ethereum Virtual Machine (EVM)
15. **[Chapter 14]** Consensus

---

### DISCLAIMER
본 아티클은 작성자의 전/현직 기업의 사업 내용과 전혀 관련이 없으며, 개인적인 학습을 통해 작성한 것임을 밝힙니다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/textbook.webp)
> [Source](https://product.kyobobook.co.kr/detail/S000001916933)

# 1. 들어가는 글

때는 2021년 3월, 블록체인과 가상자산에 대해 무지몽매한 상태로 업계에 처음 발을 들였다. 생소한 블록체인 기술과 아키텍처를 이해하려고 노력해도 도무지 감이 안 잡혀서 고통스럽기도 했다. 많은 것을 의지했던 당시 옆 자리 선배님의 책상에는 마스터링 이더리움 책이 놓여 있었다.

> “이 책이 제일 좋아요. 그런데 그만큼 엄청 어려워요.”

개발적인 용어가 난무해서 당시에는 도저히 펼쳐 볼 엄두가 안 났지만, 이 업계에서 약 3년 가까이 구르다보니 어느 정도 잘 읽히게 되었다. 그래서 2023년 1월 1일 새해 목표 중 하나로 “**마스터링 이더리움 완독하고 정리하기**”를 세우게 되었다. 그리고 약 1개월 만에 다 읽게 되었다.

# 2. 주의사항

* 개발을 위한 소스 코드 내용이나 암호학 이론 등 지나치게 깊은 내용은 Skimming하여 정리했다.
* 개발자는 아니지만 프로그래밍과 데이터에 대한 이해를 하고 있는 입장에서, 완벽하지는 않지만 그래도 나름 잘 정리해봤다.
* 이더리움의 바이블이라고 불리는 이 책을 직접 읽기에는 부담을 느끼시는 분들께서 빠르게 훑어보고 싶을 때 유용하게 쓰실 수 있기를 바란다.
* 내용을 요약하는 과정에서 오류가 있을 수 있으므로, 정확한 레퍼런스는 반드시 본서를 참고해주시기를 바란다.

# 3. [Chapter 01–02] What is Ethereum? & Intro to Ethereum

비트코인의 스크립트(Script) 언어가 의도적으로 지불 조건에 대한 단순한 True/False 평가에만 제한되어 있는 반면, 이더리움 언어는 튜링 완전 언어다. 이것은 이더리움이 범용 컴퓨터로 직접 작동할 수 있음을 의미한다.

여러 블록체인의 성격을 파악하기 위해  **개방성**,  **공공성**,  **국제화**,  **탈중앙화**,  **중립성**,  **검열저항성**  등의 평가 기준이 필요하다.

이더리움은 탈중앙화된 State Machine으로서, Key-Value Tuple로 표현할 수 있는 모든 데이터를 저장할 수 있는 저장소의 상태 전이(State Change)를 추적한다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/state-change.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

이더리움 상태 전이는 Bytecode를 실행하는 스택 기반 가상머신인 EVM에 의해 처리된다.

스마트 컨트랙트라는 EVM 프로그램은:

-   고수준 언어인 Solidity로 작성되고,
-   EVM에서 실행되도록 Bytecode로 컴파일된다.

이더리움의 State는 트랜잭션 및 시스템 상태가 머클 패트리샤 트리([MERKLE PATRICIA TRIE](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/))라고 하는 시리얼라이즈된 해시 데이터 구조로, 각 노드의 DB에 저장된다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/merkle-patricia-trie.webp)
> [Source](https://medium.com/codechain/modified-merkle-patricia-trie-how-ethereum-saves-a-state-e6d7555078dd)

사실 암호화폐 기능은 탈중앙화된 월드 컴퓨터로서의 이더리움 기능에 부차적인 것이다.

-   ETH는 EVM이라고 하는 에뮬레이트된 컴퓨터에서 실행되는 컴퓨터 프로그램인 스마트 컨트랙트를 실행하는 데 사용되기 위한 것이다.

EOA만 트랜잭션를 시작(Initiate)할 수 있고, 컨트랙트는 복잡한 실행 경로를 구축하여 다른 컨트랙트를 호출해서 반응(React)할 수 있다. 이것을 사용하는 전형적인 방법은 Multi-sig 스마트 트랜잭션 지갑에 지급 요청 트랜잭션을 전송하여 일부 ETH를 다른 주소로 보내는 것이다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/eoa-ca.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

* **EOA**  (Externally Owned Account): 트랜잭션을 시작할 수 있음
* **CA**  (Contract Account): EOA의 함수 호출에 의해 반응할 수 있음

블록체인에 컨트랙트를 배포
* 목적지 주소가  `0x00…0`인 특수 트랜잭션을 만드는 것

컨트랙트에서 시작된 Internal Transaction은 Message라고도 한다.

# 4. [Chapter 03] Ethereum Clients

블록체인의 건전성, 복원력, 검열저항 특성은 독립적으로 운용되고 지리적으로 분산된 Full Nodes가 얼마나 많은지에 달려 있다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/clients.webp)
> [Source](https://ethereum.org/en/developers/docs/nodes-and-clients/client-diversity/)

# 5. [Chapter 04] Cryptography

타원 곡선 산술에서 소수로 나눈 나머지를 곱하는 것은 간단하지만, 나눗셈은 사실상 불가능하다. 이것을 이산로그문제라고 하며, 현재는 알려진 트랩도어는 없다.

타원 곡선 암호화는 최신 컴퓨터 시스템에서 광범위하게 활용되며, 이더리움에서 개인키와 디지털 서명을 사용하는 기초가 된다.

이더리움 공개키는 타원 곡선에 있는 점으로, 타원 곡선 방정식을 만족하는 x와 y 좌표의 집합을 의미한다.
* `공개키(K) = 개인키(k) * G(generator point)`
	* (여기에서 *은 일반적인 곱셈이 아닌, 특수 타원 곡선 곱하기 연산)

# 6. [Chapter 05] Wallets

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/key-flowchart.webp)
> 작성자: Joshua

지갑은 보유 중인 Private Key들이 서로 관련이 있느냐 없느냐에 따라 비결정적 지갑과 결정적 지갑으로 구분된다.

* **비결정적 지갑**: 각기 다른 무작위 수로부터 각 Private Key를 무작위적으로 추출한다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/비결정적-지갑.webp)
> [Source](http://wiki.hash.kr/index.php/HD_%EC%A7%80%EA%B0%91)

* **결정적 지갑**: 모든 Private Key가 단일 마스터 키인 seed로부터 파생된다. seed는 단어 목록인 니모닉 코드 단어로 인코딩되어 불의의 사고에 대비할 수 있다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/결정적-지갑.webp)
> [Source](http://wiki.hash.kr/index.php/HD_%EC%A7%80%EA%B0%91)

* (참고) [**HD 지갑**](http://wiki.hash.kr/index.php/HD_%EC%A7%80%EA%B0%91): 결정적 지갑은 단일 시드에서 많은 키를 쉽게 유도하기 위해 만들어졌다. 현재 가장 진보한 형태의 결정적 지갑은 비트코인의 BIP32 표준으로 정의된 HD 지갑이다. HD 지갑은 부모 키가 연속된 자식 키를 유도할 수 있고, 각각의 자식키는 손자 키를 유도할 수 있는 구조인 트리 구조로 파생된 키를 포함한다. 이러한 구조는 부모 키가 자식 키의 시퀀스를 유도할 수 있고, 각각의 자식은 다시 또 손자 키의 시퀀스를 유도할 수 있다. HD 지갑은 결정적 지갑에 비해 몇 가지 장점이 있다. 먼저 HD 지갑의 트리 구조는 예를 들어, 특정 서브 키의 특정 분기는 입금을 위해 사용하고, 다른 브랜치는 출금의 잔돈을 받기 위해 사용할 수 있다. 또한 부서, 자회사, 특정 기능 또는 회계 카테고리로 다른 분기를 할당하여 기업 설정과 같은 구조적인 의미를 표현하는 데도 사용할 수 있다. HD 지갑의 또 다른 장점은 사용자가 개인키에 접근하지 않고, 연속된 공개키를 생성할 수 있는 것이다. HD 지갑은 보안상 안전하지 않은 서버, 보기 전용, 수신 전용의 용도로 사용할 수 있는데, 이때 지갑에는 자금을 움직이는 개인키가 들어 있지 않게 만들 수 있다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/HD-지갑.webp)
> [Source](http://wiki.hash.kr/index.php/HD_%EC%A7%80%EA%B0%91)

# 7. [Chapter 06] Transactions

이더리움은 Global Singleton State Machine이며, 트랜잭션은 이 State Machine을 움직여서 상태를 변경할 수 있도록 만든다.

트랜잭션은 다음 데이터를 포함하는 serialized binary message다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/transaction.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

-   **nonce**,  **gas price**,  **gas limit**,  **recipient**,  **value**,  **data**,  **v**,  **r**,  **s**

트랜잭션 메시지 구조는 RLP(Recursive Length Prefix) 인코딩 체계를 사용하여 serialize된다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/rlp.webp)
> 작성자: Joshua

(1)  **Nonce**: 해당 address에서 보낸 tx 건수 OR 컨트랙트 생성 건수 (scalar value). 사용상의 기능 및 트랜잭션 복제 방지의 효과를 지님.

(2)  **Gas Price & Limit**: DoS 공격이나 실수로 막대한 자원을 소모하는 tx를 피하기 위한 metering 역할을 함.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/gas.webp)
> [Source](https://ethereum.org/en/developers/docs/transactions/)

(3)  **Recipient**: 이더리움은 to_address의 유효성을 검증하지 않는다. 이 유효성 검정은 사용자 인터페이스 수준에서 수행되어야 함.
* recipient를 zero address(`0x00…0`)로 두면, 컨트랙트 생성 트랜잭션을 의미함

(4)  **value & data**: value는 지급량, data는 호출. EOA나 CA에 지급량 혹은 호출에 필요한 data payload를 전달함.

(5)  **v, r, s**: r과 s는 tx 메시지에 private key로 서명한 결과값. v는 서명을 확인하는 데 도움이 되는 복구 식별자와 chain id.

**트랜잭션 서명 프로세스**
* (1) nonce, gasPrice, gasLimit, to, value, data, chainID, 0, 0의 9개 필드를 포함하는 tx 데이터 구조를 만든다.
* (2) RLP로 인코딩하여 serialized message를 생성한다.
* (3) serialized message를 Keccak-256 해시를 리턴한다.
* (4) 리턴된 해시를 private key로 ECDSA 서명을 계산한다.
* (5) 계산된 결과를 message의 v, r, s에 추가한다.

**서명 및 전송 분리 (Offline Signing)**

* Unsigned tx msg를 온라인에서 생성, 오프라인에서 private key를 통해 Sign하여 Signed tx msg를 온라인에 전달, 온라인에서 네트워크로 flood.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/offline-signing.webp)
> 작성자: Joshua

**트랜잭션 전파**
* (1) flood routing 프로토콜을 사용한다.
* (2) 각 노드는 적어도 13개의 다른 노드에 대한 연결을 유지한다.
* (3) 트랜잭션을 생성한 ‘직접’ 연결된 다른 모든 노드로 전송된다.
* (4) 각 노드의 관점에서 보면, 수신된 tx의 출처를 식별할 수 없다. 발신한 노드는 tx의 생성자일 수도 있고, 똑같은 tx 수신자일 수도 있기 때문이다.
* (5) 비트코인은 multi-sig 계정을 만들 수 있지만, 이더리움의 기본 EOA에는 multi-sig 기능이 없다. 컨트랙트 계정을 생성하여 multi-sig을 구현해야 한다.
* (6) 컨트랙트를 통해 더욱 다양한 형태의 multi-sig를 구현할 수 있다는 측면에서 유연성이 있지만, 컨트랙트 코드 자체에 의해 보안 취약점이 발생할 수 있으므로, multi-sig를 컨트랙트 수준이 아닌, EVM 수준에서 처리하게 하자는 제안이 많다.

# 8. [Chapter 07] Smart Contracts & Solidity

컨트랙트 계정은 개인키를 갖지 않으므로 스마트 컨트랙트에 규정된 미리 결정된 방식으로 ‘스스로 제어’하는 반면, EOA는 프로토콜의 외부의 독립적인 ‘실제 세계’의 개인키로 생성되고 암호로 서명된 거래에 의해 제어된다.
* **스마트 컨트랙트**: 이더리움 네트워크 프로토콜(탈중앙화된 이더리움 월드 컴퓨터)의 일부인 EVM 컨텍스트 상에서 결정론적으로(deterministically) 작동하는 불변적인(immutable) 컴퓨터 프로그램

**컨트랙트 생성**
* 컨트랙트 생성 트랜잭션은 고유한 컨트랙트 생성 주소, 즉  `0x0`으로 전송된다.
* 컨트랙트 생성자는 프로토콜 수준에서 특별한 권한을 얻지 못한다. (스마트 컨트랙트 계정을 위한 개인키가 없기 때문)

오류로 인해 컨트랙트 실행이 실패하면 모든 상태 변경은 트랜잭션이 실행되지 않은 것처럼 롤백(rolled back)된다.

**컨트랙트 삭제**
* 컨트랙트를 ‘삭제’하여 해당 주소에서 코드와 내부 상태를 제거하고 빈 계정으로 남길 수 있다. (**SELFDESTRUCT**) 이 작업은 Negative Gas, 즉 가스 환불이 일어나기 때문에 저장된 상태의 삭제로 인한 네트워크 클라이언트 자원을 반환하도록 하는 동기부여를 만든다.

EVM은 x86_64 같은 머신 코드를 실행하는 컴퓨터의 CPU와 유사한 EVM Bytecode라는 특수한 형태의 코드를 실행하는 가상 머신이다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/evm.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

**Solidity 프로젝트의 주된 기능**
* Solidity 언어로 작성된 프로그램을 EVM Bytecode로 변환하는 컴파일러인 solc이다.
* 이더리움 스마트 컨트랙트를 위한 중요한 ABI(Application Binary Interface) 표준을 관리한다.

**ABI (Application Binary Interface)**
* ABI는 데이터 구조와 함수가 어떻게 기계 코드에서 사용되는지 그 방법을 정의한다. 즉, 기계 코드와 데이터를 교환하기 위해 인코딩 및 디코딩하는 기본 방법이다.
* 이더리움에서 ABI는 EVM에서 컨트랙트 호출을 인코딩하고 트랜잭션에서 데이터를 읽는 데 사용된다.
* ABI의 목적은 컨트랙트에서 호출할 수 있는 함수를 정의하고 각 함수가 인수를 받아들이고 결과를 반환하는 방법을 설명하는 것이다.
* 컨트랙트의 ABI는 함수 설명 및 이벤트의 JSON 배열로 지정된다.
* 애플리케이션이 컨트랙트와 상호작용하는 데 필요한 것: ABI + 컨트랙트 주소

**스마트 컨트랙트를 만들 때 함수 호출의 가스 비용을 최소화하기 위해 권장하는 지침**
* (1) Dynamic Array 피하기
* (2) 다른 컨트랙트 호출 피하기

# 9. [Chapter 08] Smart Contracts & Vyper
Chapter 07 솔리디티 편을 정독하는 것만으로 충분하다고 판단하여 과감히 생략함

# 10. [Chapter 09] Smart Contracts & Security
지나치게 개발과 보안적인 내용이라고 판단하여 과감히 생략함

# 11. [Chapter 10] Tokens

**ETH vs Token 잔액 비교**
* 이더리움 계정의 ETH 잔액은  **프로토콜 수준**에서 처리되는 반면,
* 이더리움 계정의 Token 잔액은  **컨트랙트 수준**에서 처리된다.
* 따라서 이더리움 프로토콜은 Token에 대해 아무것도 모른다.

이더리움에서 새 Token을 만들려면 새로운 컨트랙트를 만들어야 한다. 배포된 컨트랙트는 Token의 소유권, 이전 및 접근 권한을 포함한 모든 것을 처리한다.

## **ERC20 Tokens**

ERC20을 준수한 토큰 컨트랙트는 최소한 다음 Function & Events를 제공해야 한다.

```javascript
// 필수 Functions

function totalSupply()
   // 현재 존재하는 이 토큰의 전체 개수를 리턴한다. (ERC20 토큰의 공급량은 고정 or 가변)
function balanceOf(account)
   // 해당 주소의 토큰 잔액을 리턴한다.
function transfer(to, amount)
   // 해당 주소로 주어진 금액의 토큰을 전송한다. 그리고 성공 여부를 bool로 리턴한다.
function approve(spender, amount)
   // 해당 주소로 주어진 최대 금액까지 여러 번 송금할 수 있도록 승인한다. 그리고 성공 여부를 bool로 리턴한다.
function transferFrom(from, to, amount)
   // 보내는 주소에서 받는 주소로 주어진 금액의 토큰을 전송한다. 보내는 주소로부터 approve를 받은 상태에서 최대 금액까지 가능하다. 그리고 성공 여부를 bool로 리턴한다.
function allowance(owner, spender)
   // approve로 승인된 주소에서 송금할 수 있는 잔액을 리턴한다.

// 필수 Events

event Transfer(from, to, value)
   // transfer나 transferFrom이 성공되면 Transfer 이벤트가 트리거된다.
event Approval(owner, spender, value)
   // approve가 성공되면 Approval 이벤트가 트리거된다.

// 선택 Functions

function name()
   // 토큰의 이름을 리턴한다.
function symbol()
   // 토큰의 심볼을 리턴한다.
function decimals()
   // 토큰을 나눌 수 있는 소수 자릿수를 리턴한다.
```
> 작성자: Joshua

ERC20 컨트랙트는 2개의 데이터 구조를 포함하고 있다.
* (1) 잔고 추적하기 (**balance**)
* (2) 허용량을 추적하기 (**approve**)

**approve → transferFrom**  구조는 거래소에서 사용할 수 있다.
* 예를 들어, 회사가 ICO를 위해 토큰을 판매하는 경우, 크라우드세일 컨트랙트를 approve할 수 있다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/josh-ico-1.webp)
> 작성자: Joshua

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/josh-ico-2.webp)
> 작성자: Joshua

일반적으로 컨트랙트의  `transfer(from, to, 100 JOSH)`를 실행할 때, 받는 주소를 컨트랙트 자체의 주소로 입력할 경우 토큰이 영원히 갇혀 손실된다.
* 이를 해결할 수 있는 유일한 방법은 해당 컨트랙트가  **approve & transferFrom**  워크플로 함수를 통해 보내는 주소가 transferFrom을 사용하여 반환하도록 하는 코드도 내장된 상태가 되어야 하는 것이다. 물론, 이는 보내는 주소의 지갑 앱이 transferFrom 함수 호출 기능을 보유해야 한다.

토큰 전송에서 트랜잭션이 토큰 수신자에게 실제로 보내는 것이 아니다. 대신, 받는 사람의 주소가 토큰 컨트랙트 자체의 맵에 추가된다.

**상태 변경**
* ETH를 주소로 보내는 트랜잭션: 주소의 상태를 변경
* 토큰을 주소로 전송하는 트랜잭션: 토큰 컨트랙트의 상태를 변경 (주소의 상태는 변경하지 않는다.)

**ERC20 토큰의 문제점**
* ERC20 토큰을 지원하는 지갑조차도 사용자가 토큰 컨트랙트를 명시적으로 추가하지 않는 한 토큰 잔액을 인식하지 못한다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/metamask.webp)
> 메타마스크가 토큰 컨트랙트를 매핑하지 않은 상태에서는 최종 사용자가 직접 Import Tokens를 통해 추가해줘야 한다. (출처: Metamask Chrome Extension)

* 거래소를 통해 ETH를 ERC20 토큰으로 교환할 때는 송금 대상과 수수료 대상이 모두 ETH였는데, ERC20 토큰을 ETH로 교환할 때는 송금 대상과 수수료 대상이 서로 달라진다. 이는 UX 측면에서 불편함이 해소되어야 하는 부분이다.

## ERC223 Tokens

ERC223은 tokenFallback 함수를 통해 목적지 주소를 컨트랙트로 설정하여 잘못 송금하는 경우의 문제를 해결하고자 제안된 표준이다.

## ERC721 Tokens

ERC721은 증서(deed)로도 알려진 대체할 수 없는(non-fungible) 토큰에 대한 표준을 위한 것이다.

ERC721 표준은 증서에 의해 그 소유권이 고유하게 추적될 수 있는 한, 그 대상의 종류에 대해 제한이나 규정을 두지 않으며, 이러한 추적은 256bit 식별자에 의해 이루어진다.

**ERC20 vs. ERC721 비교**

| **구분** | **ERC20** | **ERC721**
| - | - | -
| **기본 Mapping Key** | address | 증서(deed) ID
| **추적 대상** | 각 address의 잔액 | 증서 ID와 owner's address

> 작성자: Joshua

**ERC721 컨트랙트의 Interface 필수 사양 & 선택 사양**

* 필수 사양 = ERC165

```javascript
// 필수 Functions (ERC165)
balanceOf(owner)
   // 특정 주소가 소유한 증서의 개수를 리턴한다.
ownerOf(tokenId)
   // 특정 증서의 소유자 주소를 리턴한다.
transfer(to, tokenId)
   // 특정 증서를 해당 주소로 전송한다. payable 상태가 리턴된다.
approve(to, tokenId)
   // 해당 주소가 특정 증서를 사용할 수 있도록 승인한다. payable 상태가 리턴된다.
setApprovalForAll(operator, approved)
   //  해당 주소로 모든 증서를 사용할 수 있도록 승인한다. payable 상태가 리턴된다.
transferFrom(from, to, tokenId)
   // 보내는 주소에서 받는 주소로 특정 증서를 전송한다. 보내는 주소로부터 approve를 받은 경우에만 가능하다. 그리고 payable 상태가 리턴된다.
supportsInterface(interfaceId)
   // Interface 검증을 할 수 있다. 해당 interface 지원 여부를 bool로 리턴한다.

// 필수 Events (ERC165)
event Transfer(from, to, tokenId)
   // transfer나 transferFrom이 payable 되면 Transfer 이벤트가 트리거된다.
event Approval(owner, approved, tokenId)
   // approve가 payable 되면 Approval 이벤트가 트리거된다.
event ApprovalForAll(owner, operator, approved)
   // setApprovalForAll이 payable 되면 ApprovalForAll 이벤트가 트리거된다.
```

> 작성자: Joshua

* 선택 사양

```javascript
// 선택 Functions (메타데이터) (ERC721)
function name()
   // 본 컨트랙트의 이름을 리턴한다.
function symbol()
   // 본 컨트랙트의 심볼을 리턴한다.
function tokenUri(tokenId)
   // 해당 증서에 연결된 메타데이터 주소인 URI를 리턴한다.

// 선택 Functions (증서 및 소유자 열거) (ERC721)
function totalSupply()
   // 현재 존재하는 증서의 전체 개수를 리턴한다.
function tokenByIndex(index)
   // 해당 index에 위치하는 증서의 ID를 리턴한다.
function countOfOwners()
   // 현재 존재하는 소유자 주소의 전체 개수를 리턴한다.
function ownerByIndex(index)
   // 해당 index에 위치하는 증서의 소유자 주소를 리턴한다.
function tokenOfOwnerByIndex(owner, index)
   // 해당 index에 위치하는 증서와 소유자 주소를 통해 증서의 ID를 리턴한다.
```

> 작성자: Joshua

**토큰 표준의 목적**
* 컨트랙트 간의 상호운용성(Interoperability)을 장려하는 것이다.
* 즉, ERC20 표준을 따르는 컨트랙트를 배포하면 기존 지갑 사용자는 지갑을 업그레이드하는 노력을 들이지 않고도 토큰을 원활하게 전송할 수 있다.

# 12. [Chapter 11] Oracles

합의를 유지하기 위해서 EVM 실행은 완전히 결정론적이고, 이더리움 상태와 서명된 트랜잭션의 공유 컨텍스트에 기반을 두고 있어야 한다.
* (1) EVM 및 스마크 컨트랙트는 임의성을 위한 고유한 소스가 없다.
* (2) 외부 데이터는 트랜잭션의 데이터 payload로서만 유입될 수 있다.

예를 들면, EVM이 스마트 컨트랙트에 Random Function의 사용을 금지하는 맥락은 대강 그림과 같다.

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/random-function.webp)
> 작성자: Joshua

오라클은 이상적으로 스마트 컨트랙트를 위해 이더리움 플랫폼으로 축구 경기의 결과나 금 가격 혹은 순수 난수와 같은 외부 (Off-chain) 정보를 가지고 오는 데 Trustless 방법을 제공한다.

**오라클의 핵심 디자인**
* (1) Off-chain 소스에서 데이터를 수집하고,
* (2) 이 데이터를 Signed Msg로 On-chain에 전송하고,
* (3) 이를 컨트랙트의 Storage에 저장하여 사용한다.

## **오라클 설정하는 세 가지 방법**

**(1) 즉시 읽기**
* 즉시 읽기 방식의 오라클은 ‘[http://ethereumbook.info](http://ethereumbook.info/)의 주소는 무엇인가?’ 또는 ‘이 사람은 18세 이상인가?’와 같은 즉각적인 결정이 필요한 데이터만을 제공한다.
* 이런 종류의 오라클은 컨트랙트 Storage에 데이터를 저장하고, 다른 컨트랙트는 오라클 컨트랙트에 요청을 해서 이러한 데이터를 검색할 수 있다. 그리고 이 데이터는 업데이트될 수도 있다.
* 오라클 Storage에 있는 데이터는 dApp에 의해 직접 조회될 수 있기 때문에 번거로운 절차나 트랜잭션을 처리하는 Gas Fee가 필요하지 않다.
* 이 저장된 데이터는 효율성이나 프라이버시 때문에 Raw Data가 아닌, 머클 트리에서 Hashing된 Root Hash를 저장하는 것으로 충분할 수 있다.

**(2) 게시-구독**
* 게시-구독 방식의 오라클은 값의 업데이트가 빈번한 데이터를 효과적으로 브로드캐스트하는 역할로 제공한다.
* 이 데이터는 온체인 컨트랙트에 의해 polling되거나 업데이트를 위한 Off-chain 데몬에 의해 모니터링된다.
* 즉, 오라클이 새로운 데이터로 업데이트되면, 새로운 데이터를 쓸 수 있음을 구독자들에게 알린다.
* Polling이 컨트랙트로부터 수행되어야 하는 경우 상당한 Gas Fee가 발생할 수 있다.

**(3) 요청-응답**
* 요청-응답 방식의 오라클은 컨트랙트에 저장하기에는 데이터가 너무 크고, 사용자는 그 중 일부의 데이터만 필요하는 경우에 사용된다.
* 요청-응답 방식은 그림과 같이 여러 단계에 걸친 비동기 프로세스이다.

```plain
# 요청-응답 방식 오라클의 프로세스
   (1) 오라클 CA가 dApp으로부터 질의(query)를 받는다.
   (2) 오라클 CA는 해당 질의를 분석한다.
   (3) 오라클 CA는 dApp의 비용 지불 여부와 접근 권한 등을 확인한다.
   (4) 오라클 CA는 Off-chain 소스에서 관련 데이터를 검색한다.
   (5) 오라클 CA는 검색된 데이터가 포함된 TX에 Sign한다.
   (6) 오라클 CA는 Signed TX를 네트워크로 전파한다.
   (7) 알림 등 필요한 추가 TX를 스케줄링한다.
```
> 작성자: Joshua

## 계산 오라클

지금까지는 데이터를 요청하고 전달하는 맥락의 오라클이었다면, 계산 오라클은 On-chain에서 실행 불가능한 계산을 리턴하는 데 사용할 수 있다.
* 예를 들면, 계산 오라클을 통해 회귀 계산이나 머신러닝을 수행하여 채권 컨트랙트의 수익률을 추정할 수 있다.
* 중앙화된 데이터 또는 계산 오라클은 이더리움 네트워크에서는 단일 실패 지점(SPOF)이 된다.

**계산 오라클 문제의 개선 방법: 탈중앙화 오라클**
* 탈중앙화 오라클은 데이터 가용성을 보장하고 On-chain 데이터 Aggregation 시스템을 갖춘 개별 데이터 제공자의 네트워크를 만드는 수단이다.
* **체인링크**: 평판 CA, 오더매칭 CA, Aggregation CA라는 3가지 핵심 컨트랙트와 데이터 공급자의 Off-chain 레지스트리로 구성된 탈중앙화 오라클 네트워크이다.
* **Aggregation CA**: 여러 오라클로부터 응답을 수집하고, 최종 결과를 계산하여, 그 결과를 피드백해준다.
* Aggregation을 위한 함수를 공식화하는 것이 가장 어려운 문제인데, 값의 분포를 통한 penalizing, median 등 다양한 집계 방법들이 있다.

# 13. [Chapter 12] Decentralized Applications (dApps)

dApp은 대부분 또는 완전히 탈중앙화된 애플리케이션이다. 션실적으로 이더리움 생태계에서 완전히 탈중앙화된 앱은 매우 드물다. 대부분 중앙화된 서비스와 서버를 사용하는 형태의 dApp이다.

**전형적인 중앙화된 아키텍처와 대비하여 dApp이 가진 장점**
* `지속성`
* `투명성`
* `검열저항성`

## 애플리케이션이 탈중앙화될 수 있는 측면들

**(1) 백엔드: 스마트 컨트랙트**
* 앱의 백엔드 혹은 서버 구성요소를 스마트 컨트랙트로 대체할 수 있다. 물론, 컨트랙트의 실행 비용이 매우 비싸기 때문에 최소한의 부분만 대체하는 것이 좋다.
* 컨트랙트가 배포된 후 코드를 변경할 수 없다.  **SELFDESTRUCT**  연산코드가 프로그래밍된 경우완전히 제거하는 것 외에는 코드 자체를 수정할 수 없다.

**(2) 프론트엔드: 웹 UI**
* dApp 클라이언트 쪽 인터페이스는 HTML/CSS/JS를 사용할 수 있다. 메시지 서명, TX 전송, 키 관리 같은 이더리움과의 상호작용은 Metamask 같은 익스텐션을 통해 웹 브라우저에서 수행된다.

**(3) 데이터 스토리지**
* 높은 Gas Price와 낮은 Block Gas Limit 때문에 컨트랙트는 많은 양의 데이터를 저장하거나 처리하는 데 적합하지 않다.
* 따라서 대부분의 dApp은 Off-chain 데이터 스토리지 서비스를 사용하는데, 사이즈가 큰 데이터들을 이더리움 체인으로부터 데이터 스토리지 플랫폼으로 옮겨 저장한다.
* 클라우드 처럼 중앙화된 방식, 혹은 IPFS나 이더리움의 Swarm 같은 탈중앙화된 방식
* **IPFS(Inter-planetary File System)**: 저장된 객체를 P2P 네트워크 내 Peer들에게 배포하는 content-addressable 스토리지 시스템이다.
* content-addressable이란, 각 파일이 hashing되고, 그 hash를 통해 해당 파일을 식별할 수 있음을 의미한다. 즉, hash로 요청하여 모든 IPFS 노드에서 파일을 검색할 수 있다.
* **Swarm**: IPFS와 유사한 content-addressable P2P 스토리지 시스템이다.

**(4) 메시지 통신**
* 앱 간, 앱 내 인스터스 간, 혹은 앱 사용자 간의 메시지를 교환하기 위해 여러 가지 탈중앙화 프로토콜을 사용할 수 있다.
* 대표적으로 Go-ethereum의 일부 도구인 Whisper

**(5) 네임 레졸루션 (Name Resolution)**
* ENS(Ethereum Name Service)

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/ens.webp)
> [Source](https://docs.ens.domains/)

**경매 dApp의 아키텍처 운용 사례**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/auction-dapp.webp)
> 작성자: Joshua

**경매 dApp의 주요 구성요소**
* ERC721 컨트랙트
* 경매 컨트랙트
* Vue JS 프레임워크를 사용하는 Web Frontend
* 이더리움에 연결하는 web3.js 라이브러리
* 데이터 스토리지인 Swarm 클라이언트
* 경매 대화방을 위한 Whisper 클라이언트

**경매 dApp을 더 탈중앙화하기 위한 방법은 크게 두 가지**
* 모든 애플리케이션 소스코드를 Swarm이나 IPFS에 저장한다.
* ENS를 사용하여 Name을 참조하여 dApp에 접근한다.

**dApp 거버넌스는 크게 두 가지 옵션 중 하나를 선택하여 배포할 수 있다.**
* dApp의 컨트랙트에 대한 특정 통제권을 지닌 EOA가 있는 경우
* dApp의 컨트랙트에 대한 특정 통제권을 지닌 EOA가 없는 경우

dApp을 구축할 때 컨트랙트를 완전히 독립적으로 만들고 출시한 후에 제어할 권한을 없게 만들든지 또는 특권 계정을 만들고 위험에 노출될 위험을 감수해야 하는지를 결정해야 한다.
* 하지만 장기적으로 진정한 dApp은 특권 계정을 위한 특수 접근 권한을 허용하지 말아야 한다. 왜냐하면 그것은 탈중앙화된 것이 아니기 때문이다.

## ENS (Ethereum Name Service)

전통적인 인터넷에서 DNS(Domain Name System)는 브라우저에서 사람이 읽을 수 있는 이름을 사용할 수 있게 해준다. 이더리움 블록체인에서는 ENS(Ethereum Name Service)가 이와 같은 문제를 탈중앙화된 방식으로 풀어준다.
* 이더리움 재단의 기부 주소  **0xfB6916…d359**: ENS를 지원하는 지갑에서는 간단하게  **ethereum.eth**
* Name의 등록, 관리, 그리고 경매를 위한 여러 dApp이 ENS 기능을 지원

**ENS의 개선 제안 3가지**
* ENS의 기본 기능 정의한 EIP-137
* `.eth` 루트의 경매 시스템을 설명한 EIP-162
* 주소의 역 등록을 지정한 EIP-181

**ENS는 다음 그림과 같이 ‘샌드위치’ 디자인 철학**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/ens-sandwich.webp)
> 작성자: Joshua

**맨 아래 계층 (EIP-137)**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/eip-137.webp)
> 작성자: Joshua

Namehash 알고리즘
* 어떤 이름이라도 그 이름을 식별하는 해시로 변환할 수 있는 Recursive 알고리즘
* 즉, Namehash는 재귀적으로 이름의 각 구성요소를 해시하여 유효한 입력 도메인에 대한 고유한 고정 길이 문자열(또는 node)을 생성한다.
* 재귀성이 중요한 이유는 각 name이 서브도메인을 무한히 가질 수 있는데, 이를 반복적으로 재계산하려면 Gas Fee가 많이 소요되므로, 루트 도메인의 node 값을 미리 컨트랙트에 삽입하여 계산 효율성을 갖추기 위한 것이다.
* 위 그림에서 node는 Namehash 알고리즘에 의해 변환된 hash를 의미한다.

resolver 컨트랙트
* 앱과 관련된 Swarm 주소, 앱에 지불할 주소나 앱의 Hash와 같은 이름에 대한 질문에 답변할 수 있는 사용자 생성 컨트랙트이다.

**중간 계층 (EIP-162)**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/eip-162.webp)
> 작성자: Joshua

**최상위 계층 (EIP-181)**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/eip-181.webp)
> 작성자: Joshua

**ENS에서 이름을 확인하는 과정**
* (1) 해석하고 싶은 이름을 통해 ENS Registry가 호출된다.
* (2) 레코드가 존재하면 ENS Registry는 resolver의 주소를 리턴한다.
* (3) 해당 주소의 resolver는 요청된 자원에 적절한 method를 통해 호출된다.
* (4) resolver는 원하는 결과를 리턴한다.

이 프로세스는 resolver의 기능을 naming system 자체와 분리하여 더 많은 유연성을 얻을 수 있다는 이점이 있다. 즉, ENS의 향후 확장하기 용이한 것이다.

**경매 dApp을 완전히 탈중앙화된 상태일 때 아키텍처 사례**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/dapp-browser.webp)
> 작성자: Joshua

# 14. [Chapter 13] Ethereum Virtual Machine (EVM)

EVM은 마이크로소프트의 .NET 프레임워크 VM이나 Java와 같은 Bytecode 컴파일된 프로그래밍 언어의 Interpreter와 비슷한 역할을 하는 계산 엔진이다.

EVM은 스마트 컨트랙트 배포 및 실행을 처리하는 이더리움의 일부다.
* EOA to EOA로의 간단한 값을 전송하는 TX는 사실상 EVM이 필요 없지만, 그 외 모든 것은 EVM에 의한 상태 업데이트를 수반한다.

EVM은 유사 튜링 완전 상태 머신(quasi-Turing-complete state machine)이다.
* 이것은 스마트 컨트랙트 실행에 사용할 수 있는 가스량에 따라 모든 실행 프로세스가 유한 개의 계산 단계로 제한된다는 것을 의미한다.

EVM은 메모리 내의 모든 값을 스택에 저장하는 스택 기반 아키텍처다.
* 256bit의 단어 크기로 동작하며, 주소 지정이 가능한 여러 개의 데이터 구성요소를 가지고 있다.

**EVM의 구성요소**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/evm-architecture.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

* (1) 실행할 컨트랙트의 bytecode가 저장되는 불변 프로그램 코드 ROM
* (2) 모든 위치가 0으로 초기화된 휘발성 메모리
* (3) 이더리움 상태의 일부인 영구 스토리지 (0으로 초기화됨)

EVM은 실행 순서가 외부에서 구성되기 때문에 스케줄링 기능이 없다.
* 즉, 이더리움 클라이언트가 검증된 블록의 트랜잭션을 통해 어떤 스마트 컨트랙트가 어떤 순서로 실행되어야 하는지를 결정한다.
* 이러한 의미에서 이더리움 월드 컴퓨터는 JS처럼 단일 스레드다.

**EVM 아키텍처와 실행 컨텍스트**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/evm-architecture-context.webp)
> 작성자: Joshua

EVM은 일반적인 Bytecode 연산 작업 외에도 계정 정보(address, balance 등) 및 블록 정보(block number, current gas price 등)에 접근할 수도 있다.

EVM의 작업은 스마트 컨트랙트 코드의 실행 결과로 유효한 상태 변화를 계산하여 이더리움 상태를 업데이트 하는 것이다.
* 이러한 측면에서 이더리움을  **transaction-based state machine**으로 설명
* 외부 주체(즉, EOA 및 Miner)가 TX 생성, 수락 및 주문을 통해 상태 변화를 시작

이더리움 상태의 가장 상위 레벨에는  **World State**가 있다.
* World State는 이더리움 주소(160bit)를 Account에 매핑한 것
* 각 이더리움 주소는 ETH balance, nonce, account storage, programming code를 의미

**이더리움 주소의 Nonce**
* EOA일 경우: 성공적으로 전송한 TX의 수
* CA일 경우: 생성된 컨트랙트의 수

**EOA에는 storage가 비어 있고, programming code가 없다.**

![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/eoa-ca.webp)
> [Source](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

**TX가 스마트 컨트랙트 코드를 실행하면:**
* EVM은 생성 중인 현재 블록 및 처리 중인 특정 TX와 관련하여 필요한 모든 정보로 instance화 된다.
* TX가 컨트랙트 코드를 실행하다가 어떤 시점에서 가스 부족(Out of Gas) 예외가 발생하면 실행이 즉시 중단되고 TX가 중단된다.
* 이더리움 상태는 변경되지 않으며, 단지 TX 발신자의 nonce가 증가되고 중단시점까지 코드를 실행하는 데 사용된 가스 만큼 ETH 잔액이 줄어든다.

**정지 문제 (halting problem)**
* 어떠한 스케줄러 없이 단일 스레드 머신처럼 동작하는 이더리움에게 매우 중요한 문제다.
* 그러나 가스를 사용하면 해결 방법이 생긴다.
* 미리 지정된 최대 계산량을 수행한 후에 실행이 종료되지 않는다면 프로그램 실행은 EVM에 의해 중단된다.
* 이렇게 하면 EVM이 유사(quasi) 튜링 완전 머신이 된다.
* 즉, 프로그램이 특정 계산량 내에서 종료되는 경우에만 프로그램을 실행할 수 있다.

**가스 (Gas)**
* 이러디움에서는 Block Gas Limit까지 프로그램을 실행할 수 있는데, 고정되어 있지 않기 대문에 시간이 지남에 따라 Limit을 늘리는 것에 동의할 수도 있다.
* 가스는 이더리움 블록체인에서 작업을 수행하는 데 필요한 계산 및 스토리지 자원을 측정하는 이더리움의 단위다.
* 비트코인은 KB 단위의 TX 크기만 고려하여 TX Fee를 측정하지만, 이더리움은 TX 및 컨트랙트 코드 실행에 의해 수행되는 모든 계산 단계를 고려한다.

**가스의 역할**
* (1) 이더리움의 가격 방어 수단 역할
* (2) 채굴자에 대한 보상 버퍼 역할
* (3) DoS 공격에 대한 방어 수단 역할 (따라서 공격자가 스팸 TX를 보내지 못하게 한다.)

**가스 계산**

```plain
   채굴 비용 = Gas Used * Gas Price
   잔여 가스 = Gas Limit * Gas Used
   환불 ETH = 잔여 가스 * Gas Price
```
> 작성자: Joshua

* 새로운 블록을 만들 때 이더리움 네트워크에 있는 채굴자들은 pending TX들 중에서 더 높은 Gas Price를 지불하려는 TX를 선택할 수 있다.
* 따라서 더 높은 Gas Price를 제공하면 굴자에게 TX를 포함하고 더 빨리 확인하도록 유도할 것이다.

**Negative Gas**
* 이더리움은 컨트랙트 실행 중에 사용된 Gas 중 일부를 환불함으로써 사용된 저장 변수 및 계정을 삭제하도록 권장한다.
* 환불 메커니즘의 악용을 피하기 위해 최대 환불액은 사용된 총 가스량의 50%로 설정된다.

```plain
   1. 컨트랙트를 삭제(SELFDESTRUCT)하면 24,000 Gas의 환급 가치가 있다.
   2. 0이 아닌 값에서 0으로 저장 주소를 변경하면 15,000 Gas의 환급 가치가 있다.
```
> 작성자: Joshua

**Block Gas Limit**
* 블록의 모든 TX에서 소비될 수 있는 가스의 최대량이며, 한 블록에 들어갈 수 있는 TX 건수를 제한함
* 채굴자가 현재 Block Gas Limit을 초과하는 가스가 필요한 TX를 포함하려 한다면, 그 블록은 네트워크에 의해 거절됨
* 대부분의 이더리움 클라이언트는 “tx exceeds block gas limit”의 경고를 통해 그러한 TX를 하지 못하게 할 것임
* Block Gas Limit은 네트워크의 채굴자들이 집합적으로 결정함
* 이더리움 프로토콜에는 채굴자가 Gas Limit에 투표할 수 있는 메커니즘이 내장되어 있어 이후 블록에서 용량을 늘리거나 줄일 수 있음
* 각 채굴자들은 +/- 어느 방향으로든 1/1,024 (0.0976%)의 비율로 Block Gas Limit을 조정하기 위해 투표할 수 있음


![]({{ site.baseurl }}/assets/2023-12-05-mastering-ethereum/etherscan-average-gas-limit.webp)
> [Source](https://etherscan.io/chart/gaslimit)

# 15. [Chapter 14] Consensus

**합의 (Consensus)**
* 분산 시스템에서 각기 다른 참여자가 한 시스템의 전 체 상태에 모두 동의하여 동기화하기 위한 것
* 신뢰할 수 있는 중재인이 없으면 다른 방법을 사용하여 불일치, 기만 또는 차이점을 해결해야 하는데, 합의 알고리즘은 보안 및 탈중앙화를 해결하는 데 사용되는 것

**비트코인의 PoW 합의 알고리즘**
* 가능한 한 많은 참가자로부터 탈중앙화된 시스템에 대한 통제권을 유지하며 블록체인을 보호하는 목적을 지니고 있다.

**이더리움의 PoW 알고리즘**
* Ethash라고 부르는데, 비트코인의 PoW 알고리즘과는 약간 다르다.
* 방향성 비순환 그래프(Directed Acyclic Graph, DAG)로 알려진 대규모 데이터 세트의 생성 및 분석에 의존함
* 이더리움 PoW에는  **난이도 폭탄(Difficulty Bomb)**이라는 핸디캡이 있으며, 이는 이더리움 채굴을 점차 어렵게 만들어서 PoW에서 PoS로의 전환을 강요하고 있다.
* 이더리움의 계획된 PoS 알고리즘은  **Casper**라고 불리며, Casper를 도입하려는 시도는 여러 번 연기되어, 난이도폭탄을 완화하고 강제로 연기시키는 개입이 필요했다.

**방향성 비순환 그래프 (Directed Acyclic Graph, DAG)**
* DAG의 목적: 자주 접근하는 대규모 데이터 구조를 유지하는 데 필요한 Ethash PoW 알고리즘을 만드는 것
* 이는 Ethash가 ASIC 저항성을 갖게 만들려는 것으로, 고속 GPU보다 훨씬 빠른 주문형 반도체(ASIC) 채굴 장비를 만들기가 더 어려워진다는 의미
* 즉, 제조 공장 및 대규모 예산에 접근할 수 있는 사람들이 채굴 인프라를 지배하고 합의 알고리즘의 보안을 훼손할 수 있는 PoW 채굴의 중앙 집중화를 피하고자 한 것

**PoS 알고리즘**

1. 블록체인은 Validator 집합을 유지하며, 블록체인의 기본 암호화폐(ETH)를 보유한 사람은 ETH를 컨트랙트에 예치시키는 특별한 유형의 TX를 보냄으로써 Validator가 될 수 있다.
2. Validator는 유효한 다음 블록에 대해 제안하고  투표하는 순서를 따르며, 각 Validator의 투표 중요도는 보증금(지분)의 크게 따라 다르다.
3. 특정 Validator가 보유한 블록이 대다수의 Validator에 의해 거부된다면 보증금을 잃을 위험이 있다.
4. 반대로, 대다수의 Validator가 수락한 모든 블록에 대해 누적된 보증금에 비례하여 작은 보상을 얻는다.
5. 따라서 PoS는 Validator에게 보상 및 처벌 제도에 따라 정직하게 행동하고 합의 규칙을 따르도록 한다.
6. PoW에서는 처벌이 외적(전기 사용에 따른 자금 손실)이라면, PoS에서 처벌은 처벌이 내재적(지분 손실)인 것이다.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)