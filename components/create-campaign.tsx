"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWriteContract } from "wagmi";
import { DONATION_ABI, DONATION_CONTRACT_ADDRESS } from "@/lib/contract";

export function CreateCampaign() {
  const [formState, setFormState] = useState({
    goal: "",
    duration: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { writeContract, isPending, isSuccess } = useWriteContract();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.goal || !formState.duration) return;
    
    // ETH'yi wei'ye dönüştür
    const goalInWei = ethers.parseEther(formState.goal);
    // Gün cinsinden süreyi saniyeye dönüştür
    const durationInSeconds = parseInt(formState.duration) * 24 * 60 * 60;
    
    writeContract({
      address: DONATION_CONTRACT_ADDRESS as `0x${string}`,
      abi: DONATION_ABI,
      functionName: "createCampaign",
      args: [goalInWei, BigInt(durationInSeconds)]
    });
  };
  
  // İşlem başarılı ise başarı mesajını göster ve formu sıfırla
  useEffect(() => {
    if (isSuccess && formState.goal) {
      setShowSuccess(true);
      
      // 3 saniye sonra başarı mesajını kapat ve formu kapat
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setFormState({ goal: "", duration: "" });
        setIsOpen(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, formState.goal]);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-5 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200 ${
          isOpen ? "bg-neutral-800 text-lime-500 border border-lime-800" : "bg-lime-500 text-neutral-900 hover:bg-lime-600 active:scale-95"
        }`}
      >
        {isOpen ? "Kapat" : "Yeni Kampanya Oluştur"}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg shadow-sm">
          <h3 className="text-base font-medium mb-3 text-neutral-100">Yeni Bağış Kampanyası</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-neutral-400 text-xs mb-1" htmlFor="goal">
                Hedef (ETH)
              </label>
              <input
                type="text"
                id="goal"
                name="goal"
                value={formState.goal}
                onChange={handleChange}
                placeholder="Örn: 1.5"
                className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-neutral-400 text-xs mb-1" htmlFor="duration">
                Süre (Gün)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formState.duration}
                onChange={handleChange}
                placeholder="Örn: 30"
                className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-lime-500 text-neutral-900 py-2 rounded text-sm font-medium transition-all hover:bg-lime-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isPending || !formState.goal || !formState.duration}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </span>
              ) : "Kampanya Oluştur"}
            </button>
          </form>
          
          <div 
            className={`mt-3 p-2 bg-neutral-800 border border-lime-800 text-lime-500 rounded text-xs transition-all duration-300 ${
              showSuccess ? "opacity-100" : "opacity-0 h-0 mt-0 p-0 overflow-hidden"
            }`}
          >
            Kampanya başarıyla oluşturuldu! Kontrata erişmek için blockchain explorer&apos;ı kontrol edin.
          </div>
        </div>
      </div>
    </div>
  );
} 