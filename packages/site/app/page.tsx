"use client";

import { POSTS } from "@/lib/data";
import { PostCard } from "@/components/PostCard";
import { useFhevm } from "@fhevm/react";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

export default function Page() {
  const { provider, chainId, initialMockChains } = useMetaMaskEthersSigner();

  const { instance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  return (
    <div className="grid gap-4 mx-4">
      <h1 className="text-2xl font-bold">
        Secret Reactions Demo (for social media and blogs)
      </h1>
      <p className="text-gray-700">
        React privately; decrypt totals when authorized.
      </p>

      <div className="grid gap-4">
        {POSTS.map((p) => (
          <PostCard key={p.slug} {...p} instance={instance} />
        ))}
      </div>
    </div>
  );
}
