"use client";

import { idFromSlug } from "@/lib/ids";
import { REACTIONS } from "@/lib/data"; // keep if you still want emoji buttons
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@fhevm/react";
import { useSecretReactions } from "@/hooks/useSecretReactions";

export function ReactionBar({ slug }: { slug: string }) {
  const postId = idFromSlug(slug);

  // Pick a single reaction “row” (e.g., clap). If you later add per-emoji logic,
  // pass a different reactionId for each row.
  const reactionKey = "clap";
  const reactionId = idFromSlug(reactionKey);

  const { storage } = useInMemoryStorage();

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
  } = useMetaMaskEthersSigner();

  const { instance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

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
  });

  if (!isConnected) {
    return (
      <button className="px-3 py-2 rounded-xl bg-black text-white" onClick={connect}>
        Connect wallet to react
      </button>
    );
  }

  if (sr.isDeployed === false) {
    return (
      <div className="rounded-xl border p-3 text-red-600">
        Contract not deployed on this chain.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border p-4 space-y-4 bg-white">
      {/* Action row */}
      <div className="flex items-center gap-2">
        {/* If you want multiple emojis visible, keep this map; each click still calls react(+1) for the chosen reaction row */}
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50"
            onClick={() => sr.react(1)}
            disabled={!sr.canInteract || sr.isWorking}
            title={`React: ${r.key}`}
          >
            {r.emoji}
          </button>
        ))}
      </div>

      {/* Numbers, not handles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-600">Your reactions</div>
          <div className="text-3xl font-semibold">
            {sr.decMine !== undefined ? sr.decMine.toString() : "—"}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              onClick={sr.decryptMine}
              disabled={!sr.canInteract || sr.isWorking}
            >
              Decrypt my reaction
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-600">Post total</div>
          <div className="text-3xl font-semibold">
            {sr.decTotal !== undefined ? sr.decTotal.toString() : "—"}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
              onClick={sr.decryptTotal}
              disabled={!sr.canInteract || sr.isWorking}
              title="Off-chain decrypt. May fail until access is granted."
            >
              Decrypt total
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white border disabled:opacity-50"
              onClick={sr.unlockView}
              disabled={!sr.canInteract || sr.isWorking}
              title="On-chain tx to grant you permission to decrypt the total."
            >
              Request total access
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            If “Decrypt total” fails, hit “Request total access” (on-chain tx).
          </p>
        </div>
      </div>

      {/* Minimal status line for feedback */}
      <div className="text-xs text-gray-600">{sr.message}</div>
    </div>
  );
}
