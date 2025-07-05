"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { Address, AddressInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";


const Donate: NextPage = () => {

      const [vaultName, setVaultName] = useState("");
      const [vaultDescription, setVaultDescription] = useState("");
      const [addressOfStablecoinCreate, setAddressOfStablecoinCreate] = useState("");

  return (
    <>

            <div className="flex items-center flex-col flex-grow pt-10 px-4">
                {/* Create Improof Vault*/}
                {<div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
                    <div className="text-xl">Create your ImProof Vault</div>

                    <div className="w-full flex flex-col space-y-2">
                        <InputBase
                            placeholder="Name of your Vault"
                            value={vaultName}
                            onChange={value => setVaultName(value)}
                        />

                        <InputBase
                            placeholder="Description of your Vault"
                            value={vaultDescription}
                            onChange={value => setVaultDescription(value)}
                        />

                        <select
                            className="select select-bordered"
                            value={addressOfStablecoinCreate}
                            onChange={e => setAddressOfStablecoinCreate(e.target.value)}
                        >
                            <option value="" disabled>
                                Select Vault Currency
                            </option>
                            <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">
                                US-Dollar (USDC)
                            </option>
                        </select>
                    </div>

                    <button
                        className="btn btn-secondary mt-2"
                    >
                        Create Vault!
                    </button>
                </div>}
            </div>
    </>
  );
};

export default Donate;