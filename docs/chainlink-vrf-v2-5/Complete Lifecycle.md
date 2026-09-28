## 5. The Complete VRF Lifecycle

We can now put the pieces together and trace a complete VRF request from start to finish. 

The process begins when the consumer contract becomes eligible for an upkeep. In this project, `checkUpkeep()` determines whether the conditions for the upkeep have been met.

If those conditions are satisfied, `performUpkeep()` is called: 

```
function performUpkeep(bytes calldata /* performData */) external {
    (bool upkeepNeeded,) = checkUpkeep("");

    if (!upkeepNeeded) {
        revert Raffle__UpkeepNotNeeded(
            address(this).balance,
            s_players.length,
            uint256(s_raffleState)
        );
    }

    s_raffleState = RaffleState.CALCULATING;

    // Build the VRF request...

    s_vrfCoordinator.requestRandomWords(request);
}
```

the most important part ofr VRF is the final call:

`s_vrfCoordinator.requestRandomWords(request);`

At this point, the consumer contract has sent its request to the VRF Coordinator. 

The complete flow is:

Automation
    |
    |  calls
    V
checkUpkeep()
    |
    |  upkeep is needed
    V
performUpkeep()
    |
    |  requestRandomWords(request)
    V
VRF Coordinator
    |
    |  processes the request
    V  
Chainlink VRF infrastructure
    |
    |  produces verifiable randomness
    V
VRF Coordinator
    |
    |  fulfills the request
    V
rawFulfillRandomWords()
    |
    |  validates and forwards
    V
fulfillRandomWords()
    |
    |  application-specific logic
    V
randomWords[0]

### 5.1 Request amd fulifllment are separate transactions

One of the most important concepts to understand is that requesting randomness and receiving randomness do not happen in the same transaction.

The request transaction calls:

`s_vrfCoordinator.requestRandomWords(request);`

That submits the request to the Coordinator. The random values are delivered later through the fulfillment flow. This means the consumer contract must be designed around an **asynchronous workflow:**

The contract therefore cannot request randomness and immediately expect `randomWords` to be available in the same function call.

### 5.2 The roles of each component

Raffle -> Requests randomness and defines what to do with the result

Automation -> Determines when `performUpkeep()` should be executed

VRF Coordinator -> Receives requests and coordinates the on-chain VRF workflow

Chainlink VRF infrastructure -> Produces the verifiable randomness

VRFConsumerBaseV2Plus -> Provides the fulfillment entry point and Coordinator validation

`fulfillRandomWords()` -> Applies the random values to the consumer's application logic

This separation is useful because it shows that VRF is not a single function call that magically returns a random number.

It is a sequence of interactions between the consumer contract, the Coordinator, Chainlink's VRF infrastructure, and the consumer's fulfillment logic. 

### 5.3 The key idea

The request travels from the consumer to the Coordinator, while the randomness response travels back from the Coordinator to the consumer.

Note: The VRF Coordinator fulfills the request by calling `rawFulfillRandomWords()` on the consumer contract.

The Chainlink infrastructure generates the randomnes and sends it to the Coordinator, which then sends it to the consumer contract for use.