
/*
  This file is auto-generated.
  By commands: 'npx hardhat deploy' or 'npx hardhat node'
*/
export const SecretReactionsABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "handle",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "SenderNotAllowedToUseHandle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
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
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "viewer",
          "type": "address"
        }
      ],
      "name": "TotalAccessGranted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
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
      "name": "getMyTally",
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
      "name": "getTotal",
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
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedDelta",
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
      "name": "requestTotalAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

