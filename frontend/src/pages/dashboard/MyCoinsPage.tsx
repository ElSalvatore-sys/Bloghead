import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getWallets,
  getTransactions,
  getTransactionStats,
  COIN_PACKAGES,
  TRANSACTION_TYPE_CONFIG,
  EARN_METHODS,
  formatCoinAmount,
  formatEurAmount,
  formatTransactionDate,
  type CoinWallet,
  type CoinTransaction,
  type CoinStats
} from '../../services/coinsService'

type TabType = 'all' | 'earned' | 'spent' | 'purchased'

// Balance Card Component
function BalanceCard({
  wallet,
  isMain
}: {
  wallet: CoinWallet
  isMain: boolean
}) {
  const coinType = wallet.coin_type
  const symbol = coinType?.symbol || 'BHC'
  const name = coinType?.name || 'Bloghead Coins'

  return (
    <div className={`rounded-2xl p-6 border ${
      isMain
        ? 'bg-gradient-to-br from-purple-500/20 to-orange-500/20 border-purple-500/30'
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {wallet.balance.toLocaleString('de-DE')}
            </span>
            <span className="text-xl text-purple-400">{symbol}</span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-2xl">
          🪙
        </div>
      </div>

      {/* Value in EUR */}
      {coinType && (
        <p className="text-sm text-gray-400 mb-4">
          ≈ {formatEurAmount(wallet.balance * (coinType.current_value || 1))}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-gray-500">Erhalten</p>
          <p className="text-sm text-green-400">+{formatCoinAmount(wallet.total_received, symbol)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ausgegeben</p>
          <p className="text-sm text-red-400">-{formatCoinAmount(wallet.total_spent, symbol)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Gesperrt</p>
          <p className="text-sm text-yellow-400">{formatCoinAmount(wallet.locked_balance, symbol)}</p>
        </div>
      </div>
    </div>
  )
}

// Transaction Item Component
function TransactionItem({
  transaction,
  walletIds
}: {
  transaction: CoinTransaction
  walletIds: string[]
}) {
  const config = TRANSACTION_TYPE_CONFIG[transaction.transaction_type]
  const isIncoming = transaction.to_wallet_id && walletIds.includes(transaction.to_wallet_id)
  const sign = transaction.transaction_type === 'transfer'
    ? (isIncoming ? '+' : '-')
    : config.sign
  const symbol = transaction.coin_type?.symbol || 'BHC'

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-xl`}>
        {config.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-medium">{config.label}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
            {transaction.transaction_type}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate">
          {transaction.description || 'Transaktion'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTransactionDate(transaction.created_at)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className={`text-lg font-bold ${
          sign === '+' ? 'text-green-400' : sign === '-' ? 'text-red-400' : 'text-white'
        }`}>
          {sign}{formatCoinAmount(transaction.amount, symbol)}
        </p>
        {transaction.value_at_transaction && (
          <p className="text-xs text-gray-500">
            ≈ {formatEurAmount(transaction.amount * transaction.value_at_transaction)}
          </p>
        )}
      </div>
    </div>
  )
}

// Coin Package Card Component
function PackageCard({
  pkg,
  onSelect
}: {
  pkg: typeof COIN_PACKAGES[0]
  onSelect: () => void
}) {
  const totalCoins = pkg.amount + pkg.bonus

  return (
    <button
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all text-left ${
        pkg.popular
          ? 'bg-gradient-to-br from-purple-500/20 to-orange-500/20 border-purple-500/50 hover:border-purple-500'
          : 'bg-white/5 border-white/10 hover:border-white/30'
      }`}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-xs rounded-full">
          Beliebt
        </span>
      )}

      {/* Label */}
      <p className="text-xs text-gray-400 mb-2">{pkg.label}</p>

      {/* Amount */}
      <div className="mb-2">
        <span className="text-2xl font-bold text-white">{pkg.amount.toLocaleString()}</span>
        <span className="text-sm text-purple-400 ml-1">BHC</span>
      </div>

      {/* Bonus */}
      {pkg.bonus > 0 && (
        <p className="text-sm text-green-400 mb-2">
          +{pkg.bonus} Bonus
        </p>
      )}

      {/* Price */}
      <p className="text-lg font-medium text-white">
        {formatEurAmount(pkg.price)}
      </p>

      {/* Per coin price */}
      <p className="text-xs text-gray-500 mt-1">
        {formatEurAmount(pkg.price / totalCoins)}/Coin
      </p>
    </button>
  )
}

// Earn Method Card Component
function EarnMethodCard({
  method
}: {
  method: typeof EARN_METHODS[0]
}) {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">
          {method.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{method.title}</h4>
          <p className="text-sm text-gray-400 mb-2">{method.description}</p>
          <span className="text-sm text-green-400">+{method.amount} BHC</span>
        </div>
      </div>
    </div>
  )
}

// Stats Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  subtext
}: {
  label: string
  value: string | number
  icon: string
  color: string
  subtext?: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ type }: { type: 'no-transactions' | 'no-wallet' }) {
  const config = {
    'no-transactions': {
      icon: '📋',
      title: 'Keine Transaktionen',
      description: 'Du hast noch keine Coin-Transaktionen. Kaufe oder verdiene Coins, um loszulegen.'
    },
    'no-wallet': {
      icon: '🪙',
      title: 'Kein Wallet',
      description: 'Du hast noch kein Coin-Wallet. Melde dich an, um eines zu erstellen.'
    }
  }

  const { icon, title, description } = config[type]

  return (
    <div className="text-center py-12">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto">{description}</p>
    </div>
  )
}

// Mock Data Generator
function generateMockData(): {
  wallets: CoinWallet[]
  transactions: CoinTransaction[]
  stats: CoinStats
} {
  const mockWallets: CoinWallet[] = [
    {
      id: 'wallet1',
      user_id: 'currentUser',
      coin_type_id: 'bhc',
      balance: 1247.50,
      locked_balance: 50,
      total_received: 1547.50,
      total_spent: 300,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-07T10:00:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    }
  ]

  const mockTransactions: CoinTransaction[] = [
    {
      id: 'tx1',
      coin_type_id: 'bhc',
      from_wallet_id: null,
      to_wallet_id: 'wallet1',
      amount: 500,
      value_at_transaction: 1.03,
      transaction_type: 'purchase',
      booking_id: null,
      description: 'Coin-Paket "Popular" gekauft',
      metadata: null,
      created_at: '2024-12-07T09:00:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    },
    {
      id: 'tx2',
      coin_type_id: 'bhc',
      from_wallet_id: 'wallet1',
      to_wallet_id: 'walletArtist',
      amount: 150,
      value_at_transaction: 1.04,
      transaction_type: 'spend',
      booking_id: 'booking1',
      description: 'Trinkgeld für DJ Soundwave',
      metadata: null,
      created_at: '2024-12-06T18:30:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    },
    {
      id: 'tx3',
      coin_type_id: 'bhc',
      from_wallet_id: null,
      to_wallet_id: 'wallet1',
      amount: 25,
      value_at_transaction: 1.04,
      transaction_type: 'reward',
      booking_id: null,
      description: 'Belohnung: Freund eingeladen',
      metadata: null,
      created_at: '2024-12-05T14:00:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    },
    {
      id: 'tx4',
      coin_type_id: 'bhc',
      from_wallet_id: 'walletFriend',
      to_wallet_id: 'wallet1',
      amount: 100,
      value_at_transaction: 1.02,
      transaction_type: 'transfer',
      booking_id: null,
      description: 'Geschenk von MaxMuster123',
      metadata: null,
      created_at: '2024-12-03T11:00:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    },
    {
      id: 'tx5',
      coin_type_id: 'bhc',
      from_wallet_id: 'wallet1',
      to_wallet_id: 'walletVenue',
      amount: 50,
      value_at_transaction: 1.01,
      transaction_type: 'spend',
      booking_id: null,
      description: 'Premium-Platz reserviert',
      metadata: null,
      created_at: '2024-11-28T20:00:00Z',
      coin_type: {
        id: 'bhc',
        name: 'Bloghead Coins',
        symbol: 'BHC',
        type: 'bloghead',
        artist_id: null,
        initial_value: 1.01,
        current_value: 1.05,
        value_per_fan: 0.01,
        total_supply: null,
        circulating_supply: 1000000,
        max_supply: null,
        total_fans: 4000,
        value_factor: 1.0,
        is_active: true,
        is_tradeable: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    }
  ]

  const mockStats: CoinStats = {
    totalBalance: 1247.50,
    totalReceived: 1547.50,
    totalSpent: 300,
    lockedBalance: 50,
    transactionCount: 12,
    lastTransaction: '2024-12-07T09:00:00Z'
  }

  return { wallets: mockWallets, transactions: mockTransactions, stats: mockStats }
}

export default function MyCoinsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  const [wallets, setWallets] = useState<CoinWallet[]>([])
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [stats, setStats] = useState<CoinStats>({
    totalBalance: 0,
    totalReceived: 0,
    totalSpent: 0,
    lockedBalance: 0,
    transactionCount: 0,
    lastTransaction: null
  })

  // Demo mode detection
  const isDemoMode = !user
  const currentUserId = user?.id || 'currentUser'

  // Get wallet IDs for transaction direction detection
  const walletIds = wallets.map(w => w.id)

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      if (isDemoMode) {
        const mockData = generateMockData()
        setWallets(mockData.wallets)
        setTransactions(mockData.transactions)
        setStats(mockData.stats)
        setIsLoading(false)
        return
      }

      try {
        const [walletsRes, transactionsRes, statsRes] = await Promise.all([
          getWallets(currentUserId),
          getTransactions(currentUserId, { limit: 20 }),
          getTransactionStats(currentUserId)
        ])

        setWallets(walletsRes.data || [])
        setTransactions(transactionsRes.data || [])
        setStats(statsRes)
      } catch (error) {
        console.error('Error loading coins data:', error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [currentUserId, isDemoMode])

  // Filter transactions by tab
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true
    if (activeTab === 'earned') return tx.transaction_type === 'reward' || tx.transaction_type === 'refund'
    if (activeTab === 'spent') return tx.transaction_type === 'spend'
    if (activeTab === 'purchased') return tx.transaction_type === 'purchase'
    return true
  })

  // Get primary wallet (Bloghead coins)
  const primaryWallet = wallets.find(w => w.coin_type?.type === 'bloghead') || wallets[0]

  // Tab config
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'all', label: 'Alle', icon: '📋' },
    { id: 'earned', label: 'Verdient', icon: '🎁' },
    { id: 'spent', label: 'Ausgegeben', icon: '💸' },
    { id: 'purchased', label: 'Gekauft', icon: '🛒' }
  ]

  return (
    <div className="min-h-screen bg-[#171717] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Meine Coins</h1>
          <p className="text-gray-400">
            Verwalte dein Coin-Guthaben und sieh deine Transaktionen
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-sm">
              🎭 <strong>Demo-Modus:</strong> Du siehst Beispieldaten. Melde dich an, um dein echtes Wallet zu sehen.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            {primaryWallet && (
              <div className="mb-8">
                <BalanceCard wallet={primaryWallet} isMain={true} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setShowBuyModal(true)}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <span>🛒</span>
                <span>Coins kaufen</span>
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <span>🎁</span>
                <span>Coins verschenken</span>
              </button>
              <a
                href="#earn"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <span>💡</span>
                <span>Wie verdiene ich Coins?</span>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Transaktionen"
                value={stats.transactionCount}
                icon="📊"
                color="bg-purple-500/20"
              />
              <StatCard
                label="Erhalten (gesamt)"
                value={formatCoinAmount(stats.totalReceived, '')}
                icon="📥"
                color="bg-green-500/20"
              />
              <StatCard
                label="Ausgegeben (gesamt)"
                value={formatCoinAmount(stats.totalSpent, '')}
                icon="📤"
                color="bg-red-500/20"
              />
              <StatCard
                label="Letzte Transaktion"
                value={stats.lastTransaction ? formatTransactionDate(stats.lastTransaction) : '-'}
                icon="🕐"
                color="bg-blue-500/20"
              />
            </div>

            {/* Transaction History */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Transaktionsverlauf</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Transaction List */}
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      walletIds={walletIds}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-transactions" />
              )}
            </div>

            {/* Coin Packages */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Coin-Pakete</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {COIN_PACKAGES.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onSelect={() => {
                      setShowBuyModal(true)
                      // In real implementation, would select this package
                    }}
                  />
                ))}
              </div>
            </div>

            {/* How to Earn Section */}
            <div id="earn" className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">So verdienst du Coins</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EARN_METHODS.map(method => (
                  <EarnMethodCard key={method.id} method={method} />
                ))}
              </div>
            </div>

            {/* Additional Wallets (if any) */}
            {wallets.length > 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Weitere Coins</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wallets.filter(w => w.id !== primaryWallet?.id).map(wallet => (
                    <BalanceCard key={wallet.id} wallet={wallet} isMain={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Buy Modal (Placeholder) */}
        {showBuyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1f1f1f] rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Coins kaufen</h3>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Die Kaufoption ist noch nicht verfügbar. Diese Funktion wird bald freigeschaltet!
              </p>
              <button
                onClick={() => setShowBuyModal(false)}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}

        {/* Send Modal (Placeholder) */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1f1f1f] rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Coins verschenken</h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Die Geschenkfunktion ist noch nicht verfügbar. Diese Funktion wird bald freigeschaltet!
              </p>
              <button
                onClick={() => setShowSendModal(false)}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
