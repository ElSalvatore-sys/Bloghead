/**
 * DashboardSkeletons - Reusable loading skeletons for dashboard pages
 * Provides consistent loading states with shimmer animations
 */

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

// Base skeleton with shimmer animation
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-white/10 rounded ${className}`} style={style}>
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear'
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  )
}

// Stat card skeleton (for analytics pages)
export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="w-20 h-3 rounded" />
        <Skeleton className="w-28 h-7 rounded" />
      </div>
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 p-6 ${height}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-5 rounded" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
      <div className="flex-1 flex items-end gap-2 mt-8">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

// Booking card skeleton
export function BookingCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-5 rounded" />
          <Skeleton className="w-1/2 h-4 rounded" />
          <Skeleton className="w-1/3 h-4 rounded" />
        </div>
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  )
}

// Transaction/Activity item skeleton
export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-4 rounded" />
        <Skeleton className="w-48 h-3 rounded" />
      </div>
      <Skeleton className="w-20 h-6 rounded" />
    </div>
  )
}

// Review card skeleton
export function ReviewCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>
        <Skeleton className="w-16 h-4 rounded" />
      </div>
      <Skeleton className="w-full h-4 rounded" />
      <Skeleton className="w-3/4 h-4 rounded" />
    </div>
  )
}

// Calendar skeleton
export function CalendarSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-32 h-6 rounded" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 rounded" />
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-48 h-7 rounded" />
          <Skeleton className="w-32 h-5 rounded" />
          <Skeleton className="w-40 h-4 rounded" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 rounded" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  )
}

// Wallet/Balance skeleton
export function WalletSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-orange-500/20 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-40 h-10 rounded" />
        </div>
        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
      <Skeleton className="w-20 h-4 rounded mb-4" />
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="w-12 h-3 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Package/Card grid skeleton
export function PackageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-24 h-8 rounded" />
          <Skeleton className="w-20 h-4 rounded" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
      ))}
    </div>
  )
}

// Community member skeleton
export function MemberCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-5 rounded" />
        <Skeleton className="w-20 h-4 rounded" />
      </div>
      <Skeleton className="w-24 h-8 rounded-lg" />
    </div>
  )
}

// Request card skeleton
export function RequestCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-40 h-5 rounded" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-48 h-4 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="flex-1 h-10 rounded-lg" />
      </div>
    </div>
  )
}

// Analytics page skeleton (full page)
export function AnalyticsPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-40 h-8 rounded" />
          <Skeleton className="w-32 h-5 rounded" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </motion.div>
  )
}

// Bookings page skeleton
export function BookingsPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="w-32 h-10 rounded-lg" />
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Bookings list */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  )
}

// Coins page skeleton
export function CoinsPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Wallet */}
      <WalletSkeleton />

      {/* Packages */}
      <div className="space-y-4">
        <Skeleton className="w-32 h-6 rounded" />
        <PackageGridSkeleton count={6} />
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        <Skeleton className="w-40 h-6 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  )
}

// Reviews page skeleton
export function ReviewsPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-8 rounded" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  )
}

// Calendar page skeleton
export function CalendarPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-40 h-8 rounded" />
        <div className="flex gap-2">
          <Skeleton className="w-28 h-10 rounded-lg" />
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>
      </div>

      {/* Calendar */}
      <CalendarSkeleton />

      {/* Legend */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-6 rounded" />
        ))}
      </div>
    </motion.div>
  )
}

// Requests page skeleton
export function RequestsPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-8 rounded" />
        <Skeleton className="w-28 h-10 rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-10 rounded-lg" />
        ))}
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <RequestCardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  )
}

// Community page skeleton
export function CommunityPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="w-32 h-10 rounded-lg" />
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Members list */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MemberCardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  )
}

// Profile page skeleton
export function ProfilePageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ProfileSkeleton />
    </motion.div>
  )
}

export default {
  Skeleton,
  StatCardSkeleton,
  ChartSkeleton,
  BookingCardSkeleton,
  TransactionSkeleton,
  ReviewCardSkeleton,
  CalendarSkeleton,
  ProfileSkeleton,
  WalletSkeleton,
  PackageGridSkeleton,
  MemberCardSkeleton,
  RequestCardSkeleton,
  AnalyticsPageSkeleton,
  BookingsPageSkeleton,
  CoinsPageSkeleton,
  ReviewsPageSkeleton,
  CalendarPageSkeleton,
  RequestsPageSkeleton,
  CommunityPageSkeleton,
  ProfilePageSkeleton,
}
