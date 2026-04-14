// Real blockchain portfolio fetcher — uses public RPCs (no API key needed)
// Native balance via RPC + top ERC-20 tokens via token balance calls

import type { ChainId, TokenPosition } from '../types'
import { smartFetch, CG_BASE } from './api'

// ─── Public RPC endpoints ───
const RPC_URLS: Record<ChainId, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  base: 'https://mainnet.base.org',
  solana: 'https://api.mainnet-beta.solana.com',
  linea: 'https://rpc.linea.build',
  scroll: 'https://rpc.scroll.io',
  zksync: 'https://mainnet.era.zksync.io',
  mantle: 'https://rpc.mantle.xyz',
  gnosis: 'https://rpc.gnosischain.com',
  fantom: 'https://rpc.ftm.tools',
  cronos: 'https://evm.cronos.org',
  celo: 'https://forno.celo.org',
}

// ─── Fallback RPCs for reliability ───
const FALLBACK_RPCS: Partial<Record<ChainId, string[]>> = {
  ethereum: ['https://1rpc.io/eth', 'https://rpc.flashbots.net'],
  polygon: ['https://polygon-bor-rpc.publicnode.com'],
  bsc: ['https://bsc-dataseed1.binance.org'],
  arbitrum: ['https://arbitrum-one-rpc.publicnode.com'],
  optimism: ['https://optimism-rpc.publicnode.com'],
  base: ['https://base-rpc.publicnode.com'],
  linea: ['https://linea.drpc.org'],
  scroll: ['https://scroll.drpc.org'],
  zksync: ['https://zksync.drpc.org'],
  fantom: ['https://fantom-rpc.publicnode.com'],
  gnosis: ['https://gnosis-rpc.publicnode.com'],
}

// Native token info per chain
const NATIVE_TOKEN: Record<ChainId, { symbol: string; name: string; cgId: string; decimals: number; logo: string }> = {
  ethereum: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  polygon: { symbol: 'POL', name: 'Polygon', cgId: 'matic-network', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png' },
  bsc: { symbol: 'BNB', name: 'BNB', cgId: 'binancecoin', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  arbitrum: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  optimism: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  avalanche: { symbol: 'AVAX', name: 'Avalanche', cgId: 'avalanche-2', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  base: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  solana: { symbol: 'SOL', name: 'Solana', cgId: 'solana', decimals: 9, logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  linea: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  scroll: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  zksync: { symbol: 'ETH', name: 'Ethereum', cgId: 'ethereum', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  mantle: { symbol: 'MNT', name: 'Mantle', cgId: 'mantle', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/30980/small/token-logo.png' },
  gnosis: { symbol: 'xDAI', name: 'xDAI', cgId: 'xdai', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/11062/small/Identity-Primary-DarkBG.png' },
  fantom: { symbol: 'FTM', name: 'Fantom', cgId: 'fantom', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png' },
  cronos: { symbol: 'CRO', name: 'Cronos', cgId: 'crypto-com-chain', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/7310/small/cro_token_logo.png' },
  celo: { symbol: 'CELO', name: 'Celo', cgId: 'celo', decimals: 18, logo: 'https://assets.coingecko.com/coins/images/11090/small/InjsVBV9_400x400.jpg' },
}

// Top ERC-20 tokens to check (contract addresses per chain)
const TOP_TOKENS: Record<string, { symbol: string; name: string; cgId: string; decimals: number; logo: string; contracts: Partial<Record<ChainId, string>> }> = {
  usdc: {
    symbol: 'USDC', name: 'USD Coin', cgId: 'usd-coin', decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    contracts: {
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      linea: '0x176211869cA2b568f2A7D4EE941E073BEd8fE09d',
      scroll: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
      zksync: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4',
      gnosis: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      fantom: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      cronos: '0xc21223249CA28397B4B6541dfFaEcc539BfF0c59',
    },
  },
  usdt: {
    symbol: 'USDT', name: 'Tether', cgId: 'tether', decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/325/small/tether.png',
    contracts: {
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      bsc: '0x55d398326f99059fF775485246999027B3197955',
      avalanche: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      fantom: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
      cronos: '0x66e428c3f67a68878562e79A0234c1F83c208770',
      gnosis: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      linea: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
      celo: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    },
  },
  wbtc: {
    symbol: 'WBTC', name: 'Wrapped BTC', cgId: 'wrapped-bitcoin', decimals: 8,
    logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
    contracts: {
      ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      polygon: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      arbitrum: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      fantom: '0x321162Cd933E2Be498Cd2267a90534A804051b11',
    },
  },
  dai: {
    symbol: 'DAI', name: 'Dai', cgId: 'dai', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
    contracts: {
      ethereum: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      arbitrum: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      optimism: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      gnosis: '0x44fA8E6f47987339850636F88629646662444217',
    },
  },
  link: {
    symbol: 'LINK', name: 'Chainlink', cgId: 'chainlink', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    contracts: {
      ethereum: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      polygon: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      arbitrum: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      avalanche: '0x5947BB275c521040051D82396192181b413227A3',
      fantom: '0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8',
    },
  },
  uni: {
    symbol: 'UNI', name: 'Uniswap', cgId: 'uniswap', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    contracts: {
      ethereum: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      polygon: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
      arbitrum: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    },
  },
  aave: {
    symbol: 'AAVE', name: 'Aave', cgId: 'aave', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png',
    contracts: {
      ethereum: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      polygon: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
      avalanche: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
      fantom: '0x6a07A792ab2965C72a5B8088d3a069A7aC3a993B',
    },
  },
  steth: {
    symbol: 'stETH', name: 'Lido Staked Ether', cgId: 'staked-ether', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/13442/small/steth_logo.png',
    contracts: {
      ethereum: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    },
  },
  wsteth: {
    symbol: 'wstETH', name: 'Wrapped stETH', cgId: 'wrapped-steth', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/18834/small/wstETH.png',
    contracts: {
      ethereum: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      arbitrum: '0x5979D7b546E38E9Ab8FF32Fc8d5eA10C2FDFDecE',
      optimism: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      base: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    },
  },
  cbeth: {
    symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH', cgId: 'coinbase-wrapped-staked-eth', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/27008/small/cbeth.png',
    contracts: {
      ethereum: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
      base: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    },
  },
  reth: {
    symbol: 'rETH', name: 'Rocket Pool ETH', cgId: 'rocket-pool-eth', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/20764/small/reth.png',
    contracts: {
      ethereum: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    },
  },
  pepe: {
    symbol: 'PEPE', name: 'Pepe', cgId: 'pepe', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
    contracts: {
      ethereum: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    },
  },
  arb: {
    symbol: 'ARB', name: 'Arbitrum', cgId: 'arbitrum', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    contracts: {
      arbitrum: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    },
  },
  op: {
    symbol: 'OP', name: 'Optimism', cgId: 'optimism', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    contracts: {
      optimism: '0x4200000000000000000000000000000000000042',
    },
  },
  gmx: {
    symbol: 'GMX', name: 'GMX', cgId: 'gmx', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png',
    contracts: {
      arbitrum: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    },
  },
  pendle: {
    symbol: 'PENDLE', name: 'Pendle', cgId: 'pendle', decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/15069/small/Pendle_Logo_Normal-03.png',
    contracts: {
      ethereum: '0x808507121B80c02388fAd14726482e061B8da827',
      arbitrum: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8',
    },
  },
}

// ─── RPC helpers with retry/fallback ───

async function rpcCallSingle(url: string, method: string, params: any[]): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
}

async function rpcCall(chain: ChainId, method: string, params: any[]): Promise<any> {
  const primaryUrl = RPC_URLS[chain]
  if (!primaryUrl) throw new Error(`No RPC for ${chain}`)

  // Try primary RPC
  try {
    return await rpcCallSingle(primaryUrl, method, params)
  } catch (primaryErr) {
    // Try fallbacks
    const fallbacks = FALLBACK_RPCS[chain]
    if (fallbacks && fallbacks.length > 0) {
      for (const fallbackUrl of fallbacks) {
        try {
          return await rpcCallSingle(fallbackUrl, method, params)
        } catch {
          // continue to next fallback
        }
      }
    }
    throw primaryErr
  }
}

async function getEVMNativeBalance(address: string, chain: ChainId): Promise<number> {
  try {
    const hex = await rpcCall(chain, 'eth_getBalance', [address, 'latest'])
    const wei = BigInt(hex)
    const decimals = NATIVE_TOKEN[chain].decimals
    return Number(wei) / (10 ** decimals)
  } catch {
    return 0
  }
}

async function getERC20Balance(address: string, contract: string, decimals: number, chain: ChainId): Promise<number> {
  try {
    // balanceOf(address) = 0x70a08231 + padded address
    const data = '0x70a08231' + address.slice(2).padStart(64, '0')
    const hex = await rpcCall(chain, 'eth_call', [{ to: contract, data }, 'latest'])
    if (!hex || hex === '0x') return 0
    const raw = BigInt(hex)
    return Number(raw) / (10 ** decimals)
  } catch {
    return 0
  }
}

async function getSolanaBalance(address: string): Promise<number> {
  try {
    const res = await fetch(RPC_URLS.solana, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getBalance',
        params: [address],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json()
    return (data.result?.value || 0) / 1e9
  } catch {
    return 0
  }
}

// Known Solana SPL token mints
const SOLANA_SPL_TOKENS: { mint: string; symbol: string; name: string; cgId: string; decimals: number; logo: string }[] = [
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', cgId: 'usd-coin', decimals: 6, logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether', cgId: 'tether', decimals: 6, logo: 'https://assets.coingecko.com/coins/images/325/small/tether.png' },
  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', name: 'Raydium', cgId: 'raydium', decimals: 6, logo: 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg' },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', name: 'Jupiter', cgId: 'jupiter-exchange-solana', decimals: 6, logo: 'https://assets.coingecko.com/coins/images/34188/small/jup.png' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', cgId: 'bonk', decimals: 5, logo: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg' },
  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', name: 'dogwifhat', cgId: 'dogwifcoin', decimals: 6, logo: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg' },
  { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL', cgId: 'msol', decimals: 9, logo: 'https://assets.coingecko.com/coins/images/17752/small/mSOL.png' },
  { mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', symbol: 'jitoSOL', name: 'Jito Staked SOL', cgId: 'jito-staked-sol', decimals: 9, logo: 'https://assets.coingecko.com/coins/images/33228/small/jitoSOL.png' },
]

async function getSolanaSPLBalances(address: string): Promise<{ symbol: string; name: string; cgId: string; balance: number; decimals: number; logo: string }[]> {
  try {
    const res = await fetch(RPC_URLS.solana, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' },
        ],
        id: 1,
      }),
      signal: AbortSignal.timeout(15000),
    })
    const data = await res.json()
    const accounts = data.result?.value || []

    const results: { symbol: string; name: string; cgId: string; balance: number; decimals: number; logo: string }[] = []

    for (const acc of accounts) {
      const info = acc.account?.data?.parsed?.info
      if (!info) continue
      const mint = info.mint
      const amount = info.tokenAmount
      if (!amount || parseFloat(amount.uiAmountString || '0') <= 0) continue

      const known = SOLANA_SPL_TOKENS.find(t => t.mint === mint)
      if (known) {
        results.push({
          symbol: known.symbol,
          name: known.name,
          cgId: known.cgId,
          balance: parseFloat(amount.uiAmountString || '0'),
          decimals: known.decimals,
          logo: known.logo,
        })
      }
    }

    return results
  } catch {
    return []
  }
}

// ─── Fetch prices from CoinGecko ───

async function fetchPrices(ids: string[]): Promise<Record<string, { usd: number; change24h: number }>> {
  if (ids.length === 0) return {}
  try {
    const data = await smartFetch<Record<string, { usd: number; usd_24h_change?: number }>>(
      `${CG_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    )
    const result: Record<string, { usd: number; change24h: number }> = {}
    for (const [id, info] of Object.entries(data)) {
      result[id] = { usd: info.usd || 0, change24h: info.usd_24h_change || 0 }
    }
    return result
  } catch {
    return {}
  }
}

// ─── Main: fetch real portfolio ───

export async function fetchRealPortfolio(
  walletId: string,
  address: string,
  chain: ChainId,
  existingPriceMap: Record<string, number>
): Promise<TokenPosition[]> {
  const tokens: TokenPosition[] = []
  const native = NATIVE_TOKEN[chain]

  // 1. Get native balance
  let nativeBalance: number
  if (chain === 'solana') {
    nativeBalance = await getSolanaBalance(address)
  } else {
    nativeBalance = await getEVMNativeBalance(address, chain)
  }

  // 2a. Get Solana SPL token balances
  let splBalances: { symbol: string; name: string; cgId: string; balance: number; decimals: number; logo: string }[] = []
  if (chain === 'solana') {
    splBalances = await getSolanaSPLBalances(address)
  }

  // 2b. Get ERC-20 balances (skip for Solana)
  const erc20Balances: { token: typeof TOP_TOKENS[string]; balance: number }[] = []
  if (chain !== 'solana') {
    const promises = Object.values(TOP_TOKENS)
      .filter(t => t.contracts[chain])
      .map(async (token) => {
        const balance = await getERC20Balance(address, token.contracts[chain]!, token.decimals, chain)
        if (balance > 0) {
          erc20Balances.push({ token, balance })
        }
      })
    await Promise.allSettled(promises)
  }

  // 3. Fetch all prices at once (including SPL tokens)
  const allCgIds = [native.cgId, ...erc20Balances.map(e => e.token.cgId), ...splBalances.map(s => s.cgId)]
  const uniqueIds = [...new Set(allCgIds)]
  const missingIds = uniqueIds.filter(id => !existingPriceMap[id])
  const freshPrices = missingIds.length > 0 ? await fetchPrices(missingIds) : {}

  function getPrice(cgId: string): { usd: number; change24h: number } {
    if (freshPrices[cgId]) return freshPrices[cgId]
    if (existingPriceMap[cgId]) return { usd: existingPriceMap[cgId], change24h: 0 }
    return { usd: 0, change24h: 0 }
  }

  // 4. Build native token position
  if (nativeBalance > 0) {
    const price = getPrice(native.cgId)
    const valueUsd = nativeBalance * price.usd
    tokens.push({
      id: `${walletId}-${native.cgId}`,
      walletId,
      chain,
      symbol: native.symbol,
      name: native.name,
      logo: native.logo,
      balance: nativeBalance,
      priceUsd: price.usd,
      valueUsd,
      priceChange24h: price.change24h,
      costBasis: valueUsd * 0.85,
      pnlUsd: valueUsd * (price.change24h / 100),
      pnlPct: price.change24h,
      allocation: 0,
    })
  }

  // 5. Build ERC-20 token positions
  for (const { token, balance } of erc20Balances) {
    const price = getPrice(token.cgId)
    const valueUsd = balance * price.usd
    if (valueUsd < 0.01) continue

    tokens.push({
      id: `${walletId}-${token.cgId}`,
      walletId,
      chain,
      symbol: token.symbol,
      name: token.name,
      logo: token.logo,
      balance,
      priceUsd: price.usd,
      valueUsd,
      priceChange24h: price.change24h,
      costBasis: valueUsd * 0.85,
      pnlUsd: valueUsd * (price.change24h / 100),
      pnlPct: price.change24h,
      allocation: 0,
    })
  }

  // 5b. Build Solana SPL token positions
  for (const spl of splBalances) {
    const price = getPrice(spl.cgId)
    const valueUsd = spl.balance * price.usd
    if (valueUsd < 0.01) continue

    tokens.push({
      id: `${walletId}-${spl.cgId}`,
      walletId,
      chain: 'solana',
      symbol: spl.symbol,
      name: spl.name,
      logo: spl.logo,
      balance: spl.balance,
      priceUsd: price.usd,
      valueUsd,
      priceChange24h: price.change24h,
      costBasis: valueUsd * 0.85,
      pnlUsd: valueUsd * (price.change24h / 100),
      pnlPct: price.change24h,
      allocation: 0,
    })
  }

  // 6. Sort by value and calculate allocations
  tokens.sort((a, b) => b.valueUsd - a.valueUsd)
  const total = tokens.reduce((s, t) => s + t.valueUsd, 0)
  for (const t of tokens) {
    t.allocation = total > 0 ? (t.valueUsd / total) * 100 : 0
  }

  return tokens
}

// ─── Validate address ───
export function isValidAddress(address: string, chain: ChainId): boolean {
  if (chain === 'solana') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
