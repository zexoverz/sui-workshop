import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { useNetworkVariable } from "../networkConfig";

export function useGetUserNFT() {
  const account = useCurrentAccount();
  const simpleArtNFT = useNetworkVariable("simpleArtNFT");
  const { data, ...rest } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        StructType: `${simpleArtNFT}::simple_art_nft::SimpleNFT`,
      },
      options: { showContent: true, showOwner: true },
    },
    { enabled: account !== null },
  );

  const parsed = useMemo(() => {
    return data?.data;
  }, [data?.data]);

  return [parsed, rest] as const;
}
