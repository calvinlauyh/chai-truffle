pragma solidity 0.5.8;

import "./SafeMath.sol";

contract Bank {
    mapping(address => uint256) public balance;

    event Deposit(
        address indexed from,
        uint amount
    );

    event Withdrawal(
        address indexed to,
        uint amount
    );

    function () external payable {
        deposit();
    }

    function deposit() public payable {
        balance[msg.sender] = SafeMath.add(balance[msg.sender], msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balance[msg.sender] > amount, "Insufficient balance");

        balance[msg.sender] = SafeMath.sub(balance[msg.sender], amount);
        msg.sender.transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
