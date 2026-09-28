## 6. Key Takeaways

Chainlink VRF v2.5 may seem complicated at first, but it becomes easier to understand once you know what each component does.

### The request flow

The consumer contract initiates the request by calling the VRF Coordinator:

`s_vrfCoordinator.requestRandomWords(request);`

The request contains the configuration needed by the Coordinator, including the subscription, key hash, confirmation count, callback gas limit, number of random words, and additional arguments.

### The fulfillment flow

The request and response happen separately.

After the VRF request is processed, the Coordinator calls the consumer's inherited fulfillment entry point:

VRF Coordinator -> rawFulfillRandomWords() -> fulfillRandomWords() -> Application logic

`rawFulfillRandomWords()` belongs to the VRF integration layer provided by `VRFConsumerBaseV2Plus`. It verifies that the call comes from the configured Coordinator and forwards the result to the consumer's `fulfillRandomWords()` implementation. The Chainlink consumer pattern uses this separation so that application-specific logic does not have to implement the Coordinator validation itself.

### The most important distinction

The easiest way to remember the architecture is:

REQUEST

Consumer ----------------------> Coordinator
          requestRandomWords()

FULFILLMENT

Coordinator ------------------------> Consumer
                                      rawFulfillRandomWords() (the Coordinator calls this function in the consumer contract)
                                                ->
                                      fulfillRandomWords()

The consumer requests randomness from the Coordinator.

The Coodinator then works with Chainlink's VRF infrastructure to process the request and ultimately deliver the random values back to the consumer.

The consumer then decides what those values mean within its own application.

Consumer -> Coordinator -> VRF infrastructure -> Coordinator -> Consumer

Once this request-and-fulfillment pattern is understood, the rest of the VRF v2.5 API becomes much easier to follow.


The consumer
