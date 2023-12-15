---
layout: post
title: "Near Protocol: Account Model and Transaction Story"
tags:
  - Blockchain
---

> Dive into the intricate world of blockchain with Joshua. Uncover the complexities of Near Protocol's account model, transaction stories, and personal insights. This article offers a captivating exploration of addresses, private keys, and the execution flow of transactions, providing a unique perspective on user experience and protocol design. Join me on this insightful journey, backed by personal research and a wealth of references from the blockchain realm.

### CONTENTS
1. Account Model Story
	* 1.1. Addresses
	* 1.2. Private Keys
	* 1.3. A Sample UX Case
2. Transaction Story
	* 2.1. Transactions
	* 2.2. Actions
	* 2.3. Receipts
	* 2.4. A Sample Transactions Case
3. Personal Thoughts
4. References

---

### DISCLAIMER
> This material is based on personal research and study; therefore, it may contain factual errors and cannot be relied upon for critical decision-making. Additionally, the opinions in the material are purely subjective and have no connection to any past or current companies that I have worked at.

# 1. Account Model Story

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/account-model-story.webp)
> [Source](https://docs.near.org/concepts/basics/accounts/model)

## 1.1. Addresses

### There are Two Types of Accounts.

**1. Named Account**
* i.e.,  `alice.near`,  `bob.near`,  `usa.near`,  `texas.usa.near`
* Formatically Same as DNS
* 🙆🏻‍♂️  `usa.near`  →  `texas.usa.near`  can be created.
* 🙅🏻‍♂️  `usa.near`  →  `texas.uk.near`  can NOT be created.

**2. Implicit Account**
* i.e.,  `98793cd91a3f870fb126f662858[...]`
* Formatically Similar to the Traditional Way to Create Addresses such as Bitcoin and Ethereum (64 letters)

### Personal Thoughts

**1. Named Account**
* Improves the end-user UX of the product because it’s easy to memorize!
* While ENS is executed at the  **contract layer**, Near’s Named Account is executed at the  **protocol layer**.

**2. Implicit Account**
* For user groups that want to maintain pseudonymization!
* For developers accustomed to traditional address systems, especially hardware wallet service companies

## 1.2. Private Keys

### There are Two Types of Private Keys.

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/private-keys.webp)
> [Source](https://www.vitalpoint.ai/understanding-near-keys/)

**1. Full Access Key**
> **The address can be used to sign transactions of all types.**

* The 8 Types of Transactions (`Transaction Actions`)
```python
Transfer, # Transfer Tokens  
CreateAccount, # Create Accounts  
DeleteAccount, # Delete Accounts  
DeployContract, # Deploy Contracts  
FunctionCall, # Call Functions of Contracts  
Stake, # Staking  
AddKey, # Add Keys  
DeleteKey # Delete Keys
```

**2. Function Call Key**
> **The address can be used to sign the following restricted transactions.**

* Transactions are restricted to  **specific function(s)**  within  **a specific contract**.
* Sending Native Token, $NEAR, is NOT possible.
	* Gas Fees can be paid, however.
	* Of course, if you set it so that you can’t even pay Gas Fees, only functions related to View methods can be called.
* Purpose of Using Function Call Keys
	* By passing it to the dApp’s client, creating an environment where the dApp can immediately invoke contract calls with limited permissions.

### Parameters

**1. Full Access Key**

```javascript
pub enum AccessKeyPermission {  
    FunctionCall(FunctionCallPermission),  
    FullAccess,  
}
```

**2. Function Call Key**

```javascript
pub struct FunctionCallPermission {  
    pub receiver_id: AccountId, // a Specific Contract  
    pub method_names: Vec<String>, // Specific Functions  
    pub allowance: Option<Balance>, // Max Gas Fee Payment Amount  
}
```

### Locked Account
* Simply remove all keys through the transaction of the  `DeleteKey`  action.
* No one will be able to control the account.
* In other words, after deploying the smart contract account itself, it can be made fully decentralized, allowing only internal transactions to occur.

## 1.3. A Sample UX Case

### Typical dApp Transaction Signing Architecture

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/Typical dApp Transaction Signing Architecture.webp)
> [Source](https://docs.near.org/concepts/web3/near)

* To execute a specific transaction within the dApp, the user must undergo repeated redirection between the wallet and the client.
* **Advantage**: Excellent  **security**  as the private key is not exposed to the client.
* **Disadvantage**: Repeated redirections can be annoying for  **users**.

### dApp Transaction Signing Architecture Using Function Call Key
> It is possible to address the Disadvantage without significantly compromising the Advantage.

**1. Add Key**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/add-key.webp)
> [Source](https://docs.near.org/concepts/web3/near)

**2. Call a Specific Function within a dApp’s Contract**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/call a specific function within a dapps contract.webp)
> [Source](https://docs.near.org/concepts/web3/near)

# 2. Transaction Story

**Overall Execution Flow of the Transactions**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/transaction-story.webp)
> [Source](https://www.youtube.com/@NEARProtocol)

**Important Terms**
* `Transaction`
* `Action`
* `Receipt`

## 2.1. Transactions
**A Transaction is:**
* a set of  `actions`  that need to be performed on the receiving account.
* 🙅🏻‍♂️ In other words, a transaction is NOT the atomic unit driving state changes in Near Blockchain.

## 2.2. Actions
**An Action is:**
* `the unit of work`  that the virtual machine needs to process through a transaction.
* There are a total of 8 types recognizable by the Near Protocol. (You have already checked them above!)

```python
Transfer, # Transfer Tokens  
CreateAccount, # Create Accounts  
DeleteAccount, # Delete Accounts  
DeployContract, # Deploy Contracts  
FunctionCall, # Call Functions of Contracts  
Stake, # Staking  
AddKey, # Add Keys  
DeleteKey # Delete Keys
```

## 2.3. Receipts
**A Receipt is:**
* the smallest unit executed by the virtual machine, in other words,  `the execution object`.

## 2.4. A Sample Transaction Case

### A Randomly Chosen Transaction Case

**1. A Transaction Sending 0.02 NEAR**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/A Transaction Sending 0.02 NEAR.webp)
> [Source](https://nearblocks.io/txns/6aqjvabatzFkvoBzYmnpEZbAfnLbGo6PsUM6WdpUYxmG#)

**2. Receipt Executions - (1) TRANSFER Action**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/Receipt Executions TRANSFER Action.webp)
> [Source](https://nearblocks.io/txns/6aqjvabatzFkvoBzYmnpEZbAfnLbGo6PsUM6WdpUYxmG#)

**2. Receipt Executions - (2) Receiving a Refund for the difference between Gas Limit and Gas Used**

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/Receipt Executions Receiving a Refund for the difference between Gas Limit and Gas Used.webp)
> [Source](https://nearblocks.io/txns/6aqjvabatzFkvoBzYmnpEZbAfnLbGo6PsUM6WdpUYxmG#)

# 3. Personal Thoughts

### 1. Protocolized Address System for DNS

It seems that the computational burden on nodes has been compromised to become a user-friendly blockchain. (Due to the increased size of dtype…)
* Wouldn’t there be a slowdown and an increase in gas fees then?
* It seems that this has been addressed by dividing a block into multiple chunks to create the block.
* Let me study deeper when I have more expertise to check out if there are any potential security drawbacks of this approach. 😁

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/nightshade.webp)
> [Source](https://near.org/papers/nightshade)

### 2. Key Generation Structure for dApp End-User UX

Of course, in the initial Add Key situation, wallet redirection still occurs, so it may not be possible to completely alleviate user confusion.
* 🗣️**Picky Users (say, Joshua)**: “Earlier, my signature was required, but why are you executing things now without it?” 😠😡

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/add-key.webp)
> [Source](https://docs.near.org/concepts/web3/near)

# 4. References
* **Near**  **Whitepaper**:  [https://near.org/papers/nightshade](https://near.org/papers/nightshade)
* **Near Official Docs**:  [https://docs.near.org](https://docs.near.org/)
* **Near Official Dev Docs**:  [https://nomicon.io](https://nomicon.io/)
* **Near Official YouTube Channel**:  [https://www.youtube.com/@NEARProtocol](https://www.youtube.com/@NEARProtocol)
* **Blockchain Explorer (Nearblocks)**:  [https://nearblocks.io](https://nearblocks.io/)
* **Vital Point AI Content**:  [https://www.vitalpoint.ai/understanding-near-keys](https://www.vitalpoint.ai/understanding-near-keys)

![]({{ site.baseurl }}/assets/2023-11-18-near-protocol/near-logo.webp)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)