---
sidebar_position: 3
---

## 2. Understanding the VRF v2.5 Request

Now that we understand the request-and-fulfillment lifecycle, we can look more closely at what a VRF v2.5 request contains.

In the Raffle contract, the request is constructed in `performUpkeep()`:

```
        VRFV2PlusClient.RandomWordsRequest memory request =               VRFV2PlusClient.RandomWordsRequest
        ({
            keyHash: i_keyHash,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
            )
        });
```
The request is then passed to the Coordinator:

`s_vrfCoordinator.requestRandomWords(request);`

The `RandomWordsRequest` struct bundles the information the Coordinator needs to process the request. In VRF v2.5, the request includes parameters for the VRF configuration, billing, the number of random values requested, and the gas available for fulfillment.

Let's look at each field.

`keyHash`

Let keyHash: i_keyHash

The `keyHash` identifies the VRF key and configuration used for the request. In the Raffle contract, it is stored as:

bytes32 private immutable i_keyHash;

The value is supplied when the contract is deployed. You can think of the `keyHash` as selecting which VRF configuration should be used to fulfill teh request.

`subId`

subId: i_subscriptionId

`subId` identifies the VRF subscription that is associated with the request.

The subscription is used to manage the resources used by VRF requests. Your consumer therefore supplies the subscription ID when requesting randomness.

In the contract, it is stored as:

uint256 private immutable i_subscriptionId;

`requestConfirmations`

requestConfirmations: REQUEST_CONFIRMATIONS

This specifies how many block confirmations the request should wait for before the VRF response is generated.

Your contract sets:

uin256 private constant REQUEST_CONFIRMATIONS = 3;

The important concept is that the request is not necessarily fulfilled immediately after it is submitted. The configured confirmation count is part of the request's fulfillment conditions.

`callbackGasLimit`

callbackGasLimit: i_callbackGasLimit

When the VRF result is delivered, the Coordinator must execute the consumer's fulfillment logic.

That execution consumes gas.

`callbackGasLimit` specifies the gas limit available for that callback.

In your consumer:

uint32 private immutable i_callbackGasLimit;

The value should be large enough for the logic executed during fulfillment.

`numWords`

numWords: NUM_WORDS

This specifies how many random values the consumer wants.

Our contract requests one:

uin32 private constant NUM_WORDS = 1;

The returned values are provided to `fulfillRandomWOrds()` as an array:

uint256[] calldata randomWords

Because this consumer requests one word, the application reads:

randomWords[0]

`extraArgs`

The final field is:

``` 
    extraArgs: VRFV2PlusClient._argsToBytes(
        VRFV2PlusClient.ExtraArgsV1 ({
            nativePayment: false
        })
    )
```

This is where VRF v2.5 introduces additional request configuration. 

`extraArgs` lets us include additional options with our VRF request. In this example, `nativePayment` determines whether the request is paid for with the chain's native token or with LINK.

Here it is set to:

nativePayment: false

so this request is configured for LINK payment.

#### Putting the request together

The important thing to understand is that `RandomWordsRequest` is **not the rnadom nunber.**

It is a description of what the consumer is asking the VRF Coordinator to do.

RandomWordsRequest
|
|-  keyHash
|      ->  VRF configuration
|
|-  subId
|      ->  subscription
|
|-  requestConfirmations
|      ->  confirmation requirement
|
|-  callbackGasLimit
|      ->  gas available for fulfillment
|
|-  numWords
|      ->  number of random values requested
|
|_  extraArgs
        ->  additional request configuration

Once this struct has been constructed, the consumer sends it to:

s_vrfCoordinator.requestRandomWords(request);

The Coordinator then receives the request and returns a `requestId`.

The important distinction is:

RandomWordsRequest means "what randomness do I need, and how should the request be handled?"

requestId means "Which request is this?"
The request parameters describe the request. The `requestId` identifies the individual request.

With this distinction in place, we can now move from the `request side` of the integration to the code that handles the **fulfillment side.**
