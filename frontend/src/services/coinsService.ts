import { supabase } from '../lib/supabase'

// Transaction types
export type CoinTransactionType = 'purchase' | 'transfer' | 'reward' | 'spend' | 'refund' | 'artist_mint'
export type CoinType = 'bloghead' | 'kuenstlerhead'

// Coin Type interface
export interface CoinTypeInfo {
  id: string
  name: string
  symbol: string
  type: CoinType
  artist_id: string | null
  initial_value: number
  current_value: number
  value_per_fan: number
  total_supply: number | null
  circulating_supply: number
  max_supply: number | null
  total_fans: number
  value_factor: number
  is_active: boolean
  is_tradeable: boolean
  created_at: string
  updated_at: string | null
}

// Wallet interface
export interface CoinWallet {
  id: string
  user_id: string
  coin_type_id: string
  balance: number
  locked_balance: number
  total_received: number
  total_spent: number
  created_at: string
  updated_at: string | null
  // Joined coin type data
  coin_type?: CoinTypeInfo
}

// Transaction interface
export interface CoinTransaction {
  id: string
  coin_type_id: string
  from_wallet_id: string | null
  to_wallet_id: string | null
  amount: number
  value_at_transaction: number | null
  transaction_type: CoinTransactionType
  booking_id: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  // Joined data
  coin_type?: CoinTypeInfo
  from_wallet?: {
    id: string
    user_id: string
    user?: {
      id: string
      membername: string | null
      profile_image_url: string | null
    }
  }
  to_wallet?: {
    id: string
    user_id: string
    user?: {
      id: string
      membername: string | null
      profile_image_url: string | null
    }
  }
}

// Coin stats
export interface CoinStats {
  totalBalance: number
  totalReceived: number
  totalSpent: number
  lockedBalance: number
  transactionCount: number
  lastTransaction: string | null
}

// Coin package for purchasing
export interface CoinPackage {
  id: string
  amount: number
  price: number
  bonus: number
  popular: boolean
  label: string
}

// Get user's wallets
export async function getWallets(
  userId: string
): Promise<{ data: CoinWallet[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('coin_wallets')
    .select(`
      *,
      coin_type:coin_types!coin_type_id(*)
    `)
    .eq('user_id', userId)
    .order('balance', { ascending: false })

  return { data: data as CoinWallet[] | null, error }
}

// Get primary Bloghead wallet
export async function getBlogheadWallet(
  userId: string
): Promise<{ data: CoinWallet | null; error: Error | null }> {
  // First get the Bloghead coin type
  const { data: coinType } = await supabase
    .from('coin_types')
    .select('id')
    .eq('type', 'bloghead')
    .single()

  if (!coinType) {
    return { data: null, error: new Error('Bloghead coin type not found') }
  }

  const { data, error } = await supabase
    .from('coin_wallets')
    .select(`
      *,
      coin_type:coin_types!coin_type_id(*)
    `)
    .eq('user_id', userId)
    .eq('coin_type_id', coinType.id)
    .single()

  return { data: data as CoinWallet | null, error }
}

// Get transactions for a user
export async function getTransactions(
  userId: string,
  options?: {
    walletId?: string
    type?: CoinTransactionType
    limit?: number
    offset?: number
  }
): Promise<{ data: CoinTransaction[] | null; error: Error | null; count: number }> {
  // First get user's wallet IDs
  const { data: wallets } = await supabase
    .from('coin_wallets')
    .select('id')
    .eq('user_id', userId)

  if (!wallets || wallets.length === 0) {
    return { data: [], error: null, count: 0 }
  }

  const walletIds = options?.walletId ? [options.walletId] : wallets.map(w => w.id)

  let query = supabase
    .from('coin_transactions')
    .select(`
      *,
      coin_type:coin_types!coin_type_id(id, name, symbol, current_value)
    `, { count: 'exact' })
    .or(`from_wallet_id.in.(${walletIds.join(',')}),to_wallet_id.in.(${walletIds.join(',')})`)
    .order('created_at', { ascending: false })

  if (options?.type) {
    query = query.eq('transaction_type', options.type)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  return { data: data as CoinTransaction[] | null, error, count: count || 0 }
}

// Get transaction stats
export async function getTransactionStats(userId: string): Promise<CoinStats> {
  const stats: CoinStats = {
    totalBalance: 0,
    totalReceived: 0,
    totalSpent: 0,
    lockedBalance: 0,
    transactionCount: 0,
    lastTransaction: null
  }

  // Get wallet stats
  const { data: wallets } = await supabase
    .from('coin_wallets')
    .select('balance, locked_balance, total_received, total_spent')
    .eq('user_id', userId)

  if (wallets) {
    wallets.forEach(wallet => {
      stats.totalBalance += wallet.balance || 0
      stats.lockedBalance += wallet.locked_balance || 0
      stats.totalReceived += wallet.total_received || 0
      stats.totalSpent += wallet.total_spent || 0
    })
  }

  // Get transaction count
  const { data: walletIds } = await supabase
    .from('coin_wallets')
    .select('id')
    .eq('user_id', userId)

  if (walletIds && walletIds.length > 0) {
    const ids = walletIds.map(w => w.id)
    const { count } = await supabase
      .from('coin_transactions')
      .select('*', { count: 'exact', head: true })
      .or(`from_wallet_id.in.(${ids.join(',')}),to_wallet_id.in.(${ids.join(',')})`)
    stats.transactionCount = count || 0

    // Get last transaction
    const { data: lastTx } = await supabase
      .from('coin_transactions')
      .select('created_at')
      .or(`from_wallet_id.in.(${ids.join(',')}),to_wallet_id.in.(${ids.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    stats.lastTransaction = lastTx?.created_at || null
  }

  return stats
}

// Send coins to another user
export async function sendCoins(
  fromUserId: string,
  toUserId: string,
  amount: number,
  coinTypeId: string,
  description?: string
): Promise<{ data: CoinTransaction | null; error: Error | null }> {
  // Get wallets
  const { data: fromWallet } = await supabase
    .from('coin_wallets')
    .select('id, balance')
    .eq('user_id', fromUserId)
    .eq('coin_type_id', coinTypeId)
    .single()

  if (!fromWallet || fromWallet.balance < amount) {
    return { data: null, error: new Error('Insufficient balance') }
  }

  const { data: toWallet } = await supabase
    .from('coin_wallets')
    .select('id')
    .eq('user_id', toUserId)
    .eq('coin_type_id', coinTypeId)
    .single()

  // Create recipient wallet if it doesn't exist
  let toWalletId = toWallet?.id
  if (!toWalletId) {
    const { data: newWallet } = await supabase
      .from('coin_wallets')
      .insert({ user_id: toUserId, coin_type_id: coinTypeId })
      .select()
      .single()
    toWalletId = newWallet?.id
  }

  if (!toWalletId) {
    return { data: null, error: new Error('Failed to create recipient wallet') }
  }

  // Get current coin value
  const { data: coinType } = await supabase
    .from('coin_types')
    .select('current_value')
    .eq('id', coinTypeId)
    .single()

  // Create transaction
  const { data, error } = await supabase
    .from('coin_transactions')
    .insert({
      coin_type_id: coinTypeId,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWalletId,
      amount,
      value_at_transaction: coinType?.current_value || null,
      transaction_type: 'transfer',
      description: description || 'Coin Transfer'
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  // Update balances
  await supabase
    .from('coin_wallets')
    .update({
      balance: fromWallet.balance - amount,
      total_spent: supabase.rpc('increment', { x: amount }),
      updated_at: new Date().toISOString()
    })
    .eq('id', fromWallet.id)

  await supabase
    .from('coin_wallets')
    .update({
      balance: supabase.rpc('increment', { x: amount }),
      total_received: supabase.rpc('increment', { x: amount }),
      updated_at: new Date().toISOString()
    })
    .eq('id', toWalletId)

  return { data: data as CoinTransaction, error: null }
}

// Predefined coin packages
export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg1', amount: 100, price: 9.99, bonus: 0, popular: false, label: 'Starter' },
  { id: 'pkg2', amount: 250, price: 19.99, bonus: 25, popular: false, label: 'Basic' },
  { id: 'pkg3', amount: 500, price: 39.99, bonus: 75, popular: true, label: 'Popular' },
  { id: 'pkg4', amount: 1000, price: 74.99, bonus: 200, popular: false, label: 'Pro' },
  { id: 'pkg5', amount: 2500, price: 179.99, bonus: 625, popular: false, label: 'Business' }
]

// Get current Bloghead coin value
export async function getBlogheadCoinValue(): Promise<number> {
  const { data } = await supabase
    .from('coin_types')
    .select('current_value')
    .eq('type', 'bloghead')
    .single()

  return data?.current_value || 1.01
}

// Get coin value history
export async function getCoinValueHistory(
  coinTypeId: string,
  days: number = 30
): Promise<{ data: { value: number; recorded_at: string }[] | null; error: Error | null }> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('coin_value_history')
    .select('value, recorded_at')
    .eq('coin_type_id', coinTypeId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true })

  return { data, error }
}

// Transaction type display config
export const TRANSACTION_TYPE_CONFIG: Record<CoinTransactionType, {
  label: string
  icon: string
  color: string
  bgColor: string
  sign: '+' | '-' | ''
}> = {
  purchase: {
    label: 'Gekauft',
    icon: '🛒',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    sign: '+'
  },
  transfer: {
    label: 'Transfer',
    icon: '↔️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    sign: ''
  },
  reward: {
    label: 'Belohnung',
    icon: '🎁',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    sign: '+'
  },
  spend: {
    label: 'Ausgegeben',
    icon: '💸',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    sign: '-'
  },
  refund: {
    label: 'Rückerstattung',
    icon: '↩️',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    sign: '+'
  },
  artist_mint: {
    label: 'Künstler-Prägung',
    icon: '🎨',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    sign: '+'
  }
}

// Format coin amount
export function formatCoinAmount(amount: number, symbol: string = 'BHC'): string {
  return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbol}`
}

// Format EUR amount
export function formatEurAmount(amount: number): string {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

// Format transaction date
export function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Ways to earn coins
export const EARN_METHODS = [
  {
    id: 'booking',
    title: 'Buchungen abschließen',
    description: 'Verdiene Coins für jede erfolgreiche Buchung als Künstler oder Veranstalter.',
    icon: '📅',
    amount: '5-50'
  },
  {
    id: 'review',
    title: 'Bewertungen schreiben',
    description: 'Schreibe eine Bewertung nach einer Veranstaltung und erhalte Coins.',
    icon: '⭐',
    amount: '5'
  },
  {
    id: 'referral',
    title: 'Freunde einladen',
    description: 'Lade Freunde zu Bloghead ein und erhalte Coins wenn sie sich anmelden.',
    icon: '👥',
    amount: '25'
  },
  {
    id: 'profile',
    title: 'Profil vervollständigen',
    description: 'Fülle dein Profil zu 100% aus und erhalte einmalig Bonus-Coins.',
    icon: '✨',
    amount: '10'
  },
  {
    id: 'event',
    title: 'Events besuchen',
    description: 'Besuche Events und checke ein, um Coins zu verdienen.',
    icon: '🎉',
    amount: '3'
  }
]
