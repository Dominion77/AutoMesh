# CarbonSeal Smart Contracts

CarbonSeal is a blockchain-based platform for transparent carbon credit tracking and verification, built on the **Peaq Network**. It enables farmers to register their land, track carbon sequestration data via IoT and satellite oracles, and mint verified carbon credits as NFTs.

## Project Overview

CarbonSeal leverages the Peaq Agung Testnet to provide a decentralized registry for environmental data. By tokenizing carbon credits, the platform ensures transparency, prevents double-counting, and facilitates a verifiable green economy.

## Smart Contract Architecture

The project consists of three primary smart contracts:

### 1. [CarbonSealRegistry.sol](contracts/CarbonSealRegistry.sol)

The core coordinator of the ecosystem.

- **Farm Management**: Handles registration and activation of farms.
- **Data Logging**: Records carbon readings from various sources.
- **Credit Integration**: Interfaces with the token contract to manage minting permissions and carbon debt.
- **Role-Based Access**: Manages `VERIFIER_ROLE` and `ORACLE_ROLE`.

### 2. [CarbonSealToken.sol](contracts/CarbonSealToken.sol)

An **ERC721** (NFT) contract representing verified carbon credits.

- **Minting**: Verified carbon sequestration is minted as NFT credits.
- **Traceability**: Each token contains metadata about the farm ID, amount, methodology, and vintage.
- **Retirement**: Credits can be "retired" (burned with purpose) to offset carbon footprints, preventing reuse.

### 3. [CarbonSealOracle.sol](contracts/CarbonSealOracle.sol)

Integrates external data sources into the blockchain.

- **Multi-Source Verification**: Supports satellite data (Sentinel-2, Planet Labs) and soil sensors.
- **Chainlink Integration**: Capable of fetching external carbon pricing via Chainlink Aggregators.
- **Proof Storage**: Stores and verifies data hashes to ensure integrity before credit minting.

---

## Deployment Details (Peaq Testnet)

The contracts are currently deployed on the **Peaq Agung Testnet** (Chain ID: `9990`).

| Contract | Address |
| :--- | :--- |
| **CarbonSealRegistry** | `0xea0beD04C5283F4B12b7a86C0a5c5525Ab858b62` |
| **CarbonSealToken** | `0x342014080329Ba2B00900B3EC71f383A8769acEF` |
| **CarbonSealOracle** | `0x2AA56b8F3B6081540526aB9F92F071Cf18f8b27e` |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Hardhat

### Installation

```bash
bun install
```

### Compilation

```bash
bun run hardhat compile
```

### Deployment

To deploy to Peaq Testnet:

```bash
bun run hardhat run scripts/deploy.ts --network peaqTestnet
```

### Testing

```bash
bun run hardhat test
```

## Technologies Used

- **Solidity 0.8.20**
- **Hardhat**
- **OpenZeppelin 5.0** (Access Control, ERC721)
- **Chainlink** (Oracle Interfaces)
- **Peaq Network** (Infrastructural Layer)

---

Developed for **CarbonSeal** - *Sealing the future of carbon tracking.*
