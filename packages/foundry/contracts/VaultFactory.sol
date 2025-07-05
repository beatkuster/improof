// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Vault } from "./Vault.sol";

contract VaultFactory {
    //////////////////////
    // State Variables  //
    //////////////////////
    Vault[] public s_listOfVaults;
    mapping(address => Vault[]) public s_beneficiaryToVaults;

    ///////////////////////////////
    // Public Functions          //
    ///////////////////////////////
    function createVault(bytes32 name, address beneficiary, address stablecoin, uint256 targetAmount)
        public
        returns (Vault)
    {
        Vault vault = new Vault(name, beneficiary, stablecoin, targetAmount);
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
