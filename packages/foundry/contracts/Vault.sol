// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract Vault is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;
    //////////////////////
    // State Variables  //
    //////////////////////

    bytes32 private immutable i_name;
    address private immutable i_owner;
    address private immutable i_beneficiary;
    address private immutable i_stablecoin;
    uint256 private immutable i_targetAmount;
    //address private immutable i_router;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_donId;

    uint32 private constant GAS_LIMIT = 300000;

    uint256 private s_vaultBalance; // total balance of the vault
    mapping(address donor => uint256 balance) private s_donorsAndBalance; // donorToTokenBalance
    mapping(bytes32 => bool) private s_pendingRequests;
    bytes private s_lastResponse;
    bytes private s_lastError;
    bool private s_conditionsMet;

    string private constant IPFS_SOURCE =
        "const ipfsUrl = `https://bafybeigsmfbypkc2qw4goq2wvgk526ay4jryedtv7h6obtjmurwxxqvxea.ipfs.dweb.link?filename=GlobalForestWatchAPI_Response.json`;"
        "const response = await Functions.makeHttpRequest({" "  url: ipfsUrl," "  method: 'GET'" "});"
        "if (response.error) {" "  throw new Error(`IPFS fetch failed: ${response.error}`);" "}"
        "const data = response.data;" "return Functions.encodeUint256(parseInt(data.treesPlanted) || 0);";

    //////////////////////
    // Functions        //
    //////////////////////
    constructor(
        bytes32 _name,
        address _beneficiary,
        address _stablecoin,
        uint256 _targetAmount,
        address _router,
        uint64 _subscriptionId,
        bytes32 _donId
    ) FunctionsClient(_router) {
        i_name = _name;
        i_owner = msg.sender;
        i_beneficiary = _beneficiary;
        i_stablecoin = _stablecoin;
        i_targetAmount = _targetAmount;
        //i_router = _router;
        i_subscriptionId = _subscriptionId;
        i_donId = _donId;
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

    function checkCondition() public returns (bytes32) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(IPFS_SOURCE);

        bytes32 requestId = _sendRequest(req.encodeCBOR(), i_subscriptionId, GAS_LIMIT, i_donId);

        s_pendingRequests[requestId] = true;
        return requestId;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        require(s_pendingRequests[requestId], "Request not found");

        s_pendingRequests[requestId] = false;

        if (err.length > 0) {
            s_lastError = err;
            return;
        }

        s_lastResponse = response;
        string memory jsonData = string(response);

        // Process the JSON data to determine if conditions are met
        _processIPFSData(jsonData);
    }

    function _processIPFSData(string memory) private {
        // The response is now encoded as uint256 representing treesPlanted count
        uint256 treesPlanted = abi.decode(s_lastResponse, (uint256));

        // Check if treesPlanted is >= 200
        s_conditionsMet = treesPlanted >= 200;

        // Automatically try to distribute if conditions are met
        if (s_conditionsMet) {
            distribute();
        }
    }

    function distribute() public {
        // check if target amount reached & conditions satisfied and distribute donations to beneficiary address
        if (s_vaultBalance >= i_targetAmount && s_conditionsMet) {
            require(IERC20(i_stablecoin).transfer(i_beneficiary, s_vaultBalance), "ERC20 Token transfer failed");
            s_vaultBalance = 0; // Reset vault balance after distribution
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

    function getConditionsMet() public view returns (bool) {
        return s_conditionsMet;
    }

    function getLastResponse() public view returns (bytes memory) {
        return s_lastResponse;
    }

    function getLastError() public view returns (bytes memory) {
        return s_lastError;
    }

    function getTreesPlanted() public view returns (uint256) {
        if (s_lastResponse.length == 0) return 0;
        return abi.decode(s_lastResponse, (uint256));
    }
}
