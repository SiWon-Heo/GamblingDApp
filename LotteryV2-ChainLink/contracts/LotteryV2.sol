// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract LotteryV2 is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    bytes32 keyHash =
        0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;

    // 10만 -> 100만으로 조정
    uint32 callbackGasLimit = 1000000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // 한 로터리에 1명의 우승자 -> 1로 수정
    uint32 numWords = 1;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    // 중복
    // address s_owner;

    address public owner;
    address payable[] public players;
    uint256 public lotteryId;
    mapping(uint256 => address) public lotteryHistory;
    address vrfCoordinator = 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D;

    // constructor 업데이트
    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        owner = msg.sender;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function enter() public payable {
        require(
            msg.value >= .01 ether,
            "msg.value should be greater than or equal to 0.01 ether"
        );
        players.push(payable(msg.sender));
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    // function getRandomNumber() public view returns (uint256) {
    //     return uint256(keccak256(abi.encodePacked(owner, block.timestamp)));
    // }

    // function getRandomNumberV2() public view returns (uint256) {
    //     return
    //         uint256(
    //             keccak256(
    //                 abi.encodePacked(block.difficulty, block.timestamp, players)
    //             )
    //         );
    // }

    // function getRandomNumberV3() public view returns (uint256) {
    //     return getRandomNumberV2() % players.length;
    // }

    // assumes the subscription is funcded sufficiently
    function _requestRandomWords() internal {
        // will revert if subscription is not set and funded
        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(
        uint256,
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
        _prizeWinner();
    }

    function pickWinner() public onlyOnwer {
        _requestRandomWords();
    }

    function _prizeWinner() internal {
        // uint256 index = getRandomNumber() % players.length;
        // uint256 index = getRandomNumberV2() % players.length;
        // uint256 index = getRandomNumberV3() % players.length;
        uint256 index = s_randomWords[0] % players.length;

        lotteryHistory[lotteryId] = players[index];
        lotteryId++;

        (bool success, ) = players[index].call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to send ETH");

        players = new address payable[](0);
    }

    modifier onlyOnwer() {
        require(msg.sender == owner, "you're not the owner");
        _;
    }
}
