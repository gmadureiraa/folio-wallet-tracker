// Real NFT fetcher — uses Reservoir API (free, no key for basic access)
// Supports: ethereum, polygon, arbitrum, optimism, base

import type { ChainId, NFTItem } from '../types'

const RESERVOIR_CHAINS: Partial<Record<ChainId, string>> = {
  ethereum: 'https://api.reservoir.tools',
  polygon: 'https://api-polygon.reservoir.tools',
  arbitrum: 'https://api-arbitrum.reservoir.tools',
  optimism: 'https://api-optimism.reservoir.tools',
  base: 'https://api-base.reservoir.tools',
  linea: 'https://api-linea.reservoir.tools',
  scroll: 'https://api-scroll.reservoir.tools',
  zksync: 'https://api-zksync.reservoir.tools',
}

export async function fetchRealNFTs(
  walletId: string,
  address: string,
  chain: ChainId
): Promise<NFTItem[]> {
  const baseUrl = RESERVOIR_CHAINS[chain]
  if (!baseUrl) return []

  try {
    const res = await fetch(`${baseUrl}/users/${address}/tokens/v10?limit=20`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = await res.json()

    return (data.tokens || []).map((t: any, i: number) => ({
      id: `nft-${chain}-${i}`,
      walletId,
      chain,
      name: t.token?.name || `#${t.token?.tokenId}`,
      collection: t.token?.collection?.name || 'Unknown',
      image: t.token?.imageSmall || t.token?.image || '',
      tokenId: t.token?.tokenId || '',
      contractAddress: t.token?.contract || '',
      standard: t.token?.kind || 'erc721',
      floorPriceEth: t.token?.collection?.floorAskPrice?.amount?.native || 0,
      floorPriceUsd: t.token?.collection?.floorAskPrice?.amount?.usd || 0,
      lastSaleUsd: t.token?.lastSale?.price?.amount?.usd || 0,
      rarity: t.token?.rarityRank || 0,
    }))
  } catch {
    return []
  }
}
