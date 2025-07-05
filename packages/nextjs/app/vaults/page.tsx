"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { InputBase, IntegerInput, Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useStablecoins } from "~~/hooks/useStablecoins";
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
        functionName: "getName",
    });

    const { data: beneficiary } = useReadContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getBeneficiary",
    });

    const { data: targetAmount } = useReadContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getTargetAmount",
    });

    const { data: stablecoinAddress } = useReadContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getStablecoin",
    });

    const { data: balance } = useReadContract({
        address: stablecoinAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [vaultAddress],
    });

    // Convert bytes32 name to string
    const nameStr = vaultName ? Buffer.from(vaultName.slice(2), "hex").toString("utf8").replace(/\0/g, "") : "Loading...";

    const balanceFormatted = balance ? formatUnits(balance, 6) : "0";
    const targetAmountFormatted = targetAmount ? formatUnits(targetAmount, 6) : "0";

    // Calculate progress percentage
    const balanceNum = parseFloat(balanceFormatted);
    const targetNum = parseFloat(targetAmountFormatted);
    const progressPercentage = targetNum > 0 ? Math.round((balanceNum / targetNum) * 100) : 0;

    // Debug logging
    console.log("Progress calculation:", {
        vaultAddress,
        balance: balance?.toString(),
        targetAmount: targetAmount?.toString(),
        balanceFormatted,
        targetAmountFormatted,
        balanceNum,
        targetNum,
        progressPercentage,
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
                {beneficiary ? (
                    <Address address={beneficiary} size="sm" format="short" />
                ) : (
                    <span className="text-gray-500">Loading...</span>
                )}
            </td>
            <td>
                {parseFloat(balanceFormatted).toFixed(2)} USDC
            </td>
            <td>
                {parseFloat(targetAmountFormatted).toFixed(2)} USDC
            </td>
            <td>
                <div className="flex items-center gap-2">
                    <progress
                        className="progress progress-primary w-20"
                        value={Math.min(balanceNum, targetNum)}
                        max={targetNum || 1}
                    />
                    <span className="text-sm">{progressPercentage}%</span>
                </div>
            </td>
            <td>
                <button 
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => {
                        // TODO: Implement check payout functionality
                        console.log("Check Status of vault:", vaultAddress);
                    }}
                >
                    Request Payout
                </button>
            </td>
        </tr>
    );
};

const Vaults: NextPage = () => {
    const { address: connectedAddress } = useAccount();
    const { stablecoins, isNetworkSupported, currentNetworkName } = useStablecoins();

    const [vaultName, setVaultName] = useState("");
    const [vaultDescription, setVaultDescription] = useState("");
    const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
    const [addressOfStablecoinCreate, setAddressOfStablecoinCreate] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [selectedStablecoin, setSelectedStablecoin] = useState<{ decimals: number; symbol: string } | null>(null);

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
                        <div className="text-xl">Create a Donation Vault</div>

                        <div className="w-full flex flex-col space-y-2">
                            <InputBase placeholder="Name of your Vault" value={vaultName} onChange={value => setVaultName(value)} />

                            <InputBase
                                placeholder="Description of your Vault"
                                value={vaultDescription}
                                onChange={value => setVaultDescription(value)}
                            />

                            <select
                                className="select select-bordered"
                                value={beneficiaryAddress}
                                onChange={e => setBeneficiaryAddress(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select Beneficiary Address
                                </option>
                                <option value="0xa53A13A80D72A855481DE5211E7654fAbDFE3526">
                                    0xa53A...3526
                                </option>
                                <option value="0x293159D545b9158DdaDAc4dA9F6507d47576416E">
                                    0x2931...416E
                                </option>
                            </select>

                            {/* Show ENS-resolved address details when selected */}
                            {beneficiaryAddress && beneficiaryAddress !== "" && (
                                <div className="mt-2 p-3 bg-base-200 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Selected Beneficiary:</div>
                                    <Address address={beneficiaryAddress} size="sm" format="short" />
                                </div>
                            )}

                            <IntegerInput
                                placeholder="Target Amount (in USD)"
                                value={targetAmount}
                                onChange={value => setTargetAmount(value?.toString() || "")}
                                disableMultiplyBy1e18={true}
                            />

                            <select
                                className="select select-bordered"
                                value={addressOfStablecoinCreate}
                                onChange={e => {
                                    const selectedAddress = e.target.value;
                                    setAddressOfStablecoinCreate(selectedAddress);
                                    // Find the selected stablecoin info for decimal handling
                                    const selectedCoin = stablecoins.find(coin => coin.address === selectedAddress);
                                    setSelectedStablecoin(
                                        selectedCoin ? { decimals: selectedCoin.decimals, symbol: selectedCoin.symbol } : null,
                                    );
                                }}
                            >
                                <option value="" disabled>
                                    {isNetworkSupported ? "Select Vault Currency" : `No stablecoins available on ${currentNetworkName}`}
                                </option>
                                {stablecoins.map(stablecoin => (
                                    <option key={stablecoin.address} value={stablecoin.address}>
                                        {stablecoin.name} ({stablecoin.symbol})
                                    </option>
                                ))}
                            </select>

                            {!isNetworkSupported && (
                                <div className="text-sm text-warning bg-warning/10 p-2 rounded">
                                    ⚠️ No stablecoins configured for {currentNetworkName}. Please switch to a supported network.
                                </div>
                            )}
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
                    <div className="w-full max-w-7xl mt-8">
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
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userVaults && userVaults.length > 0 ? (
                                        userVaults.map((vaultAddress: string, index: number) => (
                                            <VaultRow key={vaultAddress} vaultAddress={vaultAddress} index={index} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="text-center text-gray-500">
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

        if (!isNetworkSupported) {
            notification.error(`No stablecoins available on ${currentNetworkName}. Please switch networks.`);
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

            // Convert target amount using the correct decimals for the selected stablecoin
            const decimals = selectedStablecoin?.decimals || 6; // Default to 6 if not found
            const targetAmountWei = parseUnits(targetAmount, decimals);

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
            setSelectedStablecoin(null);
        } catch (error) {
            console.error("Error creating vault:", error);
            notification.error("Failed to create vault. Please try again.");
        }
    }
};

export default Vaults;
