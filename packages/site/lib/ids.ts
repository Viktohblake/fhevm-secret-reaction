import { keccak256, toUtf8Bytes } from "ethers";
export function idFromSlug(slug: string): `0x${string}` {
  return keccak256(toUtf8Bytes(slug)) as `0x${string}`;
}
