// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract Lottery {
    address public owner;
    address payable[] public players;
    uint256 public lotteryId;
    mapping(uint256 => address) public lotteryHistory;

    constructor() {
        owner = msg.sender;
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

    function getRandomNumber() public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(owner, block.timestamp)));
    }

    function getRandomNumberV2() public view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function getRandomNumberV3() public view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        block.timestamp
                    )
                )
            );
    }

    function pickWinner() public onlyOnwer {
        // turn on depending on the test version
        // uint256 index = getRandomNumber() % players.length;
        // uint256 index = getRandomNumberV2() % players.length;
        uint256 index = getRandomNumberV3() % players.length;

        lotteryHistory[lotteryId] = players[index];
        lotteryId++;

        address payable winner = players[index];
        // for version 2
        // players = new address payable[](0);

        (bool success, ) = winner.call{value: address(this).balance}("");
        require(success, "Failed to send ETH");

        // for version 1,3
        players = new address payable[](0);
    }

    modifier onlyOnwer() {
        require(msg.sender == owner, "you're not the owner");
        _;
    }
}
