"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { AddressInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
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
    name: "getBeneficiary",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTargetAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBalanceOfVault",
    inputs: [],
    outputs: [{ name: "totalBalance", type: "uint256", internalType: "uint256" }],
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
    name: "getOwner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
] as const;

const VaultRow = ({ vaultAddress, index }: { vaultAddress: string; index: number }) => {
  const { data: vaultName } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getName',
  });

  const { data: beneficiary } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getBeneficiary',
  });

  const { data: targetAmount } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getTargetAmount',
  });

  const { data: stablecoinAddress } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getStablecoin',
  });

  const { data: balance } = useReadContract({
    address: stablecoinAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [vaultAddress],
  });

  // Convert bytes32 name to string
  const nameStr = vaultName ? 
    Buffer.from(vaultName.slice(2), 'hex').toString('utf8').replace(/\0/g, '') : 
    'Loading...';

  const balanceFormatted = balance ? formatUnits(balance, 6) : '0';
  const targetAmountFormatted = targetAmount ? formatUnits(targetAmount, 6) : '0';
  
  // Calculate progress percentage
  const balanceNum = parseFloat(balanceFormatted);
  const targetNum = parseFloat(targetAmountFormatted);
  const progressPercentage = targetNum > 0 ? Math.round((balanceNum / targetNum) * 100) : 0;
  
  // Debug logging
  console.log('Progress calculation:', {
    vaultAddress,
    balance: balance?.toString(),
    targetAmount: targetAmount?.toString(),
    balanceFormatted,
    targetAmountFormatted,
    balanceNum,
    targetNum,
    progressPercentage
  });

  return (
    <tr key={index}>
      <td>
        <div className="font-mono text-sm">
          {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
        </div>
      </td>
      <td>{nameStr}</td>
      <td>
        <div className="font-mono text-sm">
          {beneficiary ? `${beneficiary.slice(0, 6)}...${beneficiary.slice(-4)}` : 'Loading...'}
        </div>
      </td>
      <td>
        {parseFloat(balanceFormatted).toFixed(2)} USDC
        {balance && (
          <div className="text-xs text-gray-500">
            Raw: {balance.toString()}
          </div>
        )}
      </td>
      <td>
        {parseFloat(targetAmountFormatted).toFixed(2)} USDC
        {targetAmount && (
          <div className="text-xs text-gray-500">
            Raw: {targetAmount.toString()}
          </div>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <progress 
            className="progress progress-primary w-20" 
            value={Math.min(balanceNum, targetNum)} 
            max={targetNum || 1}
          />
          <span className="text-sm">
            {progressPercentage}%
          </span>
          <div className="text-xs text-gray-500">
            {balanceNum.toFixed(2)} / {targetNum.toFixed(2)} = {progressPercentage}%
          </div>
        </div>
      </td>
    </tr>
  );
};

const Donate: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [vaultName, setVaultName] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [addressOfStablecoinCreate, setAddressOfStablecoinCreate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const { writeContractAsync: createVault, isMining } = useScaffoldWriteContract({
    contractName: "VaultFactory",
  });

  const { data: userVaults, refetch: refetchVaults } = useScaffoldReadContract({
    contractName: "VaultFactory",
    functionName: "getVaultsByBeneficiary",
    args: [connectedAddress],
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 px-4">
        {/* Create Improof Vault*/}
        {
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
            <div className="text-xl">Create your ImProof Vault</div>

            <div className="w-full flex flex-col space-y-2">
              <InputBase placeholder="Name of your Vault" value={vaultName} onChange={value => setVaultName(value)} />

              <InputBase
                placeholder="Description of your Vault"
                value={vaultDescription}
                onChange={value => setVaultDescription(value)}
              />

              <AddressInput
                placeholder="Beneficiary Address"
                value={beneficiaryAddress}
                onChange={setBeneficiaryAddress}
              />

              <IntegerInput
                placeholder="Target Amount (in USD)"
                value={targetAmount}
                onChange={value => setTargetAmount(value?.toString() || "")}
                disableMultiplyBy1e18={true}
              />

              <select
                className="select select-bordered"
                value={addressOfStablecoinCreate}
                onChange={e => setAddressOfStablecoinCreate(e.target.value)}
              >
                <option value="" disabled>
                  Select Vault Currency
                </option>
                <option value="0xb19b36b1456e65e3a6d514d3f715f204bd59f431">USDC Mock (Local)</option>
              </select>
            </div>

            <button
              className={`btn btn-secondary mt-2 ${isMining ? "loading" : ""}`}
              onClick={handleCreateVault}
              disabled={isMining || !connectedAddress}
            >
              {isMining ? "Creating Vault..." : "Create Vault"}
            </button>
          </div>
        }

        {/* Vault Table */}
        {connectedAddress && (
          <div className="w-full max-w-4xl mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Vaults</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Vault Address</th>
                    <th>Name</th>
                    <th>Beneficiary</th>
                    <th>Current Balance</th>
                    <th>Target Amount</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {userVaults && userVaults.length > 0 ? (
                    userVaults.map((vaultAddress: string, index: number) => (
                      <VaultRow key={vaultAddress} vaultAddress={vaultAddress} index={index} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500">
                        {connectedAddress ? "No vaults found for this address" : "Please connect your wallet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );

  async function handleCreateVault() {
    if (!connectedAddress) {
      notification.error("Please connect your wallet to create a vault");
      return;
    }

    if (!vaultName.trim()) {
      notification.error("Please enter a vault name");
      return;
    }

    if (!beneficiaryAddress) {
      notification.error("Please enter a beneficiary address");
      return;
    }

    if (!addressOfStablecoinCreate) {
      notification.error("Please select a vault currency");
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      notification.error("Please enter a valid target amount");
      return;
    }

    try {
      // Convert vault name to bytes32 format
      const nameBytes32 =
        `0x${Buffer.from(vaultName.slice(0, 32), "utf8").toString("hex").padEnd(64, "0")}` as `0x${string}`;

      // Convert target amount to USDC units (6 decimals for USDC)
      const targetAmountWei = parseUnits(targetAmount, 6);

      await createVault({
        functionName: "createVault",
        args: [nameBytes32, beneficiaryAddress, addressOfStablecoinCreate, targetAmountWei],
      });

      notification.success("Vault created successfully!");

      // Refresh vault list
      refetchVaults();

      // Reset form
      setVaultName("");
      setVaultDescription("");
      setBeneficiaryAddress("");
      setAddressOfStablecoinCreate("");
      setTargetAmount("");
    } catch (error) {
      console.error("Error creating vault:", error);
      notification.error("Failed to create vault. Please try again.");
    }
  }
};

export default Donate;
