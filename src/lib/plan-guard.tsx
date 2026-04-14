"use client";

import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import { useState, useEffect, createContext, useContext } from "react";
import { Lock } from "lucide-react";

interface PlanState {
  plan: "free" | "pro";
  isPro: boolean;
  loading: boolean;
  expiresAt: string | null;
  refetch: () => void;
}

const PlanContext = createContext<PlanState>({
  plan: "free",
  isPro: false,
  loading: true,
  expiresAt: null,
  refetch: () => {},
});

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const fetchPlan = async () => {
    if (!user) {
      setPlan("free");
      setExpiresAt(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_expires_at")
        .eq("id", user.id)
        .single();
      if (
        data?.plan === "pro" &&
        data.plan_expires_at &&
        new Date(data.plan_expires_at) > new Date()
      ) {
        setPlan("pro");
        setExpiresAt(data.plan_expires_at);
      } else {
        setPlan("free");
        setExpiresAt(null);
      }
      setLoading(false);
    } catch {
      setPlan("free");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user]);

  return (
    <PlanContext.Provider
      value={{ plan, isPro: plan === "pro", loading, expiresAt, refetch: fetchPlan }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}

// Pro feature IDs
export const PRO_FEATURES: Set<string> = new Set([
  "pnl",
  "defi",
  "whales",
  "dca",
  "smart-allocator",
  "goals",
]);

export function isProFeature(pageId: string): boolean {
  return PRO_FEATURES.has(pageId);
}

export function ProFeatureGate({
  children,
  feature,
}: {
  children: React.ReactNode;
  feature: string;
}) {
  const { isPro } = usePlan();
  if (isPro) return <>{children}</>;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center relative overflow-hidden">
      {/* Stipple wallet decoration */}
      <div className="relative w-20 h-20 opacity-60 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wallet-v5.png"
          alt=""
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold font-serif text-gray-900">{feature}</h2>
      <p className="text-gray-500 max-w-sm">
        This feature is available on the Pro plan. Upgrade for just $0.99/month.
      </p>
      <a
        href="/app/plan"
        className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors no-underline"
      >
        Upgrade to Pro
      </a>
    </div>
  );
}
