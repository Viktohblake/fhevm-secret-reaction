"use client"

import { idFromSlug } from "@/lib/ids"
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage"
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner"
import { useSecretReactions } from "@/hooks/useSecretReactions"

export function ReactionBar({
  slug,
  instance,
}: {
  slug: string
  instance: any
}) {
  const postId = idFromSlug(slug)
  const reactionId = idFromSlug("clap") // v1: single reaction

  const { storage } = useInMemoryStorage()
  const {
    provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
    isConnected,
    connect,
    accounts,
  } = useMetaMaskEthersSigner()

  const sr = useSecretReactions({
    instance,
    storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    postId,
    reactionId,
  })

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/60 text-xs text-gray-600">
        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Connect wallet to interact</span>
      </div>
    )
  }

  if (sr.isDeployed === false) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 text-xs text-red-600">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Network not supported</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main action bar - social media style */}
      <div className="flex items-center justify-between gap-3 py-2">
        {/* Left: Primary reaction button */}
        <button
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => sr.react(1)}
          disabled={!sr.canInteract || sr.isWorking}
        >
          <span className="text-lg leading-none">👏</span>
          <span>Like Post</span>
          {sr.isWorking && (
            <svg
              className="animate-spin h-3.5 w-3.5 ml-0.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </button>

        {/* Right: Stats inline */}
        <div className="flex items-center gap-2">
          {/* My Stats */}
          <button
            onClick={sr.decryptMine}
            disabled={!sr.canInteract || sr.isWorking}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-sm font-medium text-gray-700 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="View my activity"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="tabular-nums font-semibold">{sr.decMine !== undefined ? sr.decMine.toString() : "•"}</span>
          </button>

          {/* Community Stats */}
          <button
            onClick={sr.decryptTotal}
            disabled={!sr.canInteract || sr.isWorking}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-sm font-medium text-gray-700 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="View community activity"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="tabular-nums font-semibold">
              {sr.decTotal !== undefined ? sr.decTotal.toString() : "•"}
            </span>
          </button>

          {/* Request Access - only show if needed */}
          {sr.decTotal === undefined && (
            <button
              onClick={sr.requestTotalAccess}
              disabled={!sr.canInteract || sr.isWorking}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/60 hover:border-purple-300 text-xs font-medium text-purple-700 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Request access to view community stats"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Access</span>
            </button>
          )}
        </div>
      </div>

      {/* Status message */}
      {sr.message && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-gray-600">
          <svg
            className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="leading-relaxed">{sr.message}</span>
        </div>
      )}
    </div>
  )
}
