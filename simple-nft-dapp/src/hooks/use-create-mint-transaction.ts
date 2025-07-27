import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { pinata } from "@/service/pinata";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { formatSUI } from "@/lib/utils";

export type CreateMintTransactionDto = {
  name: string;
  description: string;
  imageFile: File | null;
  collectionId: string;
};

export function useCreateMintTransaction() {
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
      toast.error((error as Error).message, { id: "mint-nft" });
    },
    mutationKey: ["createMintTransaction", coinQuery.data?.data, account],
    mutationFn: async ([dto, requiredAmount, onSucces]: [
      dto: CreateMintTransactionDto,
      requiredAmount: number,
      onSucces: () => unknown,
    ]) => {
      if (!account) return;
      if (!dto.imageFile) return;

      const suitableCoin = coinQuery.data?.data.find(
        (x) => +x.balance > requiredAmount,
      );
      if (!suitableCoin) {
        throw new Error(
          `Insufficient SUI balance. Need ${formatSUI(requiredAmount)} SUI`,
        );
      }

      toast.loading("Uploading Image...", { id: "mint-nft" });
      const response = await pinata.upload.public.file(dto.imageFile);
      const link = `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${response.cid}`;

      const tx = new Transaction();

      const [mintCoin] = tx.splitCoins(tx.gas, [requiredAmount]);

      tx.moveCall({
        target: `${simpleArtNFT}::simple_art_nft::mint_nft`,
        arguments: [
          tx.object(dto.collectionId),
          tx.pure("string", dto.name),
          tx.pure("string", dto.description),
          tx.pure("string", link),
          mintCoin,
          tx.object("0x6"),
        ],
      });

      toast.loading("Sending Transaction...", { id: "mint-nft" });
      const { digest } = await txQuery.mutateAsync({ transaction: tx });
      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
        },
      });
      onSucces();
      console.log(effects?.created?.[0].reference.objectId);
      toast.success("Mint Success", { id: "mint-nft" });
    },
  });

  return query;
}
