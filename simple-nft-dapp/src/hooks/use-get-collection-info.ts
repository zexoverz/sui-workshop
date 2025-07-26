import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useMemo } from "react";

export type CollectionInfo = {
  name: string;
  description: string;
  creator: string;
  totalSupply: number;
  maxSupply: number;
  mintPrice: number;
  isActive: boolean;
  mintStartTime: number;
  mintEndTime: number;
};

export function useGetCollectionInfo(collectionId: string) {
  const { data, ...rest } = useSuiClientQuery("getObject", {
    id: collectionId,
    options: { showContent: true, showOwner: true },
  });

  const parsed = useMemo(() => {
    if (data?.data?.content?.dataType != "moveObject") return null;
    const fields = data.data.content.fields;

    return {
      name: Reflect.get(fields, "name"),
      description: Reflect.get(fields, "description"),
      creator: Reflect.get(fields, "creator"),
      totalSupply: parseInt(Reflect.get(fields, "total_supply")),
      maxSupply: parseInt(Reflect.get(fields, "max_supply")),
      mintPrice: parseInt(Reflect.get(fields, "mint_price")),
      isActive: Reflect.get(fields, "is_active"),
      mintStartTime: parseInt(Reflect.get(fields, "mint_start_time")),
      mintEndTime: parseInt(Reflect.get(fields, "mint_end_time")),
    } as CollectionInfo;
  }, [data?.data]);

  return [parsed, rest] as const;
}
