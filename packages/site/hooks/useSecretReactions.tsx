"use client";

import { ethers } from "ethers";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  FhevmDecryptionSignature,
  type FhevmInstance,
  type GenericStringStorage,
} from "@fhevm/react";
import { SecretReactionsABI } from "@/abi/SecretReactionsABI";
import { SecretReactionsAddresses } from "@/abi/SecretReactionsAddresses";

type ContractInfo = {
  abi: typeof SecretReactionsABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getSecretReactionsByChainId(chainId: number | undefined): ContractInfo {
  if (!chainId) return { abi: SecretReactionsABI.abi };
  const entry = (SecretReactionsAddresses as any)[String(chainId)];
  if (!entry?.address || entry.address === ethers.ZeroAddress) {
    return { abi: SecretReactionsABI.abi, chainId };
  }
  return {
    address: entry.address as `0x${string}`,
    chainId: entry.chainId ?? chainId,
    chainName: entry.chainName,
    abi: SecretReactionsABI.abi,
  };
}

export const useSecretReactions = ({
  instance,
  storage,
  chainId,
  ethersSigner,
  ethersReadonlyProvider,
  sameChain,
  sameSigner,
  postId,
  reactionId,
}: {
  instance: FhevmInstance | undefined;
  storage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: React.RefObject<(cid: number | undefined) => boolean>;
  sameSigner: React.RefObject<(s: ethers.JsonRpcSigner | undefined) => boolean>;
  postId: `0x${string}`;
  reactionId: `0x${string}`;
}) => {
  const [totalHandle, setTotalHandle] = useState<string | undefined>();
  const [myHandle, setMyHandle] = useState<string | undefined>();
  const [decTotal, setDecTotal] = useState<bigint | undefined>();
  const [decMine, setDecMine] = useState<bigint | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

  const infoRef = useRef<ContractInfo | undefined>(undefined);
  const refreshingRef = useRef(false);
  const workingRef = useRef(false);

  const info = useMemo(() => {
    const c = getSecretReactionsByChainId(chainId);
    infoRef.current = c;
    return c;
  }, [chainId]);

  const isDeployed = useMemo(
    () => Boolean(info.address) && info.address !== ethers.ZeroAddress,
    [info.address]
  );

  const canInteract = useMemo(
    () => Boolean(info.address && instance && ethersSigner && !isWorking),
    [info.address, instance, ethersSigner, isWorking]
  );

  const refresh = useCallback(() => {
    if (refreshingRef.current) return;
    if (!info.address || !ethersReadonlyProvider) {
      setTotalHandle(undefined);
      setMyHandle(undefined);
      return;
    }
    const contract = new ethers.Contract(info.address, info.abi, ethersReadonlyProvider);
    refreshingRef.current = true;
    setIsRefreshing(true);
    Promise.all([
      contract.getReactionTotal(postId, reactionId),
      contract.getMyReaction(postId, reactionId),
    ])
      .then(([tot, mine]: [string, string]) => {
        if (infoRef.current?.address === info.address && sameChain.current(chainId)) {
          setTotalHandle(tot);
          setMyHandle(mine);
        }
      })
      .catch((e: any) => setMessage(`Read failed: ${e?.message ?? e}`))
      .finally(() => {
        refreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, info.address, info.abi, postId, reactionId, chainId, sameChain]);

  useEffect(() => { refresh(); }, [refresh]);

  const decrypt = useCallback(async (which: "total" | "mine") => {
    if (!info.address || !instance || !ethersSigner) return;
    const handle = which === "total" ? totalHandle : myHandle;
    if (!handle) return;

    setMessage(`Decrypt ${which}…`);
    setIsWorking(true); workingRef.current = true;
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance, [info.address], ethersSigner, storage
      );
      if (!sig) throw new Error("Decryption signature unavailable");

      const res = await instance.userDecrypt(
        [{ handle, contractAddress: info.address }],
        sig.privateKey, sig.publicKey, sig.signature,
        sig.contractAddresses, sig.userAddress, sig.startTimestamp, sig.durationDays
      );
      const clear = res[handle] as bigint;
      if (which === "total") setDecTotal(clear); else setDecMine(clear);
      setMessage(`${which} = ${clear.toString()}`);
    } catch (e: any) {
      setMessage(`Decrypt ${which} failed: ${e?.message ?? e}`);
    } finally {
      setIsWorking(false); workingRef.current = false;
    }
  }, [info.address, instance, ethersSigner, storage, totalHandle, myHandle]);

  const react = useCallback(async (amount: number) => {
    if (workingRef.current) return;
    if (!info.address || !instance || !ethersSigner || amount <= 0) return;
    setMessage(`React +${amount}…`);
    setIsWorking(true); workingRef.current = true;
    try {
      // small delay so UI repaints before wasm work
      await new Promise(r => setTimeout(r, 50));
      const input = instance.createEncryptedInput(info.address, ethersSigner.address);
      input.add32(amount);
      const enc = await input.encrypt();

      const contract = new ethers.Contract(info.address, info.abi, ethersSigner);
      const tx = await contract.react(postId, reactionId, enc.handles[0], enc.inputProof);
      await tx.wait();
      setMessage(`Reacted +${amount}`);
      refresh();
    } catch (e: any) {
      setMessage(`React failed: ${e?.message ?? e}`);
    } finally {
      setIsWorking(false); workingRef.current = false;
    }
  }, [info.address, info.abi, instance, ethersSigner, postId, reactionId, refresh]);

  const unlockView = useCallback(async () => {
    if (!info.address || !ethersSigner) return;
    setMessage("Unlock view…");
    setIsWorking(true); workingRef.current = true;
    try {
      const contract = new ethers.Contract(info.address, info.abi, ethersSigner);
      const tx = await contract.unlockView(postId, reactionId);
      await tx.wait();
      setMessage("Unlocked. You can decrypt the total now.");
    } catch (e: any) {
      setMessage(`Unlock failed: ${e?.message ?? e}`);
    } finally {
      setIsWorking(false); workingRef.current = false;
    }
  }, [info.address, info.abi, ethersSigner, postId, reactionId]);

  return {
    isDeployed,
    canInteract,
    isRefreshing,
    isWorking,
    totalHandle,
    myHandle,
    decTotal,
    decMine,
    message,
    refresh,
    decryptTotal: () => decrypt("total"),
    decryptMine:  () => decrypt("mine"),
    react,
    unlockView,
    contractAddress: info.address,
  };
};
