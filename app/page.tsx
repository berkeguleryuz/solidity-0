"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CampaignList } from "@/components/campaign-list";
import { CreateCampaign } from "@/components/create-campaign";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="transition-all">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0 text-center md:text-left">
              Bağış <span className="text-lime-500">Kutusu</span>
            </h1>
          </div>

          <div className="transition-all">
            <ConnectButton />
          </div>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8 rounded-xl shadow-md transition-all">
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-neutral-100">
            Blockchain Temelli{" "}
            <span className="text-lime-500">Bağış Platformu</span>
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-5 text-sm md:text-base">
            Ethereum blockchain teknolojisi kullanarak güvenli, şeffaf ve
            aracısız bağış kampanyaları oluşturmanızı ve katılmanızı sağlar.
          </p>

          {isConnected ? (
            <div className="space-y-6">
              <div className="transition-all duration-300">
                <CreateCampaign />
              </div>

              <CampaignList />
            </div>
          ) : (
            <div className="bg-neutral-800 border-l-4 border-lime-500 text-neutral-300 p-4 rounded-md transition-all">
              <p className="font-medium text-sm">
                Cüzdanınızı bağlayarak kampanyalara erişebilir ve yeni
                kampanyalar oluşturabilirsiniz.
              </p>
            </div>
          )}
        </div>

        <footer className="text-center text-neutral-500 text-xs transition-all">
          <p>- 2025 Bağış Kutusu. Tüm hakları saklıdır. -</p>
        </footer>
      </div>
    </div>
  );
}
