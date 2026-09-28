---
sidebar_position: 4
---

## 3. Implementing the VRF Consumer

Now that we understand how a VRF request moves between the consumer contract and the VRF Coordinator, let's look at how those pieces are implemented in Raffle.sol.

The VRF integration is built around two Chainlink components:

```
import {VRFConsumerBaseV2Plus} from "chainlink/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "chainlink/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
```

`VRFConsumerBaseV2Plus` provides the base functionalityneeded for a contract to receive VRF responses.
`VRFV2PlusClient` provides the RandomWordsRequest structure and helper functions used to construct a VRF v2.5 request.

### 3.1 Inheriting from VRFConsumerBaseV2Plus

The contract inherits from VRFConsumerBaseV2Plus:

`contract Raffle is VRFConsumerBaseV2Plus {`

Inheritance is what gives Raffle access to the functionality provided by the VRF consumer base contract, including the Coordinator reference and the fulfillment mechanism discussed earlier.

The Coordinator address is supplied when the contract is deployed:

```
    constructor(
        uint256 entranceFee,
        uint256 interval,
        address _vrfCoordinator,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {

```

The expression:

VRFConsumerBaseV2Plus(_vrfCoordinator)

is a base-constructor call. It tells Solidity to initialize the inherited `VRFConsumerBaseV2Plus` contract using `_vrfCoordinator`.

The important conceptual point is that the consumer contract does not discover the Coordinator automatically. The deployed Coordinator address is provided when the consumer is constructed.

### 3.2 Storing the VRF configuration

The contract stores the configuration required to construct a VRF request:

```
uint16 private constant REQUEST_CONFIRMATIONS = 3;
uint32 private constant NUM_WORDS = 1;
bytes32 private immutable i_keyHash;
uint256 private immutable i_subscriptionId;
uint32 private immutable i_callbackGasLimit;
```

These values are initialized in the constructor:

```
i_keyHash = gasLane;
i_subscriptionId = subscriptionId;
i_callbackGasLimit = callbackGasLimit;
```

Rather than hard-coding the configuration directly inside `performUpkeep()`, the contract stores it once and uses those values when a request is created.

###  3.3 Creating the VRF request

The request is constructed inside `performUpkeep()`:

```
        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest
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

This creates a `RandomWordsRequest` containing the configuration the Coordinator needs to process the request.

The request struct does **not** generate randomness. It packages the configuration / parameters the Coordinator needs to process the randomness request.

The next line sends that request to the Coordinator:

`s_vrfCoordinator.requestRandomWords(request);`

Here, `Raffle` is the caller.

`s_vrfCoordinator` refers to the Coordinator configured through the inherited `VRFConsumerBaseV2Plus` contract. Calling `requestRandomWords()` therefore makes an external contract call from `Raffle` to the deployed VRF Coordinator.

The flow is:

Raffle

  |

  |    requestRandomWords(request)

  v

VRF Coordinator

  |

  |    processes the request

  v

Chainlink VRF infrastructure

The important distinction is that the **Raffle requests randomness from the Coordinator**. The Coordinator does not call `requestRandomWords()` itself.

### 3.4 Receiving the random values

The request and fulfillment happen asynchronously. The transaction that submits the request finishes before the random values are delivered.

Later, the Coordinator initiates the fulfillment flow:

VRF Coordinator

    |

    |

    v

rawFulfillRandomWords()

    |

    |

    v

fulfillRandomWords()

    |

    |

    v
Application logic (raffle)

The consumer contract implements the application-level callback:

```
    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal
    override {
```

The `requestId` identifies the randomness request, while `randomWords` contains the random values returned for that request.

Because this contract requests one random word:

`uint32 private constant NUM_WORDS = 1;`

the returned array contains one value, which the contract accesses with:

`randomWords[0]`

The important separation is:

Chainlink VRF provides the verifiable random value. The consumer contract decides how to use that value in its own application logic.

In this contract, the random value is used to select an index from the stored addresses:

`uint256 indexOfWinner = randomWords[0] % s_players.length;`

The VRF system does not know what that number represents. It simply provides the random value requested by the consumer. The meaning assigned to that value is determined by the consumer contract.

Raffle calls requestRandomWords() on the Coordinator; later, the Coordinator calls back into Raffle. That distinction is central to understanding the architecture.
