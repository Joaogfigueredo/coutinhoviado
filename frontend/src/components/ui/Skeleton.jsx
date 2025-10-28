import React from 'react'

// Componente base de skeleton
export function Skeleton({ className = "", width = "100%", height = "20px", ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
      {...props}
    />
  )
}

// Skeleton para cards
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton width="100px" height="16px" />
          <Skeleton width="80px" height="24px" />
        </div>
        <Skeleton width="48px" height="48px" className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton width="60%" height="14px" />
        <Skeleton width="40%" height="14px" />
      </div>
    </div>
  )
}

// Skeleton para tabela
export function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Skeleton width="150px" height="20px" />
          <Skeleton width="100px" height="32px" className="rounded-lg" />
        </div>
      </div>
      
      {/* Table header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="80px" height="16px" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} width={j === 0 ? "120px" : "60px"} height="16px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton para gráfico
export function SkeletonChart({ className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-4">
        <Skeleton width="150px" height="20px" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton 
            key={i} 
            width="40px" 
            height={`${Math.random() * 80 + 20}%`}
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  )
}

// Skeleton para página inteira do Dashboard
export function SkeletonDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Skeleton width="200px" height="32px" className="mb-2" />
        <Skeleton width="300px" height="20px" />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Transações recentes */}
      <SkeletonTable rows={5} columns={4} />
    </div>
  )
}

// Skeleton para lista
export function SkeletonList({ items = 5, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton width="48px" height="48px" className="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="14px" />
            </div>
            <Skeleton width="80px" height="20px" />
          </div>
        </div>
      ))}
    </div>
  )
}