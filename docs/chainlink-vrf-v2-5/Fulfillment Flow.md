## 4. Understanding the VRF Fulfillment Flow

At this point, we have seen how the contract sends a randomness request to the VRF Coordinator and how fulfillRandomWords() receives the result.

But there is an important detail in the fulfillment process:

**Why does Chainlink use `rawFulfillRandomWords()` and `fulfillRandomWords() `instead of calling `fulfillRandomWords()` directly?**

The answer becomes clearer when we look at the two functions separately.

### 4.1 `rawFulfillRandomWords()`: the entry point for Chainlink

`rawFulfillRandomWords()` is provided by the inherited VRFConsumerBaseV2Plus contract.

The `Raffle` contract does not implement this function itself.

Instead, `VRFConsumerBaseV2Plus` provides the external entry point (`rawFulfillRandomWords()`) that receives the VRF response from the Coordinator. It validates that the response comes from the configured Coordinator before forwarding the random values to `fulfillRandomWords()`.

The important point is that rawFulfillRandomWords() acts as the boundary between the Chainlink VRF mechanism and the consumer contract's application logic.

It also provides an important security check: the fulfillment must come from the configured VRF Coordinator.

### 4.2 `fulfillRandomWords()`: the application callback

The function that the Raffle contract actually implements is:

```
    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal
    override {
 
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner =  s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        emit WinnerPicked(s_recentWinner);

        (bool success,) = recentWinner.call{value: address(this).balance}("");
        if (!success){
            revert Raffle__TransferFailed();
        }
    }
```

This is where the application decides what to do with the random values.

The function is marked: 

internal override

`override` tells Solidity that the function implements a function defined by the inherited VRF consumer base.

`internal` means it is intended to be called from within the contract's inheritance hierarchy rather than being an externally callable entry point.

This is why the consumer does not simply expose `fulfillRandomWords()` as a public function for anyone to call.

### 4.3 Why have two functions?

The two functions have different responsibilities.

`rawFulfillRandomWords()` is part of the **VRF integration layer.** It receives the response / fulfillment from the Coordinator and validates before forwarding / routing the values.
`fulfillRandomWords()` is part of the **consumer's application layer.** It tells the application what to do with those values.

This separation can be visualised as:

CHAINLINK VRF infrastructure
      |
      V
VRF Coordinator
      |    calls
      V
rawFulfillRandomWords() [provided by the inherited base contract (VRFConsumerBaseV2Plus)
      |
      V
fulfillRandomWords() [implemented by Raffle]
      |
      V
Our application logic

This design prevents the application-specific callback from also having to implement the Coordinator authentication and fulfillment-entry logic itself.

### 4.4 Following the random value into the application

Once `fulfillRandomWords()` receives the response, the contract can use the random values however its application requires.

In this example, the first random word is used to calculate an array index:

uint256 indexOfWinner = randomWords[0] % s_players.length;

The important distinction is that Chainlink provides the random value, not the application-specific meaning of that value.

The VRF system does not decide which array element should be selected. The consumer contract takes the returned random value and applies its own logic.

This gives us the complete fulfillment path:

VRF Coordinator
      |
      |  delivers random values
      V
rawFulfillRandomWords()
      |
      |  validates and forwards
      V
fulfillRandomWords()
      |
      |  application interprets
      V
randomWords[0]
      |
      |
      V
Application Logic