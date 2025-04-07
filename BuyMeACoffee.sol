// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BuyMeACoffee {
    // Structure d’un "tip"
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // Adresse du propriétaire du contrat
    address payable public owner;

    // Liste des tips
    Memo[] public memos;

    // Events
    event NewMemo(address indexed from, uint256 timestamp, string name, string message);

    constructor() {
        owner = payable(msg.sender);
    }

    // Envoyer un tip avec un message
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't buy coffee for free!");

        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    // Lire tous les messages
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    // Retirer les fonds
    function withdrawTips() public {
        require(msg.sender == owner, "Only the owner can withdraw");
        require(address(this).balance > 0, "No tips to withdraw");

        owner.transfer(address(this).balance);
    }
}
