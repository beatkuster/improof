// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployYourContract } from "./DeployYourContract.s.sol";
import { DeployUsdcMock } from "./DeployUsdcMock.s.sol";
import { DeployVault } from "./DeployVault.s.sol";
import { DeployVaultFactory } from "./DeployVaultFactory.s.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        //DeployYourContract deployYourContract = new DeployYourContract();
        //deployYourContract.run();

        DeployUsdcMock deployUsdcMock = new DeployUsdcMock();
        deployUsdcMock.run();

        //DeployVault deployVault = new DeployVault();
        //deployVault.run();

        DeployVaultFactory deployVaultFactory = new DeployVaultFactory();
        deployVaultFactory.run();
    }
}
