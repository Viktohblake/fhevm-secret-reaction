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

  return (
    <div className="w-full rounded-xl border p-4 space-y-4 bg-white">

      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={() => sr.react(1)}
          disabled={!sr.canInteract || sr.isWorking}
          title="React privately (+1)"
        >
          👏 React
        </button>
        
      </div>

      <div className="grid grid-cols-2 gap-3">
  {/* Mine */}
  <div className="rounded-xl border bg-white/50 p-3">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">Your reactions</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          sr.decMine !== undefined
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
            : "bg-gray-50 text-gray-500 border border-gray-100"
        }`}
      >
        {sr.decMine !== undefined ? "decrypted" : "encrypted"}
      </span>
    </div>

    <div className="mt-1 text-2xl font-semibold tabular-nums">
      {sr.decMine !== undefined ? sr.decMine.toString() : "—"}
    </div>

    <div className="mt-2">
      <button
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:opacity-95 disabled:opacity-50"
        onClick={sr.decryptMine}
        disabled={!sr.canInteract || sr.isWorking}
        aria-label="Decrypt my total"
      >
        🔐 Decrypt mine
      </button>
    </div>
  </div>

  {/* Total */}
  <div className="rounded-xl border bg-white/50 p-3">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">Post total</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          sr.decTotal !== undefined
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
            : "bg-gray-50 text-gray-500 border border-gray-100"
        }`}
      >
        {sr.decTotal !== undefined ? "decrypted" : "encrypted"}
      </span>
    </div>

    <div className="mt-1 text-2xl font-semibold tabular-nums">
      {sr.decTotal !== undefined ? sr.decTotal.toString() : "—"}
    </div>

    <div className="mt-2 flex items-center gap-2">
      <button
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:opacity-95 disabled:opacity-50"
        onClick={sr.decryptTotal}
        disabled={!sr.canInteract || sr.isWorking}
        aria-label="Decrypt total"
      >
        🧮 Decrypt total
      </button>

      <button
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
        onClick={sr.requestTotalAccess}
        disabled={!sr.canInteract || sr.isWorking}
        aria-label="Request access"
        title="Grants you permission on-chain to decrypt the total"
      >
        🔑 Request access
      </button>
    </div>

    <p className="mt-1 text-[10px] text-gray-500">
      If total decryption fails, request access and try again.
    </p>
  </div>
</div>


      <div className="text-xs text-gray-600">{sr.message}</div>
    </div>
  );
}
