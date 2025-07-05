// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault {
    //////////////////////
    // State Variables  //
    //////////////////////
    bytes32 private immutable i_name;
    address private immutable i_owner;
    address private immutable i_beneficiary;
    address private immutable i_stablecoin;
    uint256 private immutable i_targetAmount;
    // TODO: condition

    uint256 private s_vaultBalance; // total balance of the vault
    mapping(address donor => uint256 balance) private s_donorsAndBalance; // donorToTokenBalance

    //////////////////////
    // Functions        //
    //////////////////////
    constructor(bytes32 _name, address _beneficiary, address _stablecoin, uint256 _targetAmount) {
        i_name = _name;
        i_owner = msg.sender;
        i_beneficiary = _beneficiary;
        i_stablecoin = _stablecoin;
        i_targetAmount = _targetAmount;
    }

    ///////////////////////////////
    // Public Functions          //
    ///////////////////////////////
    function deposit(address depositor, address token, uint256 amount) public {
        require(token == i_stablecoin, "Donation must be made in this vault's stablecoin");
        require(IERC20(token).transferFrom(depositor, address(this), amount), "ERC20 Token transfer failed");
        s_vaultBalance += amount; // track total balance of the vault
        s_donorsAndBalance[depositor] += amount; // track total balance of depositor
    }

    function distribute() public {
        // check if target amount reached & conditions satisfied and distribute donations to beneficiary address
        if (s_vaultBalance > i_targetAmount) {
            require(IERC20(i_stablecoin).transfer(i_beneficiary, s_vaultBalance), "ERC20 Token transfer failed");
        }
    }

    /////////////////////////////////////////////
    // Public & External View Functions        //
    /////////////////////////////////////////////
    function getName() public view returns (bytes32) {
        return i_name;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getBeneficiary() public view returns (address) {
        return i_beneficiary;
    }

    function getStablecoin() public view returns (address) {
        return i_stablecoin;
    }

    function getTargetAmount() public view returns (uint256) {
        return i_targetAmount;
    }

    function getBalanceOfVault() public view returns (uint256 totalBalance) {
        return s_vaultBalance;
    }
}
