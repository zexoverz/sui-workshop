import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

export function useCreateCollection() {
  const account = useCurrentAccount();
  const simpleArtNFT = useNetworkVariable("simpleArtNFT");
  const suiClient = useSuiClient();
  const txQuery = useSignAndExecuteTransaction();
  const coinQuery = useSuiClientQuery(
    "getCoins",
    {
      owner: account?.address!,
      coinType: "0x2::sui::SUI",
    },
    { enabled: account !== null },
  );

  const query = useMutation({
    onError: (error) => {
      console.log(error);
    },
    mutationKey: ["createMintTransaction", coinQuery.data?.data, account],
    mutationFn: async () => {
      if (!account) return;

      const tx = new Transaction();
      tx.moveCall({
        target: `${simpleArtNFT}::simple_art_nft::create_collection`,
        arguments: [
          tx.pure("string", "My Art Collection"),
          tx.pure("string", "Simple NFT Collection"),
          tx.pure("u64", 100),
          tx.pure("u64", 10_000_000),
          tx.pure("u64", 604800000),
          tx.object("0x6"),
        ],
      });

      const { digest } = await txQuery.mutateAsync({ transaction: tx });
      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
        },
      });
      console.log(effects?.created?.[0].reference.objectId);
    },
  });

  return query;
}

export function useOpenCollection() {
  const account = useCurrentAccount();
  const simpleArtNFT = useNetworkVariable("simpleArtNFT");
  const suiClient = useSuiClient();
  const txQuery = useSignAndExecuteTransaction();
  const coinQuery = useSuiClientQuery(
    "getCoins",
    {
      owner: account?.address!,
      coinType: "0x2::sui::SUI",
    },
    { enabled: account !== null },
  );

  const query = useMutation({
    onError: (error) => {
      console.log(error);
    },
    mutationKey: ["createMintTransaction", coinQuery.data?.data, account],
    mutationFn: async () => {
      if (!account) return;

      const tx = new Transaction();
      tx.moveCall({
        target: `${simpleArtNFT}::simple_art_nft::activate_minting`,
        arguments: [
          tx.object("0x6d22771bec18c7f73c1ace52867bb259fef00d00a413f31c45e3f4c1b4148e5c"),
          tx.object("0x4e5fa113bb12e8bc8a048f2f72aaafa6518c7d0ad90a1f1fb8e3a4c49f380bac"),
        ],
      });

      const { digest } = await txQuery.mutateAsync({ transaction: tx });
      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
        },
      });
      console.log(effects?.created?.[0].reference.objectId);
    },
  });

  return query;
}
