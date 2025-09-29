// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecretReactions
 * @notice Privacy-preserving reaction counters using Zama FHEVM.
 *
 * Key ideas:
 * - All counters are stored as encrypted integers (euint32) on-chain.
 * - Users submit encrypted increments (e.g., +1) using externalEuint32 + ZK proof.
 * - The contract homomorphically adds these increments to:
 *     (1) the post's total for a given reaction, and
 *     (2) the caller's personal tally for that post/reaction.
 * - Decryption happens off-chain by authorized users only.
 *
 * FHE handles & permissions:
 * - "euint32" is an encrypted integer; its on-chain reference is a 32-byte handle.
 * - A handle equals bytes32(0) (ZeroHash) when uninitialized.
 * - Use FHE.allow(handle, user) to authorize a user to decrypt that handle.
 * - Use FHE.allowThis(handle) to let this contract re-serve the handle in view functions.
 *
 * Frontend expectations:
 * - Treat a ZeroHash handle as clear value 0 (don’t try to decrypt it).
 * - Call `requestTotalAccess(...)` if you want permission to decrypt a post's total.
 */

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretReactions is SepoliaConfig {
    /* -------------------------------------------------------------------------- */
    /*                                Storage                                     */
    /* -------------------------------------------------------------------------- */

    /// @dev Encrypted totals: total[postId][reactionId] -> euint32 (encrypted)
    mapping(bytes32 => mapping(bytes32 => euint32)) private _encryptedTotalByPostAndReaction;

    /// @dev Encrypted per-user tallies: mine[postId][reactionId][user] -> euint32 (encrypted)
    mapping(bytes32 => mapping(bytes32 => mapping(address => euint32))) private _encryptedUserTallyByPostReactionAndUser;

    /* -------------------------------------------------------------------------- */
    /*                                  Events                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Emitted when a user reacts to a post with a given reaction.
     * @dev We DO NOT emit the clear increment (it’s private). Off-chain UIs may show their own local delta if needed.
     */
    event Reacted(bytes32 indexed postId, bytes32 indexed reactionId, address indexed user);

    /**
     * @notice Emitted when a user is granted permission to decrypt the post total for a given reaction.
     */
    event TotalAccessGranted(bytes32 indexed postId, bytes32 indexed reactionId, address indexed viewer);

    /* -------------------------------------------------------------------------- */
    /*                              Public actions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Submit a private (encrypted) increment for a post/reaction.
     * @param postId        A unique id for the post (e.g., keccak256(slug))
     * @param reactionId    A unique id for the reaction (e.g., keccak256("clap"))
     * @param encryptedDelta An external encrypted uint32 representing the increment (e.g., +1), bound to (msg.sender, this contract)
     * @param zkProof        ZK proof attesting the encrypted input was formed by msg.sender for this contract
     *
     * Workflow:
     * 1) Convert externalEuint32 -> euint32 (verifies zkProof and binding).
     * 2) Homomorphically add to the post’s encrypted total.
     * 3) Homomorphically add to the caller’s personal encrypted tally.
     * 4) Grant permissions:
     *      - allowThis(total) so the contract can re-serve the total handle.
     *      - allowThis(userTally) so the contract can re-serve the per-user handle.
     *      - allow(userTally, msg.sender) so the caller can decrypt their own tally off-chain.
     *
     * Note: We DO NOT automatically allow decrypting the total to avoid leaking totals. The user
     *       can call `requestTotalAccess(...)` to grant themselves permission if your UX wants that step.
     */
    function react(
        bytes32 postId,
        bytes32 reactionId,
        externalEuint32 encryptedDelta,
        bytes calldata zkProof
    ) external {
        // 1) Validate & import the encrypted input (bound to msg.sender + this contract)
        euint32 importedDelta = FHE.fromExternal(encryptedDelta, zkProof);

        // 2) Update encrypted total
        euint32 currentEncryptedTotal = _encryptedTotalByPostAndReaction[postId][reactionId];
        euint32 newEncryptedTotal = FHE.add(currentEncryptedTotal, importedDelta);
        _encryptedTotalByPostAndReaction[postId][reactionId] = newEncryptedTotal;

        // 3) Update caller's encrypted tally
        euint32 currentEncryptedUserTally = _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender];
        euint32 newEncryptedUserTally = FHE.add(currentEncryptedUserTally, importedDelta);
        _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender] = newEncryptedUserTally;

        // 4) Grant permissions so we can re-serve the handles, and the user can decrypt their own tally
        FHE.allowThis(newEncryptedTotal);                 // contract can return this handle in getTotal(...)
        FHE.allowThis(newEncryptedUserTally);             // contract can return this handle in getMyTally/getUserTally
        FHE.allow(newEncryptedUserTally, msg.sender);     // caller can decrypt their personal tally

        emit Reacted(postId, reactionId, msg.sender);
    }

    /**
     * @notice Grant yourself permission to decrypt the post’s total for a given reaction.
     * @dev Keeps the privacy decision explicit: users must opt-in to view totals.
     * @param postId     Post identifier.
     * @param reactionId Reaction identifier.
     */
    function requestTotalAccess(bytes32 postId, bytes32 reactionId) external {
        euint32 total = _encryptedTotalByPostAndReaction[postId][reactionId];
        // If total is uninitialized (ZeroHash), allowing is harmless, but the UI should treat ZeroHash as 0 and skip decryption.
        FHE.allow(total, msg.sender);
        emit TotalAccessGranted(postId, reactionId, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                                Read methods                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Get the encrypted handle for the post’s total for a given reaction.
     * @dev May return ZeroHash (bytes32(0)) if uninitialized. Frontend should treat it as clear value 0.
     */
    function getTotal(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _encryptedTotalByPostAndReaction[postId][reactionId];
    }

    /**
     * @notice Get the encrypted handle for the caller’s personal tally for a given post/reaction.
     * @dev Convenience wrapper for getUserTally(..., msg.sender).
     */
    function getMyTally(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender];
    }

}
