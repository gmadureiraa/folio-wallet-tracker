# PLANO DE DESENVOLVIMENTO — Folio Wallet Tracker App

> Documento de referencia para construcao do app Folio dentro do projeto Next.js existente.
> Criado: 2026-04-11 | Status: Planejamento

---

## Visao Geral

O Folio eh um rastreador de carteiras multi-chain. A landing page V2 (`/src/app/v2/page.tsx`) ja esta pronta com estetica premium: fundo branco, tipografia Instrument Serif, arte stipple de carteira, design minimalista. O app sera construido na rota `/app/` dentro do mesmo projeto Next.js, mantendo a mesma identidade visual.

**Objetivo:** App funcional com autenticacao, escaneamento multi-chain, portfolio dashboard e pagamento on-chain com stablecoins.

---

## Stack Tecnica

| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Framework | Next.js 16 (App Router) | Ja configurado |
| Estilizacao | Tailwind CSS 4 + tw-animate-css | Ja configurado |
| Animacoes | Framer Motion 12 | Ja instalado |
| Componentes | shadcn v4 + Lucide Icons | Ja instalado |
| Auth + DB | Supabase (PostgreSQL) | A configurar |
| Precos | CoinGecko API | A integrar |
| Blockchain | Etherscan-family APIs + Solana RPC | A integrar |
| Graficos | Recharts | A instalar |
| QR Code | `qrcode.react` | A instalar |
| Verificacao TX | `viem` | A instalar |

**Package manager:** bun (conforme preferencia do projeto)

**Dependencias a instalar:**
```bash
bun add @supabase/supabase-js @supabase/ssr viem recharts qrcode.react
```

---

## Autenticacao — 3 Metodos

### 1. Connect Wallet (MetaMask, WalletConnect, Phantom)
- Leitura do endereco publico da carteira (read-only)
- Nao requer assinatura nem chave privada
- Usa `window.ethereum` (EVM) e `window.solana` (Phantom)
- Apos conectar: cria/atualiza perfil no Supabase via API route

### 2. Google OAuth via Supabase
- Supabase Auth com provider Google
- Redirect para `/app` apos login

### 3. Email + Senha via Supabase
- Supabase Auth nativo
- Confirmacao por email (magic link opcional)

---

## Modelo de Precos

| Plano | Preco | Limites |
|-------|-------|---------|
| **Free** | $0 | 1 carteira, portfolio ate $1.000 |
| **Pro** | $0.99/mes OU $9.99/ano | Carteiras ilimitadas, 16 blockchains, PnL, NFTs, alertas, exportacao |

### Pagamento On-Chain
- **Tokens aceitos:** USDT, USDC
- **Redes suportadas:** Ethereum, Polygon, Arbitrum, BSC, Base
- **Carteira de recebimento:** `process.env.NEXT_PUBLIC_PAYMENT_WALLET` (placeholder)
- **Fluxo:** Selecionar plano -> Selecionar token -> Selecionar rede -> Exibir endereco + QR + valor exato -> Usuario envia TX -> Informar TX hash -> Verificacao on-chain -> Ativar plano

---

## Schema do Banco de Dados (Supabase)

**Arquivo:** `supabase/schema.sql`

```sql
-- Perfis de usuario (estende auth.users do Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Carteiras rastreadas
CREATE TABLE tracked_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  label TEXT,
  chains TEXT[] DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, address)
);

-- Registros de pagamento
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('USDT', 'USDC')),
  amount DECIMAL NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro')),
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alertas de preco (Pro only)
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  target_price DECIMAL NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own wallets" ON tracked_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON tracked_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets" ON tracked_wallets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON tracked_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Variaveis de Ambiente

**Arquivo:** `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pagamento
NEXT_PUBLIC_PAYMENT_WALLET=

# APIs externas
ETHERSCAN_API_KEY=
COINGECKO_API_KEY=

# Opcional: APIs por chain (free tiers)
POLYGONSCAN_API_KEY=
ARBISCAN_API_KEY=
BSCSCAN_API_KEY=
BASESCAN_API_KEY=
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Contratos de Tokens (Enderecos de Producao)

```typescript
// src/lib/constants.ts

export const USDT_ADDRESSES: Record<string, string> = {
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  polygon:  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  bsc:      "0x55d398326f99059fF775485246999027B3197955",
  base:     "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
};

export const USDC_ADDRESSES: Record<string, string> = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  polygon:  "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  bsc:      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  base:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export const CHAIN_CONFIG: Record<string, {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerApi: string;
  explorerUrl: string;
  nativeCurrency: string;
}> = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    explorerApi: "https://api.etherscan.io/api",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: "ETH",
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon.llamarpc.com",
    explorerApi: "https://api.polygonscan.com/api",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: "MATIC",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerApi: "https://api.arbiscan.io/api",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: "ETH",
  },
  bsc: {
    name: "BNB Chain",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerApi: "https://api.bscscan.com/api",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: "BNB",
  },
  base: {
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    explorerApi: "https://api.basescan.org/api",
    explorerUrl: "https://basescan.org",
    nativeCurrency: "ETH",
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    explorerApi: "https://api-optimistic.etherscan.io/api",
    explorerUrl: "https://optimistic.etherscan.io",
    nativeCurrency: "ETH",
  },
  avalanche: {
    name: "Avalanche",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerApi: "https://api.snowtrace.io/api",
    explorerUrl: "https://snowtrace.io",
    nativeCurrency: "AVAX",
  },
  solana: {
    name: "Solana",
    chainId: 0,
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorerApi: "",
    explorerUrl: "https://solscan.io",
    nativeCurrency: "SOL",
  },
};

export const PRICING = {
  monthly: { amount: 0.99, label: "$0.99/mes" },
  yearly:  { amount: 9.99, label: "$9.99/ano" },
};

export const FREE_PLAN_LIMITS = {
  maxWallets: 1,
  maxPortfolioUsd: 1000,
};
```

---

## FASE 1: App Shell + Autenticacao (Dia 1)

### Objetivo
Criar a estrutura base do app com layout, navegacao, pagina de login e integracao com Supabase Auth.

### Arquivos a Criar

#### 1.1 — Layout do App
**`src/app/app/layout.tsx`**

Layout com sidebar de navegacao. Estetica V2: fundo branco, headings Instrument Serif, linhas finas, espacamento generoso.

Sidebar com:
- Logo "Folio" (Instrument Serif)
- Links: Dashboard, Portfolio, Alertas, Upgrade, Configuracoes
- User avatar + nome no rodape
- Botao collapse para mobile

```
Estrutura visual:
┌──────────┬───────────────────────────────┐
│ Sidebar  │ Conteudo principal            │
│          │                               │
│ Dashboard│                               │
│ Portfolio│                               │
│ Alertas  │                               │
│ Upgrade  │                               │
│ Config   │                               │
│          │                               │
│ [User]   │                               │
└──────────┴───────────────────────────────┘
```

Mobile: sidebar vira bottom tab bar (5 icones).

#### 1.2 — Dashboard Principal
**`src/app/app/page.tsx`**

Pagina inicial do app. Mostra:
- Saldo total em USD (numero grande, Instrument Serif)
- Variacao 24h (verde/vermelho)
- Cards resumo: carteiras rastreadas, tokens encontrados, melhor performer
- Lista rapida dos top 5 tokens
- CTA para adicionar carteira (se nenhuma adicionada)

#### 1.3 — Pagina de Login
**`src/app/app/login/page.tsx`**

Pagina de login com 3 opcoes, layout centralizado:
1. **Connect Wallet** — botao principal, destaque visual
   - Detecta MetaMask (`window.ethereum`)
   - Detecta Phantom (`window.solana`)
   - Fallback: WalletConnect QR
2. **Continue with Google** — botao secundario, OAuth Supabase
3. **Email + Password** — formulario simples, toggle login/register

Design: card centralizado, fundo branco, bordas sutis, animacao Framer Motion no mount.

#### 1.4 — Cliente Supabase
**`src/lib/supabase.ts`**

```typescript
// Cliente para uso no browser (Client Components)
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`src/lib/supabase-server.ts`**

```typescript
// Cliente para uso em Server Components e Route Handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

#### 1.5 — Contexto de Auth
**`src/lib/auth-context.tsx`**

Provider React com:
- `user` — usuario autenticado (ou null)
- `profile` — dados do perfil (plano, carteira, etc.)
- `isLoading` — estado de carregamento
- `signIn(method)` — login por metodo
- `signOut()` — logout
- `connectWallet()` — conectar carteira EVM/Solana
- `isPro` — computed: plano Pro ativo e nao expirado

#### 1.6 — Middleware de Protecao
**`src/middleware.ts`**

```typescript
// Protege rotas /app/* (exceto /app/login)
// Redireciona para /app/login se nao autenticado
// Redireciona para /app se ja autenticado e tentando acessar /app/login
```

Logica:
- Verifica sessao Supabase via cookie
- `/app/login` — publica
- `/app/*` — requer autenticacao
- `/api/*` — sem redirect, retorna 401
- `/v2`, `/` — publicas (landing pages)

#### 1.7 — Schema SQL
**`supabase/schema.sql`**

Conforme definido na secao "Schema do Banco de Dados" acima.

#### 1.8 — Callback de Auth
**`src/app/auth/callback/route.ts`**

Route handler para o callback do OAuth (Google):
- Troca code por sessao
- Redireciona para `/app`

### Tarefas de Configuracao
- [ ] Criar projeto no Supabase
- [ ] Habilitar Google OAuth no Supabase Dashboard
- [ ] Habilitar Email Auth no Supabase Dashboard
- [ ] Rodar `schema.sql` no SQL Editor do Supabase
- [ ] Configurar `.env.local` com as credenciais

---

## FASE 2: Rastreamento de Carteiras (Dia 2)

### Objetivo
Implementar o core: escanear carteiras em multiplas chains, buscar precos e exibir portfolio completo.

### Arquivos a Criar

#### 2.1 — Scanner Multi-Chain
**`src/lib/scanner.ts`**

Funcoes:
- `detectChains(address: string)` — detecta se eh endereco EVM (0x...) ou Solana (base58)
- `scanEvmChain(address: string, chain: string)` — escaneia uma chain EVM via Etherscan API
  - Busca saldo nativo (ETH, MATIC, BNB, AVAX)
  - Busca tokens ERC-20 via `tokentx` endpoint
  - Busca NFTs via `tokennfttx` endpoint
- `scanSolana(address: string)` — escaneia Solana via RPC
  - Saldo SOL
  - Tokens SPL via `getTokenAccountsByOwner`
- `scanAllChains(address: string)` — escaneia todas as chains detectadas em paralelo
- Retorno padronizado:

```typescript
interface WalletScanResult {
  address: string;
  chains: ChainResult[];
  totalUsd: number;
  lastScanned: string;
}

interface ChainResult {
  chain: string;
  nativeBalance: TokenBalance;
  tokens: TokenBalance[];
  nfts: NftItem[];
}

interface TokenBalance {
  symbol: string;
  name: string;
  address: string; // contrato
  balance: number;
  decimals: number;
  usdValue: number;
  change24h: number;
  logoUrl: string;
  percentOfPortfolio: number;
}

interface NftItem {
  name: string;
  collection: string;
  tokenId: string;
  imageUrl: string;
  chain: string;
}
```

**Rate limiting:** Etherscan free tier = 5 req/s. Implementar queue com delay de 200ms entre requests. Cache de 60s para evitar requests repetidos.

#### 2.2 — Fetcher de Precos
**`src/lib/prices.ts`**

```typescript
// Cache de precos com TTL de 60 segundos
// CoinGecko API (free tier: 30 req/min)

export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, PriceData>>;
export async function getTokenPrice(tokenId: string): Promise<PriceData>;
export async function getPriceHistory(tokenId: string, days: number): Promise<PricePoint[]>;
export async function searchToken(query: string): Promise<TokenInfo[]>;

interface PriceData {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}
```

Mapeamento de enderecos de contrato -> CoinGecko IDs:
- Usar endpoint `/coins/{platform}/contract/{address}` para resolver tokens ERC-20
- Cache local de mapeamentos conhecidos (top 100 tokens)

#### 2.3 — Pagina de Portfolio
**`src/app/app/portfolio/page.tsx`**

Layout:
```
┌─────────────────────────────────────────────┐
│ Saldo Total: $12,345.67  (+3.2% 24h)       │
├─────────────────────────────────────────────┤
│ [Grafico de linha 7d/30d/90d/1y]           │
├──────────┬──────────────────────────────────┤
│ Por Chain│ Tokens                            │
│ ┌──────┐ │ ┌────────────────────────────┐   │
│ │ETH 45%│ │ │ ETH  3.45  $8,500  +2.1% │   │
│ │SOL 30%│ │ │ SOL  120   $2,400  +5.3% │   │
│ │BSC 25%│ │ │ USDT 1000  $1,000  +0.0% │   │
│ └──────┘ │ │ LINK 50    $445    -1.2%  │   │
│          │ └────────────────────────────┘   │
├──────────┴──────────────────────────────────┤
│ NFTs (se houver)                            │
│ [Grid de thumbnails]                        │
└─────────────────────────────────────────────┘
```

Tabs: Visao Geral | Por Chain | NFTs

#### 2.4 — Componentes do App

**`src/components/app/token-row.tsx`**
- Linha de token: icone, nome, simbolo, saldo, valor USD, variacao 24h, % do portfolio
- Cores: verde para positivo, vermelho para negativo
- Hover: borda sutil, transicao suave

**`src/components/app/chain-badge.tsx`**
- Badge com icone da chain + nome
- Cores especificas por chain (Ethereum=azul, Solana=roxo, BSC=amarelo, etc.)

**`src/components/app/portfolio-chart.tsx`**
- Grafico de linha usando Recharts
- Periodos: 7d, 30d, 90d, 1y
- Tooltip com valor exato + data
- Area preenchida com gradiente sutil
- Cores: cinza com accent no hover

**`src/components/app/add-wallet-modal.tsx`**
- Modal/dialog para adicionar carteira
- Input de endereco com validacao (0x... ou base58)
- Deteccao automatica de chains
- Campo opcional de label ("Minha MetaMask", "Ledger", etc.)
- Botao "Escanear" com loading state
- Feedback: "Encontramos X tokens em Y chains"

**`src/components/app/wallet-card.tsx`**
- Card resumo de cada carteira rastreada
- Endereco truncado + label
- Saldo total + chains ativas
- Botoes: re-escanear, editar label, remover

### API Routes

**`src/app/api/scan/route.ts`**
- POST `{ address: string }`
- Valida endereco
- Escaneia todas as chains
- Retorna `WalletScanResult`
- Rate limit: 1 scan por minuto por IP

**`src/app/api/prices/route.ts`**
- GET `?ids=bitcoin,ethereum,solana`
- Proxy para CoinGecko com cache server-side
- Evita expor API key no client

---

## FASE 3: Sistema de Pagamento (Dia 3)

### Objetivo
Implementar fluxo completo de pagamento com stablecoins e verificacao on-chain.

### Arquivos a Criar

#### 3.1 — Pagina de Upgrade
**`src/app/app/upgrade/page.tsx`**

Layout step-by-step:
```
Passo 1: Escolha seu plano
  [Mensal $0.99/mes]  [Anual $9.99/ano — economize 17%]

Passo 2: Escolha o token
  [USDT]  [USDC]

Passo 3: Escolha a rede
  [Ethereum] [Polygon] [Arbitrum] [BSC] [Base]
  (mostrar estimativa de gas fee por rede)

Passo 4: Envie o pagamento
  ┌─────────────────────────────────────────┐
  │ Envie exatamente $0.99 em USDT          │
  │ para o endereco abaixo:                 │
  │                                         │
  │ 0x1234...5678 [Copiar]                  │
  │                                         │
  │ [QR CODE]                               │
  │                                         │
  │ Rede: Polygon                           │
  │ Token: USDT (0xc213...)                 │
  │ Valor: 0.990000                         │
  │                                         │
  │ ⚠ Envie APENAS USDT na rede Polygon.   │
  │   Enviar outro token resultara em perda.│
  └─────────────────────────────────────────┘

Passo 5: Confirmar pagamento
  [Input: Cole o TX Hash aqui]
  [Verificar Pagamento]
```

Animacao: transicao suave entre passos com Framer Motion. Progress bar no topo.

#### 3.2 — Verificacao de Transacao
**`src/lib/verify-tx.ts`**

```typescript
import { createPublicClient, http, parseAbiItem } from "viem";
import { mainnet, polygon, arbitrum, bsc, base } from "viem/chains";

interface VerificationResult {
  valid: boolean;
  error?: string;
  details?: {
    from: string;
    to: string;
    amount: string;
    token: string;
    chain: string;
    confirmations: number;
  };
}

export async function verifyPayment(params: {
  txHash: string;
  chain: string;
  expectedToken: "USDT" | "USDC";
  expectedAmount: number;
  receivingWallet: string;
}): Promise<VerificationResult>;

// Logica de verificacao:
// 1. Criar client viem para a chain especificada
// 2. Buscar receipt da transacao (getTransactionReceipt)
// 3. Verificar se TX esta confirmada (>= 3 confirmacoes)
// 4. Parsear logs do evento Transfer(address,address,uint256)
// 5. Verificar:
//    a. O destinatario (to) eh nossa carteira?
//    b. O token (endereco do contrato) eh USDT ou USDC?
//    c. O valor eh >= esperado (tolerancia de 1%)?
// 6. Retornar resultado
```

#### 3.3 — API Route de Verificacao
**`src/app/api/verify-payment/route.ts`**

```typescript
// POST { txHash, chain, token, plan, period }
// 1. Valida parametros
// 2. Verifica se txHash ja foi usado (tabela payments)
// 3. Chama verifyPayment()
// 4. Se valido:
//    a. Insere registro em payments (verified: true)
//    b. Atualiza profiles: plan='pro', plan_expires_at = now + 30d ou 365d
//    c. Retorna { success: true }
// 5. Se invalido:
//    a. Insere registro em payments (verified: false) para auditoria
//    b. Retorna { success: false, error: "motivo" }

// Usa SUPABASE_SERVICE_ROLE_KEY para bypass RLS na atualizacao
```

#### 3.4 — Componentes de Pagamento

**`src/components/app/payment-flow.tsx`**
- Componente principal com state machine (5 passos)
- Animacoes entre passos
- Persistencia do passo atual no localStorage (usuario pode sair e voltar)

**`src/components/app/qr-code.tsx`**
- Wrapper do `qrcode.react`
- Gera QR do endereco da carteira
- Tamanho responsivo
- Borda branca para scan facil

**`src/components/app/plan-comparison.tsx`**
- Tabela comparativa Free vs Pro
- Highlight no plano Pro
- Badge "Mais popular"

#### 3.5 — Constantes de Pagamento
**`src/lib/constants.ts`**

Enderecos de contratos USDT e USDC por rede + configuracao de chains (conforme definido acima na secao "Contratos de Tokens").

---

## FASE 4: UI Polish + Features (Dia 4)

### Objetivo
Polir a experiencia, adicionar features Pro, responsividade total e estados de loading/erro/vazio.

### Tarefas

#### 4.1 — Dashboard Home Aprimorado
**`src/app/app/page.tsx`** (atualizar)

Cards de resumo:
- Saldo total com sparkline
- Melhor performer do dia
- Pior performer do dia
- Proximos alertas ativos

#### 4.2 — Alertas de Preco (Pro)
**`src/app/app/alerts/page.tsx`**

- Lista de alertas ativos
- Criar alerta: selecionar token, preco alvo, direcao (acima/abaixo)
- Verificacao no page load (comparar preco atual com alvo)
- Notificacao visual quando alerta dispara
- Limite: Free nao tem acesso, Pro ilimitado

#### 4.3 — Exportacao (Pro)
**`src/lib/export.ts`**

- `exportCSV(portfolio)` — gera CSV com todos os tokens, saldos, valores
- `exportPDF(portfolio)` — gera PDF estilizado com logo Folio
  - Usar `jspdf` + `jspdf-autotable`
  - Layout: header com logo, data, resumo, tabela de tokens

#### 4.4 — Configuracoes
**`src/app/app/settings/page.tsx`**

Secoes:
- **Perfil:** email, avatar, carteira conectada
- **Carteiras:** lista de carteiras rastreadas, editar/remover
- **Plano:** status atual, data de expiracao, botao upgrade/renovar
- **Preferencias:** tema claro/escuro, moeda padrao (USD/EUR/BRL)
- **Conta:** logout, deletar conta

#### 4.5 — Dark Mode
**`src/lib/theme-context.tsx`**

- Toggle claro/escuro
- Persistir no localStorage
- CSS variables para troca de tema
- Paleta escura:
  - Background: `#0A0A0A`
  - Cards: `#141414`
  - Borders: `#1F1F1F`
  - Text: `#FAFAFA`
  - Accent: `#FFFFFF`

#### 4.6 — Loading States
Criar componentes de skeleton:

**`src/components/app/skeletons.tsx`**
- `DashboardSkeleton` — cards pulsando
- `PortfolioSkeleton` — linhas de token pulsando
- `ChartSkeleton` — area retangular pulsando
- Usar `tw-animate-css` (ja instalado) para animacao pulse

#### 4.7 — Empty States
**`src/components/app/empty-states.tsx`**
- `NoWallets` — ilustracao + "Adicione sua primeira carteira"
- `EmptyPortfolio` — "Nenhum token encontrado neste endereco"
- `NoAlerts` — "Crie seu primeiro alerta de preco"
- Estilo: icone Lucide grande + texto + CTA

#### 4.8 — Error States
**`src/components/app/error-boundary.tsx`**
- Boundary de erro global para o app
- Mensagem amigavel + botao "Tentar novamente"
- Logging de erros

#### 4.9 — Responsividade
- Sidebar: colapsa para bottom tab bar em mobile (< 768px)
- Portfolio: token rows empilham verticalmente
- Charts: altura reduzida, scroll horizontal se necessario
- Payment flow: steps empilhados, QR code centralizado
- Testar em 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px+

---

## FASE 5: Deploy + Otimizacao (Dia 5)

### Objetivo
Deploy em producao, otimizacoes de performance e seguranca.

### Tarefas

#### 5.1 — Deploy Vercel
- Conectar repo ao Vercel
- Configurar env vars no Vercel Dashboard
- Dominio: folio.app ou sub do dominio existente

#### 5.2 — Supabase Producao
- [ ] Rodar migrations em producao
- [ ] Configurar URLs de callback OAuth para dominio de producao
- [ ] Testar RLS policies
- [ ] Habilitar email confirmations

#### 5.3 — Rate Limiting
**`src/lib/rate-limit.ts`**

- Rate limit por IP nas API routes
- `/api/scan` — 10 req/min
- `/api/verify-payment` — 5 req/min
- `/api/prices` — 30 req/min
- Usar Map em memoria (para Vercel: considerar Upstash Redis no futuro)

#### 5.4 — Performance
- Lazy load do Recharts (dynamic import com `next/dynamic`)
- Code split por rota (ja automatico com App Router)
- Cache de precos no server (revalidate: 60)
- Imagens de tokens via `next/image` com CDN
- Prefetch de rotas adjacentes

#### 5.5 — SEO
- Meta tags em `layout.tsx` do app
- OG image para compartilhamento
- Sitemap atualizado incluindo `/app`
- robots.txt: bloquear `/app/*` (area logada)

#### 5.6 — Monitoramento
- Error boundary com logging
- Considerar Sentry para producao (futuro)
- Health check endpoint: `/api/health`

---

## Design System do App

Herdado da landing V2, adaptado para app:

| Elemento | Especificacao |
|----------|---------------|
| **Background** | `white` (claro) / `#0A0A0A` (escuro) |
| **Headings** | Instrument Serif, `text-gray-900` |
| **Body text** | System sans-serif, `text-gray-600` |
| **Cards** | `rounded-2xl`, `border border-gray-100`, `hover:shadow-sm` |
| **Botoes primarios** | `bg-gray-900 text-white rounded-xl px-6 py-3` |
| **Botoes secundarios** | `border border-gray-200 text-gray-700 rounded-xl` |
| **Inputs** | `rounded-xl border border-gray-200 px-4 py-3` |
| **Sidebar** | `w-64 border-r border-gray-100` |
| **Accent positivo** | `text-emerald-600` |
| **Accent negativo** | `text-red-500` |
| **Spacing** | Generoso — `p-6` minimo em cards, `gap-6` entre secoes |
| **Transicoes** | Framer Motion, `duration: 0.3`, `ease: [0.25, 0.1, 0.25, 1]` |
| **Feel geral** | Clean, premium, minimal — Bloomberg desenhado pela Apple |

---

## Mapa Completo de Arquivos

```
src/
├── app/
│   ├── app/
│   │   ├── layout.tsx              ← Layout com sidebar
│   │   ├── page.tsx                ← Dashboard principal
│   │   ├── login/
│   │   │   └── page.tsx            ← Login (3 metodos)
│   │   ├── portfolio/
│   │   │   └── page.tsx            ← Portfolio completo
│   │   ├── alerts/
│   │   │   └── page.tsx            ← Alertas de preco (Pro)
│   │   ├── upgrade/
│   │   │   └── page.tsx            ← Fluxo de pagamento
│   │   └── settings/
│   │       └── page.tsx            ← Configuracoes
│   ├── api/
│   │   ├── scan/
│   │   │   └── route.ts            ← Escaneamento de carteira
│   │   ├── prices/
│   │   │   └── route.ts            ← Proxy precos CoinGecko
│   │   ├── verify-payment/
│   │   │   └── route.ts            ← Verificacao on-chain
│   │   └── health/
│   │       └── route.ts            ← Health check
│   └── auth/
│       └── callback/
│           └── route.ts            ← OAuth callback
├── components/
│   └── app/
│       ├── token-row.tsx           ← Linha de token
│       ├── chain-badge.tsx         ← Badge de chain
│       ├── portfolio-chart.tsx     ← Grafico de portfolio
│       ├── add-wallet-modal.tsx    ← Modal adicionar carteira
│       ├── wallet-card.tsx         ← Card de carteira
│       ├── payment-flow.tsx        ← UI de pagamento step-by-step
│       ├── qr-code.tsx             ← Gerador QR code
│       ├── plan-comparison.tsx     ← Comparacao Free vs Pro
│       ├── skeletons.tsx           ← Loading skeletons
│       ├── empty-states.tsx        ← Estados vazios
│       └── error-boundary.tsx      ← Boundary de erro
├── lib/
│   ├── supabase.ts                 ← Cliente browser
│   ├── supabase-server.ts          ← Cliente server
│   ├── auth-context.tsx            ← Provider de auth
│   ├── theme-context.tsx           ← Provider de tema
│   ├── scanner.ts                  ← Scanner multi-chain
│   ├── prices.ts                   ← Fetcher de precos
│   ├── verify-tx.ts                ← Verificacao de TX on-chain
│   ├── constants.ts                ← Constantes (enderecos, chains, precos)
│   ├── export.ts                   ← Exportacao CSV/PDF
│   └── rate-limit.ts              ← Rate limiting
├── middleware.ts                    ← Protecao de rotas
└── supabase/
    └── schema.sql                  ← Schema do banco
```

**Total: 30 arquivos novos**

---

## Checklist de Lancamento

### Funcionalidade
- [ ] Auth funciona (wallet + Google + email)
- [ ] Scan de carteira funciona para EVM (ETH, Polygon, Arbitrum, BSC, Base, Optimism)
- [ ] Scan de carteira funciona para Solana
- [ ] Portfolio exibe tokens com precos corretos
- [ ] Grafico de historico funciona
- [ ] NFTs sao detectados e exibidos
- [ ] Pagamento on-chain funciona end-to-end
- [ ] Verificacao de TX on-chain funciona para todas as redes
- [ ] Features Pro sao gated corretamente (alertas, export, multi-wallet)
- [ ] Plano Free respeita limites (1 carteira, $1000)

### UX
- [ ] Mobile responsivo (375px ate 1440px+)
- [ ] Dark mode funciona
- [ ] Loading skeletons em todas as paginas com dados
- [ ] Empty states amigaveis
- [ ] Error states com recovery
- [ ] Transicoes suaves (Framer Motion)
- [ ] Landing V2 -> App flow suave (botoes CTA apontam para /app)

### Seguranca
- [ ] RLS ativo em todas as tabelas Supabase
- [ ] Rate limiting em todas as API routes
- [ ] Service role key nunca exposta no client
- [ ] TX hash nao pode ser reutilizado
- [ ] Middleware protege rotas /app/*

### Deploy
- [ ] Vercel com env vars configuradas
- [ ] Supabase em producao
- [ ] Dominio configurado
- [ ] SSL ativo
- [ ] Health check respondendo

---

## Decisoes Tecnicas

1. **Por que viem e nao ethers.js?** — viem eh mais moderno, tree-shakeable, tipagem superior, e eh o padrao do ecossistema wagmi/Next.js.

2. **Por que nao usar wagmi/RainbowKit?** — Para o MVP, conexao direta via `window.ethereum` eh mais simples. wagmi pode ser adicionado na V2 se necessario.

3. **Por que proxy de precos no server?** — Proteger API key do CoinGecko, implementar cache server-side, e evitar CORS issues.

4. **Por que pagamento manual e nao smart contract?** — Simplicidade. Um smart contract de pagamento adiciona complexidade de deploy em 5 chains. Transfer direto de stablecoin com verificacao on-chain eh suficiente para o MVP.

5. **Por que nao Stripe?** — O publico-alvo eh cripto-nativo. Pagamento com stablecoins eh mais alinhado com o produto e evita fees de processamento.

---

*Plano criado em 2026-04-11. Pronto para execucao fase por fase.*
