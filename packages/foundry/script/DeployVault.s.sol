// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "forge-std/Script.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import { Vault } from "../contracts/Vault.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import "./DeployHelpers.s.sol";

contract DeployVault is ScaffoldETHDeploy {
    // Hardcoded values but this script will never be used for mainnet due to factory pattern.
    uint256 constant TARGET_AMOUNT = 5000e6; // 5000 USDC
    bytes32 constant NAME = "SaveForestVault";

    function run() external ScaffoldEthDeployerRunner returns (Vault, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();

        (address beneficiary, address usdc) = helperConfig.activeNetworkConfig();

        // Due to the ScaffoldEthDeployerRunner modifier, we do not need to call vm.start/stopBroadcast()
        Vault vault = new Vault(NAME, beneficiary, usdc, TARGET_AMOUNT);
        return (vault, helperConfig);
    }
}
