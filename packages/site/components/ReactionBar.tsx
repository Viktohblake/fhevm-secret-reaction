"use client";

import { idFromSlug } from "@/lib/ids";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@fhevm/react";
import { useSecretReactions } from "@/hooks/useSecretReactions";

export function ReactionBar({ slug, instance }: { slug: string; instance: any }) {
  const postId = idFromSlug(slug);
  const reactionId = idFromSlug("clap"); // v1: single reaction

  const { storage } = useInMemoryStorage();
  const {
    provider, chainId, ethersSigner, ethersReadonlyProvider,
    sameChain, sameSigner, initialMockChains, isConnected, connect,
    accounts
  } = useMetaMaskEthersSigner();

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
    return <div className="rounded-xl border p-3 text-sm text-gray-600">Connect your wallet to react.</div>;
  }

  if (sr.isDeployed === false) {
    return <div className="rounded-xl border p-3 text-red-600">Contract not deployed on this chain.</div>;
  }

  const short = (a?: string) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : "—";

  return (
    <div className="w-full rounded-xl border p-4 space-y-4 bg-white">
      <div className="text-sm text-gray-600">Connected: <b>{short(accounts?.[0])}</b></div>

      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={() => sr.react(1)}
          disabled={!sr.canInteract || sr.isWorking}
          title="React privately (+1)"
        >
          👏 React
        </button>

        <button
          className="px-3 py-2 rounded-xl bg-white border disabled:opacity-50"
          onClick={sr.refresh}
          disabled={sr.isRefreshing}
        >
          Refresh
        </button>
      </div>

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
              Decrypt my total
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
            >
              Decrypt total
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white border disabled:opacity-50"
              onClick={sr.requestTotalAccess}
              disabled={!sr.canInteract || sr.isWorking}
            >
              Request access
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            If decryption fails, click “Request access” (on-chain).
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-600">{sr.message}</div>
    </div>
  );
}
