pragma solidity 0.5.8;

import "./SafeMath.sol";

contract Test {
    uint public eventId;

    event MessageEvent(
        address indexed triggeredBy,
        uint indexed eventId,
        string message
    );

    event TestEvent(address indexed triggeredBy);

    function () external payable {
        emitMessageEvent("Deposit");
    }

    function emitDefaultMessageAndTestEvents() public {
        emitDefaultMessageEvent();
        emitTestEvent();
    }

    function emitDefaultMessageEvent() public {
        emitMessageEvent("Default Message");
    }

    function emitMessageEvent(string memory message) public {
        eventId = SafeMath.add(eventId, 1);
        emit MessageEvent(msg.sender, eventId, message);
    }

    function emitTestEvent() public {
        emit TestEvent(msg.sender);
    }

    function doNothing() public {}

    function nextEventId() public view returns (uint) {
        return SafeMath.add(eventId, 1);
    }
}
