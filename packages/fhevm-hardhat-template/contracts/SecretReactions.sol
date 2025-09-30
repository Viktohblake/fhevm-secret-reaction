// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecretReactions
 * @notice Privacy-preserving reaction counters using Zama FHEVM (usecase: social media/blogs).
 */

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretReactions is SepoliaConfig {

    /// @dev Encrypted totals: total[postId][reactionId]
    mapping(bytes32 => mapping(bytes32 => euint32)) private _encryptedTotalByPostAndReaction;

    /// @dev Encrypted per-user tallies: mine[postId][reactionId][user]
    mapping(bytes32 => mapping(bytes32 => mapping(address => euint32))) private _encryptedUserTallyByPostReactionAndUser;

    /**
     * @notice Emitted when a user reacts to a post with a given reaction (no user address to preserve privacy).
     */
    event Reacted(bytes32 indexed postId, bytes32 indexed reactionId);

    /**
     * @notice Emitted when a user is granted permission to decrypt the post total for a given reaction.
     */
    event TotalAccessGranted(bytes32 indexed postId, bytes32 indexed reactionId, address indexed viewer);

     /**
     * @notice Submit an encrypted increment for a post/reaction.
     * @param postId Post identifier (e.g., keccak256(slug)).
     * @param reactionId Reaction identifier (e.g., keccak256("clap")).
     * @param encryptedDelta Encrypted uint32 (e.g., +1), bound to (msg.sender, this contract).
     * @param inputProof Input proof for the external encrypted input.
     */
    function react(
        bytes32 postId,
        bytes32 reactionId,
        externalEuint32 encryptedDelta,
        bytes calldata inputProof
    ) external {
        euint32 delta = FHE.fromExternal(encryptedDelta, inputProof);

        // Update encrypted total
        euint32 total = _encryptedTotalByPostAndReaction[postId][reactionId];
        total = FHE.add(total, delta);
        _encryptedTotalByPostAndReaction[postId][reactionId] = total;

        // Update caller's encrypted tally
        euint32 mine = _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender];
        mine = FHE.add(mine, delta);
        _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender] = mine;

        // Allow contract to re-serve handles; and the user can decrypt their own tally
        FHE.allowThis(total);                 // contract can return this handle in getTotal(...)
        FHE.allowThis(mine);             // contract can return this handle in getMyTally/getUserTally
        FHE.allow(mine, msg.sender);     // caller can decrypt their personal tally

        emit Reacted(postId, reactionId);
    }

    /**
     * @notice Grant caller permission to decrypt the post total for a reaction.
     * @dev If total is ZeroHash (uninitialized), UI should treat it as 0.
     */
    function requestTotalAccess(bytes32 postId, bytes32 reactionId) external {
        euint32 total = _encryptedTotalByPostAndReaction[postId][reactionId];
        FHE.allow(total, msg.sender);
        emit TotalAccessGranted(postId, reactionId, msg.sender);
    }

 /**
     * @notice Get encrypted handle for a post’s total (may be ZeroHash if uninitialized).
     */
    function getTotal(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _encryptedTotalByPostAndReaction[postId][reactionId];
    }

    /**
     * @notice Get encrypted handle for the caller’s personal tally.
     */
    function getMyTally(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _encryptedUserTallyByPostReactionAndUser[postId][reactionId][msg.sender];
    }

}
