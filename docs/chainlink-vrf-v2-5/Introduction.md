---
sidebar_position: 1
---

A technical deep dive into integrating Chainlink VRF v2.5 with Foundry to request and use verifiable random numbers in smart contracts.

## Introduction

Randomness is easy to generate in a traditional application. On a blockchain, it is not.

Smart contracts execute deterministically: every node that processes the same transaction must arrive at teh same result. That makes it difficult to generate a random value that is both unpredictable and verifiable without relying on an external source.

Chainlink VRF (Verifiable Random Function) solves this problem by providing smart contracts with random values together with cryptographic proof that the randomness was generated correctly.

For developers, however, the first VRF integration can be confusing. A call such as `requestRandomWords()` does not immediately return a random number. Instead, it starts an asynchornous request that is fulfilled later through a callback. To understand what is happening, you need to distinguish several components and functions: the consumer contract, the VRF Coordinator, `requestRandomWords()`, and `fulfillRandomWords()`.

This guide demystifies that process from the ground up and them implements it in Foundry using Chainlink VRF v2.5. Rather than treating the VRF API as a collection of functions to memorize, we will follow a single randomness request through its entire lifecycle:

Raffle Contract
|
|    `requestRandomWords()`
v
VRF Coordinator
|
|    VRF request
v
Chainlink VRF infrastructure
|
|    randomness + proof
v
`rawFulfillRandomWords()`
|
|    callback
v
fulfillRandomWords()
|
|
v
Application Logic

By the end of the guide, you should understand not only how to integrate Chainlink VRF v2.5 in a Foundry project, but also why each part of the integration exists and how the pieces fit together.