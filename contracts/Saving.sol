// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './IERC20.sol';

contract Save {
    address tokenAdress;
    address owner;
    mapping(address => uint256) savingsEther;
    mapping(address => uint256) savingsToken;

    event SavingEtherSuccessful(address indexed user, uint256 amount);
    event SavingTokenSuccessful(address indexed user, uint256 amount);
    event SavingSuccessful(address indexed user, uint256 etherAmount, uint256 tokenAmount);
    event WithdrawEtherSuccessful(address receiver, uint256 amount);
    event WithdrawTokenSuccessful(address receiver, uint256 amount);
    event WithdrawSuccessful(address receiver, uint256 etherAmount, uint256 tokenAmount);

    constructor(address _savingToken) {
        tokenAdress = _savingToken;
        owner = msg.sender;
    }

    function depositEther() external payable {
        require(msg.sender != address(0), "wrong EOA");
        require(msg.value > 0, "can't save zero value");

        savingsEther[msg.sender] = savingsEther[msg.sender] + msg.value;
        emit SavingEtherSuccessful(msg.sender, msg.value);
    }

    function depositToken(uint256 _amount) external {
        require(msg.sender != address(0), "address zero detected");
        require(_amount > 0, "can't save zero value");
        require(IERC20(tokenAdress).balanceOf(msg.sender) >= _amount, "not enough token");

        require(IERC20(tokenAdress).transferFrom(msg.sender, address(this), _amount), "failed to transfer token");

        savingsToken[msg.sender] = savingsToken[msg.sender] + _amount;

        emit SavingTokenSuccessful(msg.sender, _amount);
    }

    function deposit(uint _amount) external payable {
        require(msg.sender != address(0), "wrong EOA");
        require(msg.value > 0, "can't save zero value");

        require(_amount > 0, "can't save zero value");
        require(IERC20(tokenAdress).balanceOf(msg.sender) >= _amount, "not enough token");
        require(IERC20(tokenAdress).transferFrom(msg.sender, address(this), _amount), "failed to transfer token");

        savingsEther[msg.sender] = savingsEther[msg.sender] + msg.value;
        savingsToken[msg.sender] = savingsToken[msg.sender] + _amount;

        emit SavingSuccessful(msg.sender, msg.value, _amount);
    }

    function withdrawEther() external {
        require(msg.sender != address(0), "wrong EOA");
        uint256 _userSavings = savingsEther[msg.sender];
        require(_userSavings > 0, "can't withdraw zero ether value");

        savingsEther[msg.sender] = savingsEther[msg.sender] - _userSavings;

        payable(msg.sender).transfer(_userSavings);
    }

    function withdrawToken() external {
        require(msg.sender != address(0), "address zero detected");

        uint256 _userSaving = savingsToken[msg.sender];

        require(_userSaving >= 0, "insufficient Token funds");

        savingsToken[msg.sender] -= _userSaving;

        require(IERC20(tokenAdress).transfer(msg.sender, _userSaving), "failed to withdraw");

        emit WithdrawTokenSuccessful(msg.sender, _userSaving);
    }

    function withdraw() external {
        require(msg.sender != address(0), "address zero detected");

        uint256 _userTokenSavings = savingsToken[msg.sender];
        uint256 _userEtherSavings = savingsEther[msg.sender];

        require(_userTokenSavings >= 0, "insufficient Token funds");
        require(_userEtherSavings > 0, "insufficient Ether funds");

        savingsToken[msg.sender] = savingsToken[msg.sender] - _userTokenSavings;
        savingsEther[msg.sender] = savingsEther[msg.sender] - _userEtherSavings;

        require(IERC20(tokenAdress).transfer(msg.sender, _userTokenSavings), "failed to withdraw");
        payable(msg.sender).transfer(_userEtherSavings);

        emit WithdrawSuccessful(msg.sender, _userEtherSavings, _userTokenSavings);
    }

    function checkEtherSavings(address _user) external view returns (uint256) {
        return savingsEther[_user];
    }

    function checkTokenSavings(address _user) external view returns (uint256) {
        return savingsToken[_user];
    }

    function checkSavings(address _user) external view returns (uint256, uint256) {
        return (savingsEther[_user], savingsToken[_user]);
    }

    function checkEtherContractBal() external view returns (uint256) {
        return address(this).balance;
    }

    function checkTokenContractBal() external view returns (uint256) {
        return IERC20(tokenAdress).balanceOf(address(this));
    }

    function checkContractBal() external view returns (uint256, uint256) {
        return (IERC20(tokenAdress).balanceOf(address(this)), address(this).balance);
    }
}