// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract DeployUsdcMock is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new ERC20Mock("USDC", "USDC", 6, msg.sender, 1000e8);
    }
}
