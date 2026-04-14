interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
  createdAt: string;
  triggered: boolean;
}

export type { PriceAlert as FolioPriceAlert };

export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("folio-alerts") || "[]");
}

export function addAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "triggered">): void {
  const alerts = getAlerts();
  alerts.push({
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    triggered: false,
  });
  localStorage.setItem("folio-alerts", JSON.stringify(alerts));
}

export function removeAlert(id: string): void {
  const alerts = getAlerts().filter(a => a.id !== id);
  localStorage.setItem("folio-alerts", JSON.stringify(alerts));
}

export function checkAlerts(prices: Record<string, number>): PriceAlert[] {
  const alerts = getAlerts();
  const triggered: PriceAlert[] = [];

  alerts.forEach(alert => {
    if (alert.triggered) return;
    const price = prices[alert.symbol.toUpperCase()];
    if (!price) return;

    if (
      (alert.direction === "above" && price >= alert.targetPrice) ||
      (alert.direction === "below" && price <= alert.targetPrice)
    ) {
      alert.triggered = true;
      triggered.push(alert);
    }
  });

  localStorage.setItem("folio-alerts", JSON.stringify(alerts));
  return triggered;
}
