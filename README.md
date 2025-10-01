# Secret Reactions.

> Privacy-preserving social reactions (likes, claps, hearts) using [Zama’s FHEVM](https://docs.zama.ai).
>
>
> <img width="1434" height="726" alt="Screenshot 2025-10-01 at 09 20 03" src="https://github.com/user-attachments/assets/387bf796-31d4-437d-a5a1-b0eb87ccc4bb" />


## ✨ Overview

Secret Reactions shows how to build a social “reaction” feature (like clap 👏 or heart ❤️) where:
- Reaction **counts are encrypted** on-chain.  
- Each user’s own tally is **private** — only they can decrypt it.  
- Post totals can be decrypted only if access is explicitly requested.  
- On-chain observers only see **that a reaction occurred**, not who reacted or how much.  

## 📦 Project Structure

- In the root, I have the packages folder (which contains contract + frontend folder)
- In the root, I have the scripts folder (which automates local dev flow)
- In packages the contract folder is `<root>/packages/fhevm-hardhat-template`
- In packages the frontend folder is `<root>/packages/site/`
- **`<root>/packages/site/fhevm`**: This folder contains the essential hooks needed to interact with FHEVM-enabled smart contracts. It is meant to be easily copied and integrated into any FHEVM + React project.
- **`<root>/packages/site/hooks/useSecretReactions.tsx`**: My custom hook, which utilizes the useFhevm hook.
- **`<root>/packages/site/hooks/metamask`**: This folder includes hooks designed to manage the MetaMask Wallet provider. These hooks can be easily adapted or replaced to support other wallet providers, following the EIP-6963 standard,
- Additionally, the project is designed to be flexible, allowing developers to easily replace `ethers.js` with a more React-friendly library of their choice, such as `Wagmi`.

## 🖥️ Frontend

Frontend lives in packages/site
It’s a Next.js app with:

- Wallet connect (MetaMask, top-right).

- Reaction bar per post:
- a. React (encrypted increment).
- b. Decrypt mine (view your tally).
- c. 🧮 Decrypt total (view post total, after access).
- d. 🔑 Request access (on-chain permission).

## Features

- **@zama-fhe/relayer-sdk**: Fully Homomorphic Encryption for Ethereum Virtual Machine
- **React**: Modern UI framework for building interactive interfaces
- **Next.js**: Next-generation frontend build tool
- **Tailwind**: Utility-first CSS framework for rapid UI development

## Requirements

- You need to have Metamask browser extension installed on your browser.

## Install

1. Clone this repository.
2. From the repo root, run:

```sh
npm install
```

## Quickstart

1. Setup your hardhat environment variables:

Follow the detailed instructions in the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) to setup `MNEMONIC` + `INFURA_API_KEY` Hardhat environment variables

2. Start a local Hardhat node (new terminal):

```sh
# Default RPC: http://127.0.0.1:8545  | chainId: 31337
npm run hardhat-node
```

3. Launch the frontend in mock mode:

```sh
npm run dev:mock
```

4. Start your browser with the Metamask extension installed and open http://localhost:3000

5. Open the Metamask extension to connect to the local Hardhat node
   i. Select Add network.
   ii. Select Add a network manually.
   iii. Enter your Hardhat Network RPC URL, http://127.0.0.1:8545 (or http://localhost:8545).
   iv. Enter your Hardhat Network chain ID, 31337 (or 0x539 in hexadecimal format).

## Run on Sepolia

1. Deploy your contract on Sepolia Testnet

```sh
npm run deploy:sepolia
```

2. In your browser open `http://localhost:3000`

3. Open the Metamask extension to connect to the Sepolia network

## Documentation

- [Hardhat + MetaMask](https://docs.metamask.io/wallet/how-to/run-devnet/): Set up your local devnet step by step using Hardhat and MetaMask.
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [FHEVM Hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [@zama-fhe/relayer-sdk Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/)
- [Setting up MNEMONIC and INFURA_API_KEY](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)
- [React Documentation](https://reactjs.org/)
- [FHEVM Discord Community](https://discord.com/invite/zama)
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)

## License

This project is licensed under the BSD-3-Clause-Clear License - see the LICENSE file for details.
