
/*
  This file is auto-generated.
  By commands: 'npx hardhat deploy' or 'npx hardhat node'
*/
export const SecretReactionsABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "postId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "reactionId",
          "type": "bytes32"
        }
      ],
      "name": "Reacted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "postId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "reactionId",
          "type": "bytes32"
        }
      ],
      "name": "getMyReaction",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "postId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "reactionId",
          "type": "bytes32"
        }
      ],
      "name": "getReactionTotal",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "postId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "reactionId",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encAmount",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "react",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "postId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "reactionId",
          "type": "bytes32"
        }
      ],
      "name": "unlockView",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

