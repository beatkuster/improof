import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { StablecoinInfo, getStablecoinsForChain } from "~~/utils/stablecoinConfig";

/**
 * Custom hook to get available stablecoins for the current network
 * Automatically updates local development addresses from deployed contracts
 */
export function useStablecoins() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();

  // Get deployed ERC20Mock contract info for local networks
  const { data: erc20MockContract } = useDeployedContractInfo({
    contractName: "ERC20Mock",
  });

  const stablecoins = useMemo(() => {
    const currentChainId = isConnected ? chainId : targetNetwork.id;
    let availableStablecoins = getStablecoinsForChain(currentChainId);

    // Update local development mock addresses if available
    if (erc20MockContract && (currentChainId === 31337 || currentChainId === 1337)) {
      availableStablecoins = availableStablecoins.map(coin => {
        if (coin.symbol === "USDC" && coin.name.includes("Mock")) {
          return {
            ...coin,
            address: erc20MockContract.address as `0x${string}`,
          };
        }
        return coin;
      });
    }

    return availableStablecoins;
  }, [chainId, targetNetwork.id, isConnected, erc20MockContract]);

  const isNetworkSupported = stablecoins.length > 0;
  const currentChainId = isConnected ? chainId : targetNetwork.id;

  return {
    stablecoins,
    isNetworkSupported,
    currentChainId,
    currentNetworkName: isConnected ? targetNetwork.name : targetNetwork.name,
  };
}
