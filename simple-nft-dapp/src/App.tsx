import { ConnectButton } from "@mysten/dapp-kit";
import {
  useGetCollectionInfo,
} from "./hooks/use-get-collection-info";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Zap,
  Eye,
} from "lucide-react";
import { useNetworkVariable } from "./networkConfig";
import { MintSection } from "./components/mint-section";
import { NFTGrid } from "./components/nft-grid";
import { formatSUI } from "./lib/utils";

export function App() {
  const collectionID = useNetworkVariable("collectionId");
  const [collectionInfo] = useGetCollectionInfo(collectionID);

  if (!collectionInfo) return <div>NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4]">
      <div className="bg-[#181825] border-b border-[#313244]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#cba6f7] to-[#f38ba8] flex justify-center">
              <span className="text-2xl font-bold text-[#11111b]"></span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] bg-clip-text text-transparent">
                  {collectionInfo.name}
                </h1>
                {collectionInfo.isActive && (
                  <Badge className="bg-[#a6e3a1] text-[#11111b] animate-pulse">
                    Live Mint
                  </Badge>
                )}
              </div>
              <p className="text-[#bac2de] mb-2">
                Created by{" "}
                <span className="text-[#89b4fa] font-semibold">
                  {collectionInfo.creator}
                </span>
              </p>
              <p className="text-[#bac2de] mb-4 max-w-2xl">
                {collectionInfo.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#a6e3a1]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Floor</div>
                    <div className="font-semibold">1.2 SUI</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-[#89b4fa]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Owners</div>
                    <div className="font-semibold">3,247</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-[#f9e2af]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Volume</div>
                    <div className="font-semibold">1,234 SUI</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Eye className="w-4 h-4 text-[#fab387]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Supply</div>
                    <div className="font-semibold">
                      {collectionInfo.totalSupply.toLocaleString()}/
                      {collectionInfo.maxSupply.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <span className="w-4 h-4 text-[#f38ba8]">💎</span>
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Mint Price</div>
                    <div className="font-semibold">
                      {formatSUI(collectionInfo.mintPrice)} SUI
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <span className="w-4 h-4 text-[#94e2d5]">⏰</span>
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Status</div>
                    <div className="font-semibold text-[#a6e3a1]">
                      {collectionInfo.isActive ? "Minting" : "Sold Out"}
                    </div>
                  </div>
                </div>
              </div>
              <MintSection id={collectionID} collectionInfo={collectionInfo} />
            </div>
            <div className="self-end">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="mx-auto px-4 py-6">
        <NFTGrid />
      </div>
    </div>
  );
}

export default App;
