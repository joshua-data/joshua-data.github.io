---
layout: post
title: "Intro to Encoding & Decoding Ethereum Contract Functions"
tags:
  - english
  - blockchain
  - on_chain_data
  - sql
---

> In this article, I will briefly explore the Ethereum ABI Specification and show you how to decode contract functions when conducting on-chain data analysis. Additionally, I will demonstrate a simple data extraction and analysis case about “Who are the Top 10 Recipients of USDT approve Functions?” using DuneSQL while handling ABIs.

### CONTENTS
1. Argument Types Key Content
	* 1.1. Elementary Types
	* 1.2. Fixed-size Types
	* 1.3. Dynamic-size Types
2. Key Points of Argument Padding to 32 Bytes Rules
3. A Contract Example
	* 3.1. How to Call `baz(uint32 x, bool y)`
	* 3.2. How to Call `bar(bytes3[2])`
	* 3.3. How to Call `sam(bytes, bool, uint[])`
4. Case Study: Who are the Top 10 Recipients of USDT `approve` Functions?
	* 4.1. Function Selector
	* 4.2. Extract only the transactions that have called the `approve` function on the USDT Contract.
	* 4.3. Extract the first argument value, `address`, from the functions.
	* 4.4. Now, aggregate the number of unique addresses that executed `approve` function, grouped by each `approve` recipient, over the past week.
	* 4.5. Label the `approve` recipient addresses based on Dune Tables regarding “address labeling”.
	* 4.6. The Final Query Results
5. Let's Conclude!
6. References

---

# 1. Argument Types Key Content

Before diving into the Ethereum ABI specification, let’s take a quick look at the argument data types of Ethereum contracts. Ethereum contract functions can have various parameter data types, and among them, I have listed some of the important types and summarize their key characteristics.

## 1.1. Elementary Types

`uint`
* Same as  `uint256`,
* which means it should be considered as  `uint256`  type during encoding.

`int`
* Same as  `int256`,
* which means it should be considered as  `int256`  type during encoding.

`bool`
* Same as  `uint8`,
* which means only 0 or 1 can be assigned to it.

`bytes{n}`
* Binary type with a length of n bytes (0 < n ≤ 32)

## 1.2. Fixed-size Types

`{type_name}[{n}]`
* An array with n elements (n ≥ 0)

## 1.3. Dynamic-size Types

`bytes`
* Binary type with a dynamic length of bytes

`string`
* A dynamically sized string (assuming it’s UTF-8 encoded)

`{type_name}[]`
* An array with a dynamic number of elements

# 2. Key Points of Argument Padding to 32 Bytes Rules

When calling Ethereum contract functions, you need to encode each argument and input them concatenated. In this process, there are rules regarding “length.” To avoid confusion, I’ve summarized the key rules for you in advance.

`uint{n}`
* Padding with preceding 0 to achieve a length of 32 bytes

`int{n}`
* Padding with preceding 0 to achieve a length of 32 bytes

`bytes{n}`
* Padding with trailing 0 to achieve a length of 32 bytes

# 3. A Contract Example

The following example has been taken from  [Contract ABI Specification Docs](https://docs.soliditylang.org/en/develop/abi-spec.html#examples). Let me explain this in simpler terms.

**Given the Contract:**

```javascript
pragma solidity ^0.4.16;  
  
contract Foo {  
  function baz(uint32 x, bool y) public pure returns (bool r) { r = x > 32 || y; }  
  function bar(bytes3[2]) public pure {}  
  function sam(bytes, bool, uint[]) public pure {}  
}
```

## 3.1. How to Call `baz(uint32 x, bool y)`

Let’s say you’re calling the function in the format of:  `baz(69, true)`

**Function Selector**
* `baz(uint32,bool)`  → Keccak-256 Hash
```python
0xcdcd77c0992ec5bbfc459984220f8c45084cc24d9b6efed1fae540db8de801d2
```

* Slice the left 4 bytes.
```python
0xcdcd77c0
```

**Parameter 1:**  `69`
* Convert it to hexadecimal.
```python
0x45
```

* Left pad it to a length of 32 bytes.
```python
0x0000000000000000000000000000000000000000000000000000000000000045
```

**Parameter 2:**  `true`
* Convert it to uint8.
```python
1
```

* Left pad it to a length of 32 bytes.
```python
0x0000000000000000000000000000000000000000000000000000000000000001
```

**The Final Encoding with Concatenating All**

```python
0xcdcd77c0 # Function Selector  
0x0000000000000000000000000000000000000000000000000000000000000045 # 69  
0x0000000000000000000000000000000000000000000000000000000000000001 # true  
  
# Concat  
0xdcdcd77c000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001
```

## 3.2. How to Call `bar(bytes3[2])`

Let’s say you’re calling the function in the format of:  `baz("abc", "def")`

**Function Selector**
* `bar(bytes3[2])`  → Keccak-256 Hash
```python
0xfce353f601a3db60cb33e4b6ef4f91e4465eaf93c292b64fcde1bf4ba6819b6a
```

* Slice the left 4 bytes.
```python
0xfce353f6
```

**Parameter 1:**  `“abc”`
* Convert it to utf-8 bytes ([String to UTF-8 Bytes Convertor](https://onlinetools.com/utf8/convert-utf8-to-bytes))
```python
616263
```

* Right pad it to a length of 32 bytes.
```python
0x6162630000000000000000000000000000000000000000000000000000000000
```

**Parameter 2**:  `“def”`
* Convert it to utf-8 bytes ([String to UTF-8 Bytes Convertor](https://onlinetools.com/utf8/convert-utf8-to-bytes))
```python
646566
```

* Right pad it to a length of 32 bytes.
```python
0x6465660000000000000000000000000000000000000000000000000000000000
```

**The Final Encoding with Concatenating All**

```python
0xfce353f6 # Function Selector  
6162630000000000000000000000000000000000000000000000000000000000 # "abc"  
6465660000000000000000000000000000000000000000000000000000000000 # "def"  
  
# Concat  
0xfce353f661626300000000000000000000000000000000000000000000000000000000006465660000000000000000000000000000000000000000000000000000000000
```

## 3.3. How to Call `sam(bytes, bool, uint[])`

Let’s say you’re calling the function in the format of:  `sam(“dave”, true, [1, 2, 3])`

**Function Selector**
* `sam(bytes,bool,uint256[])`  → Keccak-256 Hash
* Note that  `uint`  is replaced with its canonical representation  `uint256`.
```python
0xa5643bf27e2786816613d3eeb0b62650200b5a98766dfcfd4428f296fb56d043
```

* Slice the left 4 bytes.
```python
0xa5643bf2
```

**Parameters**
* In the order of: “**iLoc > Len > Value**”

![]({{ site.baseurl }}/assets/2023-10-16-encoding-and-decoding-ethereum-contract-functions/parameters.webp)
> made by Joshua

**The Final Encoding with Concatenating All**

```python
0xa5643bf2 # Function Selector  
  
0x0000000000000000000000000000000000000000000000000000000000000060 # 1st Param iLoc : 96 bytes  
0x0000000000000000000000000000000000000000000000000000000000000001 # 2nd Param Value : true   
0x00000000000000000000000000000000000000000000000000000000000000a0 # 3rd Param iLoc : 160 bytes  
0x0000000000000000000000000000000000000000000000000000000000000004 # 1st Param Len : 4 bytes  
0x6461766500000000000000000000000000000000000000000000000000000000 # 1sst Param Value : "dave"  
0x0000000000000000000000000000000000000000000000000000000000000003 # 3rd Params Len : 3 items  
0x0000000000000000000000000000000000000000000000000000000000000001 # 3rd Param Value (item 0) : 1  
0x0000000000000000000000000000000000000000000000000000000000000002 # 3rd Param Value (item 1) : 2  
0x0000000000000000000000000000000000000000000000000000000000000003 # 3rd Param Value (item 2) : 3  
  
# Concat  
0xa5643bf20000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000464617665000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003
```

# 4. Case Study: Who are the Top 10 Recipients of USDT `approve` Functions?

According to  [ERC-20 Interface](https://docs.openzeppelin.com/contracts/2.x/api/token/erc20), it is possible to delegate the permission to use a specific token (the authority to transfer the token, specifically) to a particular account using the `approve` function. This permission is frequently requested, particularly in DeFi platforms. In this case study, I aim to aggregate and analyze the top 10 accounts that people commonly delegate their USDT through `approve` function.

## 4.1. Function Selector

* `approve(address,uint256)`  → Keccak-256 Hash
```python
0x095ea7b334ae44009aa867bfb386f5c3b4b443ac6f0ee573fa91c4608fbadfba
```

* Slice the left 4 bytes.
```python
0x095ea7b3
```

## 4.2. Extract only the transactions that have called the `approve` function on the USDT Contract.

* For more info about `BYTEARRAY_STARTS_WITH` Function, click  [here](https://dune.com/docs/query/DuneSQL-reference/Functions-and-operators/varbinary/#bytearray_starts_with).

```sql
SELECT  
    *  
FROM  
    ethereum.transactions  
WHERE  
    "to" = 0xdAC17F958D2ee523a2206206994597C13D831ec7 -- USDT ERC-20 Contract  
    AND BYTEARRAY_STARTS_WITH(data, 0x095ea7b3) -- approve(address,uint256) Function Call
```

## 4.3. Extract the first argument value, `address`, from the functions.

* For more info about `BYTEARRAY_SUBSTRING` Function, click  [here](https://dune.com/docs/query/DuneSQL-reference/Functions-and-operators/varbinary/#bytearray_substring).

```sql
SELECT  
    BYTEARRAY_SUBSTRING(  
        BYTEARRAY_SUBSTRING(data, 5, 32),  
        13,  
        20  
    ) AS approved_to  
FROM  
    ethereum.transactions  
WHERE  
    "to" = 0xdAC17F958D2ee523a2206206994597C13D831ec7 -- USDT ERC-20 Contract  
    AND BYTEARRAY_STARTS_WITH(data, 0x095ea7b3) -- approve(address,uint256) Function Call
```

## 4.4. Now, aggregate the number of unique addresses that executed `approve` function, grouped by each `approve` recipient, over the past week.

```sql
SELECT  
    BYTEARRAY_SUBSTRING(  
        BYTEARRAY_SUBSTRING(data, 5, 32),  
        13,  
        20  
    ) AS approved_to,  
    COUNT(DISTINCT "from") AS approved_from_cnt  
FROM  
    ethereum.transactions  
WHERE  
    CAST(block_date AS DATE) >= DATE_ADD('DAY', -7, CURRENT_DATE) -- Recent 7 Days  
    AND "to" = 0xdAC17F958D2ee523a2206206994597C13D831ec7 -- USDT ERC-20 Contract  
    AND BYTEARRAY_STARTS_WITH(data, 0x095ea7b3) -- approve(address,uint256) Function Call  
GROUP BY  
    1
```

## 4.5. Label the `approve` recipient addresses based on Dune Tables regarding “address labeling”.

* Looking at the original address values alone does not provide any meaningful information, as y’all know here.

```sql
WITH  
CTE_approves AS (  
    SELECT  
        BYTEARRAY_SUBSTRING(  
            BYTEARRAY_SUBSTRING(data, 5, 32),  
            13,  
            20  
        ) AS approved_to,  
        COUNT(DISTINCT "from") AS approved_from_cnt  
    FROM  
        ethereum.transactions  
    WHERE  
        CAST(block_date AS DATE) >= DATE_ADD('DAY', -7, CURRENT_DATE) -- Recent 7 Days  
        AND "to" = 0xdAC17F958D2ee523a2206206994597C13D831ec7 -- USDT ERC-20 Contract  
        AND BYTEARRAY_STARTS_WITH(data, 0x095ea7b3) -- approve(address,uint256) Function Call  
    GROUP BY  
        1  
)  
  
SELECT  
    MAIN.approved_to,  
    COALESCE(  
        SUB1.dex_name || ' - ' || SUB1.distinct_name,  
        SUB2.project || ' - ' || SUB2.project_type,  
        SUB3.bridge_name || ' - ' || SUB3.description,  
        SUB4.cex_name || ' - ' || SUB4.distinct_name,  
        'Unknown'  
    ) AS name,  
    MAIN.approved_from_cnt AS addresses_cnt  
FROM  
    CTE_approves MAIN  
LEFT JOIN  
    addresses_ethereum.dex SUB1 -- DEX named addresses  
    ON MAIN.approved_to = SUB1.address  
LEFT JOIN  
    addresses_ethereum.defi SUB2 -- DeFi named addresses  
    ON MAIN.approved_to = SUB2.address  
LEFT JOIN  
    addresses_ethereum.bridges SUB3 -- Bridge named addresses  
    ON MAIN.approved_to = SUB3.address  
LEFT JOIN  
    addresses_ethereum.cex SUB4 -- CEX named addresses  
    ON MAIN.approved_to = SUB4.address  
ORDER BY  
    3 DESC  
LIMIT  
    10  
;
```

## 4.6. The Final Query Results

![]({{ site.baseurl }}/assets/2023-10-16-encoding-and-decoding-ethereum-contract-functions/query-results.webp)
> Dune Analytics

# 5. Let's Conclude!

So far, we have delved into **the Ethereum’s ABI Specification**, learned how data is encoded when transactions call contract functions, and understood how to extract meaningful insights by decoding specific function names and arguments from Ethereum transactions data.

In fact, Dune Analytics, Etherscan, and many other on-chain data platforms all incorporate these decoding processes internally.

Hopefully this article will serve as an excellent foundation for your future, more detailed and complex on-chain data analysis endeavors.

# 6. References

* [Contract ABI Specification](https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector-and-argument-encoding)  
* [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)  
* [Dune Analytics](https://dune.com/joshua_web3)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)