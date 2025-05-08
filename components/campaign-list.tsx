"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { DONATION_ABI, DONATION_CONTRACT_ADDRESS } from "@/lib/contract";
import { CampaignCard } from "./campaign-card";

interface Campaign {
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

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const { data: campaignCount } = useReadContract({
    address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
    abi: DONATION_ABI,
    functionName: "campaignCount",
  });
  
  const { data: campaignData } = useReadContract({
    address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
    abi: DONATION_ABI,
    functionName: "getCampaign",
    args: currentId !== null ? [BigInt(currentId)] : undefined,
    query: {
      enabled: currentId !== null,
    },
  });
  
  useEffect(() => {
    if (!campaignCount) return;
    
    const count = Number(campaignCount);
    if (count > 0 && currentId === null) {
      setCurrentId(1); 
    }
  }, [campaignCount, currentId]);
  
  useEffect(() => {
    if (!campaignData || currentId === null || !campaignCount) return;
    
    const count = Number(campaignCount);
    
    const [owner, goal, startTime, endTime, totalDonated, goalReached, active, withdrawn] = campaignData as [string, bigint, number, number, bigint, boolean, boolean, boolean];
    
    setCampaigns(prev => [...prev, {
      campaignId: BigInt(currentId),
      owner,
      goal,
      startTime,
      endTime,
      totalDonated,
      goalReached,
      active,
      withdrawn
    }]);
    
    if (currentId >= count) {
      setLoading(false);
    } else {
      setCurrentId(currentId + 1);
    }
  }, [campaignData, currentId, campaignCount]);
  
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === "active") return campaign.active;
    if (filter === "completed") return !campaign.active || campaign.goalReached;
    return true;
  });
  
  return (
    <div className="space-y-4 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-neutral-100">Kampanyalar</h2>
        
        <div className="flex space-x-1">
          <button
            className={`px-3 py-1 rounded text-xs transition-all duration-200 ${filter === "all" 
              ? "bg-lime-500 text-neutral-900" 
              : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"}`}
            onClick={() => setFilter("all")}
          >
            Tümü
          </button>
          <button
            className={`px-3 py-1 rounded text-xs transition-all duration-200 ${filter === "active" 
              ? "bg-lime-500 text-neutral-900" 
              : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"}`}
            onClick={() => setFilter("active")}
          >
            Aktif
          </button>
          <button
            className={`px-3 py-1 rounded text-xs transition-all duration-200 ${filter === "completed" 
              ? "bg-lime-500 text-neutral-900" 
              : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"}`}
            onClick={() => setFilter("completed")}
          >
            Tamamlandı
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-lime-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.campaignId.toString()} {...campaign} />
            ))
          ) : (
            <p className="col-span-full text-center text-neutral-500 py-8 text-sm">
              Filtrelere uygun kampanya bulunamadı.
            </p>
          )}
        </div>
      )}
    </div>
  );
} 