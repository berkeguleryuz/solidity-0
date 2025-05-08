"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { formatEth, formatDate, calculateProgress, getRemainingTime, shortenAddress } from "@/lib/utils";
import { DONATION_ABI, DONATION_CONTRACT_ADDRESS } from "@/lib/contract";

interface CampaignCardProps {
  campaignId: bigint;
  owner: string;
  goal: bigint;
  startTime: number;
  endTime: number;
  totalDonated: bigint;
  goalReached: boolean;
  active: boolean;
  withdrawn: boolean;
}

export function CampaignCard({
  campaignId,
  owner,
  goal,
  startTime,
  endTime,
  totalDonated,
  goalReached,
  active,
  withdrawn
}: CampaignCardProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const { address } = useAccount();
  
  const { writeContract, isPending } = useWriteContract();
  
  const { data: myDonationData } = useReadContract({
    address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
    abi: DONATION_ABI,
    functionName: "getMyDonation",
    args: [campaignId],
  });
  
  // Tip güvenliği için donasyon verisini işle
  const myDonation = myDonationData ? BigInt(String(myDonationData)) : null;
  
  const progress = calculateProgress(totalDonated, goal);
  const isOwner = address && address.toLowerCase() === owner.toLowerCase();
  
  const handleDonate = () => {
    if (!donationAmount) return;
    
    writeContract({
      address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
      abi: DONATION_ABI,
      functionName: "donate",
      args: [campaignId],
      value: ethers.parseEther(donationAmount)
    });
  };
  
  const handleWithdraw = () => {
    writeContract({
      address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
      abi: DONATION_ABI,
      functionName: "withdraw",
      args: [campaignId]
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-100">
              Kampanya #{campaignId.toString()}
            </h3>
            <p className="text-xs text-neutral-400">
              Oluşturan: {shortenAddress(owner)}
            </p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${active 
              ? "bg-neutral-800 text-lime-500 border border-lime-800" 
              : "bg-neutral-800 text-neutral-400 border border-neutral-700"}`}
          >
            {active ? "Aktif" : "Pasif"}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">İlerleme</span>
            <span className="font-medium text-neutral-300">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5">
            <div 
              className="bg-lime-500 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <p className="text-neutral-400">Toplanan</p>
            <p className="font-medium text-neutral-200">{formatEth(totalDonated)} ETH</p>
          </div>
          <div>
            <p className="text-neutral-400">Hedef</p>
            <p className="font-medium text-neutral-200">{formatEth(goal)} ETH</p>
          </div>
          <div>
            <p className="text-neutral-400">Başlangıç</p>
            <p className="font-medium text-neutral-200">{formatDate(startTime)}</p>
          </div>
          <div>
            <p className="text-neutral-400">Kalan Süre</p>
            <p className="font-medium text-neutral-200">{getRemainingTime(endTime)}</p>
          </div>
          {myDonation && (
            <div className="col-span-2 mt-1 p-2 bg-neutral-800 rounded border border-neutral-700">
              <p className="text-neutral-400">Bağışım</p>
              <p className="font-medium text-lime-500">
                {formatEth(myDonation)} ETH
              </p>
            </div>
          )}
        </div>
        
        {active && !withdrawn && (
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="ETH Miktarı" 
                className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
              <button
                className="bg-lime-500 text-neutral-900 px-3 py-1.5 rounded text-sm font-medium transition-all hover:bg-lime-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                onClick={handleDonate}
                disabled={isPending}
              >
                {isPending ? "İşleniyor..." : "Bağış Yap"}
              </button>
            </div>
          </div>
        )}
        
        {isOwner && goalReached && !withdrawn && (
          <button
            className="mt-3 w-full bg-lime-500 text-neutral-900 py-2 rounded text-sm font-medium transition-all hover:bg-lime-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleWithdraw}
            disabled={isPending}
          >
            {isPending ? "İşleniyor..." : "Fonları Çek"}
          </button>
        )}
      </div>
    </div>
  );
} 