"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const VAULT_ABI = [
  {
    type: "function",
    name: "getName",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStablecoin",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "depositor", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;

const VaultOption = ({ vaultAddress }: { vaultAddress: string }) => {
  const { data: vaultName } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getName",
  });

  const nameStr = vaultName ? Buffer.from(vaultName.slice(2), "hex").toString("utf8").replace(/\0/g, "") : "Loading...";
  const shortAddress = `${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`;

  return (
    <option value={vaultAddress}>
      {nameStr} ({shortAddress})
    </option>
  );
};

const Donate: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedVault, setSelectedVault] = useState("");
  const [donationAmount, setDonationAmount] = useState("");

  // Clear state on component mount to reset approve button state
  useEffect(() => {
    setSelectedVault("");
    setDonationAmount("");
  }, []);

  const { data: allVaults } = useScaffoldReadContract({
    contractName: "VaultFactory",
    functionName: "getAllVaults",
  });

  const { data: selectedVaultStablecoin, error: stablecoinError } = useReadContract({
    address: selectedVault as `0x${string}`,
    abi: VAULT_ABI,
    functionName: "getStablecoin",
    query: {
      enabled: !!selectedVault,
    },
  });

  // Debug logging
  console.log("Debug info:", {
    selectedVault,
    selectedVaultStablecoin,
    stablecoinError,
  });

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: selectedVaultStablecoin as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [connectedAddress!, selectedVault as `0x${string}`],
    query: {
      enabled: !!connectedAddress && !!selectedVault && !!selectedVaultStablecoin,
    },
  });

  // Check user's USDC balance
  const { data: userBalance } = useReadContract({
    address: selectedVaultStablecoin as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [connectedAddress!],
    query: {
      enabled: !!connectedAddress && !!selectedVaultStablecoin,
    },
  });

  const { writeContractAsync: approveToken, isPending: isApproving } = useWriteContract();

  const { writeContractAsync: donateToVault, isPending: isDonating } = useWriteContract();

  const handleApprove = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!selectedVault) {
      notification.error("Please select a vault");
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      notification.error("Please enter a valid donation amount");
      return;
    }

    if (!selectedVaultStablecoin) {
      console.log("Stablecoin debug:", { selectedVault, selectedVaultStablecoin, stablecoinError });
      notification.error(`Unable to determine vault's stablecoin. Check console for details.`);
      return;
    }

    try {
      // Approve maximum amount to avoid repeated approvals
      const maxAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      await approveToken({
        address: selectedVaultStablecoin as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [selectedVault as `0x${string}`, maxAmount],
      });
      
      // Refetch allowance after successful approval with a small delay
      setTimeout(async () => {
        await refetchAllowance();
      }, 1000);
      notification.success("Approval successful!");
    } catch (error) {
      console.error("Error approving:", error);
      notification.error("Failed to approve tokens");
    }
  };

  const handleDonate = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!selectedVault) {
      notification.error("Please select a vault");
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      notification.error("Please enter a valid donation amount");
      return;
    }

    // Check if user has sufficient balance
    const amountWei = parseUnits(donationAmount, 6);
    if (!userBalance || userBalance < amountWei) {
      notification.error(`Insufficient USDC balance. You need ${donationAmount} USDC but only have ${userBalance ? formatUnits(userBalance, 6) : "0"} USDC.`);
      return;
    }

    try {
      const amountWei = parseUnits(donationAmount, 6);
      console.log("Donation parameters:", {
        vault: selectedVault,
        depositor: connectedAddress,
        token: selectedVaultStablecoin,
        amount: amountWei.toString(),
        currentAllowance: currentAllowance?.toString(),
      });
      
      await donateToVault({
        address: selectedVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [connectedAddress!, selectedVaultStablecoin!, amountWei],
      });
      notification.success("Donation successful!");
      setSelectedVault("");
      setDonationAmount("");
    } catch (error) {
      console.error("Error donating:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      notification.error("Failed to donate. Check console for details.");
    }
  };

  const donationAmountWei = donationAmount ? parseUnits(donationAmount, 6) : 0n;
  const isApproved = currentAllowance && donationAmountWei > 0n && currentAllowance >= donationAmountWei;

  // Debug approval state
  console.log("Approval state:", {
    donationAmount,
    donationAmountWei: donationAmountWei.toString(),
    currentAllowance: currentAllowance?.toString(),
    isApproved,
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        {/* Donation Form */}
        {connectedAddress && (
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 w-full max-w-lg">
            <div className="text-xl">Make a Donation</div>

            <div className="w-full flex flex-col space-y-2">
              <select
                className="select select-bordered"
                value={selectedVault}
                onChange={e => setSelectedVault(e.target.value)}
              >
                <option value="" disabled>
                  Select Vault to Donate To
                </option>
                {allVaults && allVaults.length > 0 ? (
                  allVaults.map((vaultAddress: string) => (
                    <VaultOption key={vaultAddress} vaultAddress={vaultAddress} />
                  ))
                ) : (
                  <option disabled>No vaults available</option>
                )}
              </select>

              <IntegerInput
                placeholder="Donation Amount (in USDC)"
                value={donationAmount}
                onChange={value => setDonationAmount(value?.toString() || "")}
                disableMultiplyBy1e18={true}
              />

              <div className="flex gap-2">
                <button
                  className={`btn btn-primary flex-1 ${isApproving ? "loading" : ""}`}
                  onClick={handleApprove}
                  disabled={isApproving || !selectedVault || !donationAmount || !!isApproved}
                >
                  {isApproving ? "Approving..." : isApproved ? "Approved" : "Approve"}
                </button>

                <button
                  className={`btn btn-secondary flex-1 ${isDonating ? "loading" : ""}`}
                  onClick={handleDonate}
                  disabled={isDonating || !selectedVault || !donationAmount || !isApproved}
                >
                  {isDonating ? "Donating..." : "Donate"}
                </button>
              </div>

              {selectedVault && donationAmount && (
                <div className="text-sm text-gray-500 text-center">
                  {isApproved
                    ? "✅ Tokens approved, ready to donate"
                    : "⏳ Please approve tokens first"}
                </div>
              )}
            </div>
          </div>
        )}

        {!connectedAddress && (
          <div className="text-center text-lg text-gray-500 mt-8">
            Please connect your wallet to make donations
          </div>
        )}
      </div>
    </>
  );
};

export default Donate;
