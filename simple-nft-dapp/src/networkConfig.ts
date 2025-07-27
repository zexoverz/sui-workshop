import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        // TODO: Update with your deployed contract address
        simpleArtNFT: "0x0",
        collectionId: "0x0",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        // replacce with your deployed contract address
        simpleArtNFT:
          "0x2f29e18b0894ca8bdad6cb069751d647590e221baf3a630a6760be7b4f6c697c",
        // replacce with your collection id
        collectionId:
          "0x6d22771bec18c7f73c1ace52867bb259fef00d00a413f31c45e3f4c1b4148e5c",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // TODO: Update with your deployed contract address
        simpleArtNFT: "0x0",
        collectionId: "0x0",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
