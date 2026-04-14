export function exportPortfolioCSV(tokens: Array<{
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  chain: string;
}>) {
  const header = "Token,Symbol,Balance,USD Value,Chain\n";
  const rows = tokens.map(t =>
    `${t.name},${t.symbol},${t.balance},${t.usdValue.toFixed(2)},${t.chain}`
  ).join("\n");

  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `folio-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
