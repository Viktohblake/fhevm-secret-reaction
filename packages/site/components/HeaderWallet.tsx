"use client"

import type React from "react"

import { useState } from "react"
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner"

const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—")

type Props = {
  rightIcon?: React.ReactNode
}

export function HeaderWallet({ rightIcon }: Props) {
  const { isConnected, connect, accounts, chainId, eip1193 } = useMetaMaskEthersSigner()
  const [busy, setBusy] = useState(false)
  const addr = accounts?.[0]
  const onSepolia = chainId === 11155111

  const onConnect = async () => {
    setBusy(true)
    try {
      await connect()
    } finally {
      setBusy(false)
    }
  }

  const onCopy = async () => {
    if (addr) await navigator.clipboard.writeText(addr)
  }

  const onSwitchToSepolia = async () => {
    if (!eip1193) return
    setBusy(true)
    try {
      await eip1193.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111 hex
      })
    } catch (err: any) {
      // Fallback: add Sepolia if wallet doesn't know it yet
      try {
        await eip1193.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        })
      } catch (_) {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  const onDisconnect = async () => {
    setBusy(true)
    try {
      await eip1193
        ?.request?.({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        })
        .catch(() => {})
    } finally {
      window.location.reload()
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={busy}
            className="group relative px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            title="Connect your wallet"
          >
            {busy ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
            <span>{busy ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        ) : (
          <>
            {!onSepolia && (
              <button
                onClick={onSwitchToSepolia}
                disabled={busy}
                className="px-4 py-2 rounded-lg font-medium text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm"
                title="Switch to Sepolia testnet"
              >
                {busy ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                )}
                <span>{busy ? "Switching..." : "Switch Network"}</span>
              </button>
            )}

            <button
              onClick={onCopy}
              className="px-4 py-2 rounded-lg font-mono text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-200 flex items-center gap-2 shadow-sm"
              title={`Click to copy: ${addr ?? "Address"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{short(addr)}</span>
            </button>

            <button
              onClick={onDisconnect}
              disabled={busy}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm"
              title="Disconnect wallet"
            >
              {busy ? (
                <svg
                  className="animate-spin h-4 w-4"
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
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              )}
              <span>{busy ? "Disconnecting..." : "Disconnect"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
