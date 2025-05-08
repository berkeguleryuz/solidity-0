import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEth(wei: bigint): string {
  return ethers.formatEther(wei.toString());
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

export function getRemainingTime(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = endTime - now;
  
  if (remainingSeconds <= 0) {
    return "Kampanya sona erdi";
  }
  
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
  
  return `${days} gün, ${hours} saat, ${minutes} dakika`;
}

export function calculateProgress(current: bigint, goal: bigint): number {
  if (goal === BigInt(0)) return 0;
  
  const currentEther = ethers.parseEther(ethers.formatEther(current.toString()));
  const goalEther = ethers.parseEther(ethers.formatEther(goal.toString()));
  
  return Number((currentEther * BigInt(100)) / goalEther);
}

export function shortenAddress(address: string): string {
  return ethers.getAddress(address).substring(0, 6) + "..." + ethers.getAddress(address).slice(-4);
}
