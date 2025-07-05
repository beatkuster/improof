"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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
                <option value="0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35">USDC Mock (Local)</option>
              </select>
            </div>

            <button
              className={`btn btn-secondary mt-2 ${isMining ? "loading" : ""}`}
              onClick={handleCreateVault}
              disabled={isMining || !connectedAddress}
            >
              {isMining ? "Creating Vault..." : "Create Vault!"}
            </button>
          </div>
        }
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

      // Convert target amount to wei (assuming 6 decimals for USDC)
      const targetAmountWei = parseEther(targetAmount);

      await createVault({
        functionName: "createVault",
        args: [nameBytes32, beneficiaryAddress, addressOfStablecoinCreate, targetAmountWei],
      });

      notification.success("Vault created successfully!");

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
