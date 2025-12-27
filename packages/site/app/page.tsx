"use client"

import { POSTS } from "@/lib/data"
import { PostCard } from "@/components/PostCard"
import { useFhevm } from "fhevm-sdk"
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner"

export default function Page() {
  const { provider, chainId, initialMockChains } = useMetaMaskEthersSigner()

  const { instance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
            Private Social Reactions
          </h1>
          <p className="text-gray-600 text-lg">React privately and view insights when you're ready.</p>
          <p className="text-sm text-gray-500 mt-2">Your reactions are encrypted and secure</p>
        </div>

        <div className="grid gap-6">
          {POSTS.map((p) => (
            <PostCard key={p.slug} {...p} instance={instance} />
          ))}
        </div>
      </div>
    </div>
  )
}
