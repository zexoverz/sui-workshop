import { useGetUserNFT } from "@/hooks/use-get-user-nft";
import { Card, CardContent } from "./ui/card";
import { Eye, Heart } from "lucide-react";

export function NFTGrid() {
  const [data] = useGetUserNFT();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data &&
          data.map((nft, index) => {
            const content = nft.data?.content;
            // @ts-expect-error there is
            const fields = content?.fields;
            return (
              <Card
                key={nft.data?.objectId || index}
                className="bg-[#313244] border-[#45475a] hover:border-[#cba6f7] transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={fields?.image_url || "/placeholder.png"}
                      alt={fields?.name || "NFT"}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#cdd6f4] mb-2">
                      {fields?.name || "Unnamed NFT"}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#f38ba8]">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">
                          {Math.random().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {data?.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-[#6c7086] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#bac2de] mb-2">
            No NFTs found
          </h3>
          <p className="text-[#a6adc8]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </>
  );
}
