// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretReactions is SepoliaConfig {
    mapping(bytes32 => mapping(bytes32 => euint32)) private _totals;
    mapping(bytes32 => mapping(bytes32 => mapping(address => euint32))) private _userTotals;

    event Reacted(bytes32 indexed postId, bytes32 indexed reactionId);

    function getReactionTotal(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _totals[postId][reactionId];
    }

    function getMyReaction(bytes32 postId, bytes32 reactionId) external view returns (euint32) {
        return _userTotals[postId][reactionId][msg.sender];
    }

    function unlockView(bytes32 postId, bytes32 reactionId) external {
        euint32 t = _totals[postId][reactionId];
        FHE.allowThis(t);
        FHE.allow(t, msg.sender);
    }

    function react(bytes32 postId, bytes32 reactionId, externalEuint32 encAmount, bytes calldata inputProof) external {
        euint32 amount  = FHE.fromExternal(encAmount, inputProof);
        euint32 myPrev  = _userTotals[postId][reactionId][msg.sender];
        euint32 myNew   = FHE.add(myPrev, amount);
        _userTotals[postId][reactionId][msg.sender] = myNew;

        euint32 newTot  = FHE.add(_totals[postId][reactionId], amount);
        _totals[postId][reactionId] = newTot;

        FHE.allowThis(myNew);  FHE.allow(myNew,  msg.sender);
        FHE.allowThis(newTot); FHE.allow(newTot, msg.sender);

        emit Reacted(postId, reactionId);
    }
}
