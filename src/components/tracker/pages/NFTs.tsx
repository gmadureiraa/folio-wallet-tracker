import { useState, useMemo } from 'react'
import { Image, ExternalLink, Grid3X3, LayoutGrid, Wallet } from 'lucide-react'
import { fmtUSD } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import type { TrackedWallet, NFTItem } from '../types'

interface Props {
  nfts: NFTItem[]
  wallets: TrackedWallet[]
  ethPrice?: number
}

type GridSize = 'sm' | 'md' | 'lg'

export function NFTs({ nfts, wallets }: Props) {
  const [filterWallet, setFilterWallet] = useState<string>('all')
  const [filterChain, setFilterChain] = useState<string>('all')
  const [gridSize, setGridSize] = useState<GridSize>('md')

  const filtered = useMemo(() => {
    let list = [...nfts]
    if (filterWallet !== 'all') list = list.filter(n => n.walletId === filterWallet)
    if (filterChain !== 'all') list = list.filter(n => n.chain === filterChain)
    return list
  }, [nfts, filterWallet, filterChain])

  const totalFloor = filtered.reduce((s, n) => s + n.floorPriceUsd, 0)
  const uniqueChains = [...new Set(nfts.map(n => n.chain))]
  const uniqueCollections = [...new Set(filtered.map(n => n.collection))]

  // Group by collection
  const collections = useMemo(() => {
    const map = new Map<string, NFTItem[]>()
    for (const nft of filtered) {
      if (!map.has(nft.collection)) map.set(nft.collection, [])
      map.get(nft.collection)!.push(nft)
    }
    return [...map.entries()].sort((a, b) => {
      const aFloor = a[1].reduce((s, n) => s + n.floorPriceUsd, 0)
      const bFloor = b[1].reduce((s, n) => s + n.floorPriceUsd, 0)
      return bFloor - aFloor
    })
  }, [filtered])

  const gridCols = {
    sm: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    md: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    lg: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className="p-6 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">NFTs</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {filtered.length} items · {uniqueCollections.length} collections · {fmtUSD(totalFloor)} est. value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterWallet} onChange={e => setFilterWallet(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
            <option value="all">All Wallets</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
          <select value={filterChain} onChange={e => setFilterChain(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
            <option value="all">All Chains</option>
            {uniqueChains.map(c => <option key={c} value={c}>{CHAINS[c]?.name ?? c}</option>)}
          </select>
          {/* Grid size toggle */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
            <button
              onClick={() => setGridSize('sm')}
              className="p-1.5 transition-colors"
              style={{ background: gridSize === 'sm' ? '#F0F0F0' : '#FFFFFF', color: gridSize === 'sm' ? '#0A0A0A' : '#A3A3A3' }}
            >
              <Grid3X3 size={13} />
            </button>
            <button
              onClick={() => setGridSize('md')}
              className="p-1.5 transition-colors"
              style={{ background: gridSize === 'md' ? '#F0F0F0' : '#FFFFFF', color: gridSize === 'md' ? '#0A0A0A' : '#A3A3A3' }}
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Collection summary bar */}
      {collections.length > 0 && (
        <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {collections.slice(0, 8).map(([name, items]) => {
            const floorValue = items.reduce((s, n) => s + n.floorPriceUsd, 0)
            return (
              <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0 cursor-default"
                style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                {items[0]?.image && (
                  <img src={items[0].image} alt="" className="w-5 h-5 rounded object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                <div>
                  <p className="text-[10px] font-medium text-[#0A0A0A] truncate max-w-[100px]">{name}</p>
                  <p className="text-[9px] font-mono tabular-nums" style={{ color: '#737373' }}>
                    {items.length} · {fmtUSD(floorValue)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(96,165,250,0.1))', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Image size={24} style={{ color: '#8B5CF6' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
            {wallets.length === 0 ? 'No wallets added' : 'No NFTs found'}
          </p>
          <p className="text-xs" style={{ color: '#A3A3A3' }}>
            {wallets.length === 0
              ? 'Add a wallet to discover your NFT collection'
              : 'These wallets don\'t hold any NFTs on supported chains'}
          </p>
          {wallets.length === 0 && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F5F5F5' }}>
              <Wallet size={13} style={{ color: '#737373' }} />
              <span className="text-xs" style={{ color: '#737373' }}>Go to Wallets page to add one</span>
            </div>
          )}
        </div>
      ) : (
        <div className={`grid ${gridCols[gridSize]} gap-4`}>
          {filtered.map((nft, i) => {
            const wallet = wallets.find(w => w.id === nft.walletId)
            const chain = CHAINS[nft.chain]
            const rarityColor = nft.rarity < 20 ? '#F59E0B' : nft.rarity < 50 ? '#3B82F6' : '#737373'
            const rarityLabel = nft.rarity < 20 ? 'Rare' : nft.rarity < 50 ? 'Uncommon' : 'Common'

            return (
              <div key={`${nft.tokenId}-${i}`} className="nft-card rounded-xl overflow-hidden"
                style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                {/* Image */}
                <div className="relative aspect-square overflow-hidden" style={{ background: '#F5F5F5' }}>
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="nft-image w-full h-full object-cover"
                    loading="lazy"
                    onError={e => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      const placeholder = t.parentElement!
                      placeholder.style.background = 'linear-gradient(135deg, #F0F0F0, #E5E5E5)'
                      placeholder.innerHTML += `<div class="absolute inset-0 flex items-center justify-center"><span style="color: #A3A3A3; font-size: 24px">NFT</span></div>`
                    }}
                  />
                  {/* Chain badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm"
                    style={{ background: chain.color + 'cc', color: '#FFFFFF' }}>
                    {chain.name}
                  </div>
                  {/* Rarity badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm"
                    style={{ background: 'rgba(255,255,255,0.9)', color: rarityColor, border: `1px solid ${rarityColor}33` }}>
                    {rarityLabel} #{nft.rarity}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[10px] font-medium truncate" style={{ color: '#737373' }}>{nft.collection}</p>
                    {chain && (
                      <span className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 text-[6px] font-bold"
                        style={{ background: chain.color + '22', color: chain.color }}>
                        {chain.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#0A0A0A] truncate flex-1">{nft.name}</p>
                    <a href={`${chain.explorer}/token/${nft.contractAddress}?a=${nft.tokenId}`} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 ml-1 p-0.5 rounded hover:bg-[#F5F5F5] transition-colors">
                      <ExternalLink size={10} style={{ color: '#A3A3A3' }} />
                    </a>
                  </div>

                  <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid #F0F0F0' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: '#A3A3A3' }}>Floor</p>
                        <p className="text-sm font-mono tabular-nums font-semibold text-[#0A0A0A]">
                          {nft.floorPriceEth.toFixed(3)} ETH
                        </p>
                        <p className="text-[9px] font-mono tabular-nums" style={{ color: '#A3A3A3' }}>{fmtUSD(nft.floorPriceUsd)}</p>
                      </div>
                      {wallet && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: wallet.color }} />
                            <span className="text-[9px] truncate max-w-[70px]" style={{ color: '#A3A3A3' }}>{wallet.label}</span>
                          </div>
                          {nft.lastSaleUsd > 0 && (
                            <p className="text-[9px] font-mono tabular-nums mt-0.5" style={{ color: '#737373' }}>
                              Last: {fmtUSD(nft.lastSaleUsd)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
