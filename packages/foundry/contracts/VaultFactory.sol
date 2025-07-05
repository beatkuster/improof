// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Vault } from "./Vault.sol";

contract VaultFactory {
    //////////////////////
    // State Variables  //
    //////////////////////
    address private constant CHAINLINK_ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278;
    uint64 private constant SUBSCRIPTION_ID = 404;
    bytes32 private constant DON_ID = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;

    Vault[] public s_listOfVaults;
    mapping(address => Vault[]) public s_beneficiaryToVaults;

    ///////////////////////////////
    // Public Functions          //
    ///////////////////////////////
    function createVault(bytes32 name, address beneficiary, address stablecoin, uint256 targetAmount)
        public
        returns (Vault)
    {
        Vault vault = new Vault(name, beneficiary, stablecoin, targetAmount, CHAINLINK_ROUTER, SUBSCRIPTION_ID, DON_ID);
        s_listOfVaults.push(vault);
        s_beneficiaryToVaults[beneficiary].push(vault);
        return vault;
    }

    /////////////////////////////////////////////
    // Public & External View Functions        //
    /////////////////////////////////////////////
    function getVaultCount() public view returns (uint256) {
        return s_listOfVaults.length;
    }

    function getVaultAddressByIndex(uint256 index) public view returns (address) {
        return address(s_listOfVaults[index]);
    }

    function getVaultsByBeneficiary(address beneficiary) public view returns (Vault[] memory) {
        return s_beneficiaryToVaults[beneficiary];
    }

    function getAllVaults() public view returns (Vault[] memory) {
        return s_listOfVaults;
    }
}
