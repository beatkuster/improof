// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { Script } from "forge-std/Script.sol";
import { VaultFactory } from "../contracts/VaultFactory.sol";
import "./DeployHelpers.s.sol";

contract DeployVaultFactory is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner returns (VaultFactory) {
        VaultFactory vaultFactory = new VaultFactory();

        return (vaultFactory);
    }
}
