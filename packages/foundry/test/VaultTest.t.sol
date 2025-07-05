// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test, console } from "forge-std/Test.sol";
import { Vault } from "../contracts/Vault.sol";
import { DeployVault } from "../script/DeployVault.s.sol";
import { HelperConfig } from "../script/HelperConfig.s.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract VaultTest is Test {
    Vault vault;
    HelperConfig config;
    address beneficiary;
    address usdc;
    uint256 targetAmount;

    address USER_BOB = makeAddr("tester_bob");
    address USER_ALICE = makeAddr("tester_alice");

    uint256 constant STARTING_BALANCE = 1 ether;
    uint256 constant DEPOSIT_INITAL = 799;

    // modifiers
    modifier usdcDeposited() {
        vm.startPrank(USER_BOB);
        ERC20Mock(usdc).approve(address(vault), STARTING_BALANCE);
        vault.deposit(USER_BOB, usdc, DEPOSIT_INITAL);
        vm.stopPrank();
        _;
    }

    // setUp() is executed before EACH test
    function setUp() external {
        // deploying new Vault on testnet
        DeployVault deployVault = new DeployVault();
        (vault, config) = deployVault.run();
        (beneficiary, usdc) = config.activeNetworkConfig();

        // mint our test users some initial balance of USDC
        ERC20Mock(usdc).mint(USER_ALICE, STARTING_BALANCE);
        ERC20Mock(usdc).mint(USER_BOB, STARTING_BALANCE);

        console.log("Finished execution of setUp()");
    }

    function testDonateUsdc() public {
        vm.startPrank(USER_BOB);
        ERC20Mock(usdc).approve(address(vault), STARTING_BALANCE);
        vault.deposit(USER_BOB, usdc, DEPOSIT_INITAL);
        vm.stopPrank();
        assertEq(vault.getBalanceOfVault(), DEPOSIT_INITAL);
    }
}
