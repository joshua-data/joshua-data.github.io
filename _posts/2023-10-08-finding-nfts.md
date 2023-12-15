---
layout: post
title: "Finding all NFTs (ERC721) held by an address (feat. Dune Analytics)"
tags:
  - Blockchain
  - On-chain Data
  - SQL
---

> Embark on a journey through blockchain data with Joshua. Explore the intricacies of smart contracts, ERC721, and data analysis techniques. Joshua's expertise shines as he guides you through interpreting transfer events using tools like Dune Analytics. Don't miss the case study featuring Binance 7 EOA addresses. Verify insights with Etherscan for a deeper understanding of on-chain data architecture.

<iframe src="https://www.youtube.com/embed/Z1hwVUyR6Ic?si=-yfpWfDDFOZ6onSl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
> Presentation Video

### CONTENTS
1. Contract = Functions + Events
2. ERC721 Interface
3. Summary: From Collecting Transfer Events To Calculating Wallet Balance
4. Step by Step
	* 4.1️. Collect All Transfer Events.
	* 4.2️. Filter Out the Most Recent Transfer Events for Each Token.
	* 4.3. Filter the Results to Show Only Those Related to the Specific Address.
	* 4.4️. Determine the Acquisition Price of the Tokens and Label the Contracts.
5. Case Study
6. References

---

# 1. Contract = Functions + Events

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/flowchart.webp)

### `Functions`
When you call a `function`:
* 1. it returns a value, or
* 2. it trigers an event. (= emits an event.)

### `Events`
WHen an `event` is emitted:
* 1. it creates and. broadcasts a TX message, then
* 2. the TX message leads to state change of Ethereum.

# 2. ERC721 Interface

### `Functions`
```python
def balanceOf(owner):  
    return "Number of Tokens held by the Owner's Account"  
def ownerOf(tokenId):  
    return "Owner's Address holding the Token"  
def transferFrom(from, to, tokenId):  
    emit Transfer  
def approve(to, tokenId):  
    emit Approval  
...
```

### `Events`
```python
event Transfer(from, to, tokenId):  
    #  "tokenId" token is transferred from "from" to "to".  
event Approval(owner, approved, tokenId):  
    # "owner" enables "approved" to manage the "tokenId" token.  
...
```

# 3. Summary: From Collecting Transfer Events To Calculating Wallet Balance

### Collect All Events Involving  `David`.

**Transfer Event #1:**
* from = “Joshua”
* to = “David”
* tokenId = `1234`

**Transfer Event #2:**
* from = “Angela”
* to = “David”
* tokenId = `5678`

**Transfer Event #3:**
* from = “David”
* to = “Angela”
* tokenId = `1234`

### Then Sum Up All the Events to Determine Wallet Balance.

**Tokens List "David" currently owns:**
* tokenId = `5678`

# 4. Step by Step

## 4.1️. Collect All Transfer Events.

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/erc721-evt_Transfer.webp)
> Dune Analytics

```sql
WITH  
CTE_all_transfers AS (  
    SELECT  
        contract_address,  
        tokenId,  
        evt_tx_hash,  
        "to",  
        ROW_NUMBER() OVER (  
            PARTITION BY contract_address, tokenId  
            ORDER BY evt_block_number DESC, evt_index DESC  
        ) AS recent_idx  
    FROM  
        erc721_ethereum.evt_Transfer  
    WHERE  
        contract_address IS NOT NULL  
),
```

**Query Results**

| **contract_address** | **tokenId** | **evt_tx_hash** | **to** | **recent_idx**
|-|-|-|-|-
|`0x0000...8e25`|106|`0xc8c0...4e4c`|`0x826e...1ff3`|2
|`0x0000...8e25`|113|`0xcd01...66a2`|`0xc412...0620`|2
|`0x0000...8e25`|118|`0x28dd...6e20`|`0x4d98...e5a8`|2
|`0x0000...b183`|3|`0xd503...672a`|`0x8636...a5e9`|2
|`0x0000...b183`|13|`0x3cc9...4121`|`0x47a1...c78a`|2

## 4.2️. Filter Out the Most Recent Transfer Events for Each Token.
> So that we can see who owns the tokens at the moment!

```sql
CTE_last_transfers AS (  
    SELECT  
        *  
    FROM  
        CTE_all_transfers  
    WHERE  
        recent_idx = 1  
),
```

**Query Results**

| **contract_address** | **tokenId** | **evt_tx_hash** | **to** | **recent_idx**
|-|-|-|-|-
|`0x0000...8e25`|0|`0xfa58...164a`|`0x0000...5e92`|1
|`0x0000...8e25`|1|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|2|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|3|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|4|`0x0595...c802`|`0x0000...5e92`|1

## 4.3. Filter the Results to Show Only Those Related to the Specific Address.
> So that we can see all the tokens that the address owns at the moment.

```sql
CTE_last_transfers_cohort AS (  
    SELECT  
        *  
    FROM  
        CTE_last_transfers  
    WHERE  
        "to" = {{address}}  
),
```

**Query Results**

| **contract_address** | **tokenId** | **evt_tx_hash** | **to** | **recent_idx**
|-|-|-|-|-
|`0x0000...8e25`|0|`0xfa58...164a`|`0x0000...5e92`|1
|`0x0000...8e25`|1|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|2|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|3|`0x0595...c802`|`0x0000...5e92`|1
|`0x0000...8e25`|4|`0x0595...c802`|`0x0000...5e92`|1

## 4.4️. Determine the Acquisition Price of the Tokens and Label the Contracts.

**Determine the Acquisition Price of the Tokens.**

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/flowchart.webp)

* **JOIN `hash` with `evt_tx_hash` and SELECT `value`.**

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/ethereum.transactions.webp)
> Dune Analytics

**Label the Contracts.**

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/label-the-contracts.webp)
> Dune Analytics

* **JOIN `contract_address` with `contract_address` and SELECT `name`.**

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/tokens.nft.webp)
> Dune Analytics

**Final Query to Wrap Up**

```sql
CTE_summary AS (  
    SELECT  
        LABELS.name,  
        TRANSFERS.contract_address,  
        TRANSFERS.tokenId,  
        TXS.value / 1e18 AS acquisition_cost  
    FROM  
        CTE_last_transfers_cohort TRANSFERS  
    LEFT JOIN  
        ethereum.transactions TXS  
        ON TRANSFERS.evt_tx_hash = TXS.hash  
    LEFT JOIN  
        tokens.nft LABELS  
        ON TRANSFERS.contract_address = LABELS.contract_address  
            AND LABELS.blockchain = 'ethereum'  
)
SELECT
    *
FROM
    CTE_summary
;
```

# 5. Case Study

### `Binance 7`  EOA Address
> ☎️ `0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8`

### Query Results

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/query-results.webp)
> 🟠  [dune.com/joshua_web3](https://dune.com/joshua_web3/blpas-sample-dashboard?address_t7a5e7=0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8)

### Check it out with  `Etherscan`  just in case it’s not been correctly queried.

* Holders of  `Documenta X by Vuk Cosic`

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/etherscan-documenta.webp)
> Etherscan

* Holders of  `New World Babies`

![]({{ site.baseurl }}/assets/2023-10-08-finding-nfts/etherscan-new-world-babies.webp)
> Etherscan

# 6. References

* [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)  
* [Dune Dashboard](https://dune.com/joshua_web3/blpas-sample-dashboard?address_t7a5e7=0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8)  (created by Joshua)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)