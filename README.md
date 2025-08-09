# Idea Marketplace - Superhero NFT Platform

A decentralized marketplace where users create superhero identities as Soulbound Tokens (SBT) and trade encrypted ideas as NFTs.

## 🛠️ Contract Architecture

### IdeaNFT.sol
- **Purpose:** Core superhero identities and idea NFTs
- **Token Types:** 
  - Superhero SBT: IDs 100000+
  - Idea NFTs: IDs 0+
- **Key Functions:**
  - `createSuperhero()` - Mint superhero SBT
  - `createIdea()` - Mint encrypted idea NFT
  - `markIdeaPurchased()` - Update purchase status
  - `rateSuperhero()` - Reputation system

### MarketPlace.sol  
- **Purpose:** Trading platform for idea NFTs
- **Payment:** MockUSDC tokens
- **Key Functions:**
  - `buyIdea()` - Purchase and unlock ideas
  - `calculateFees()` - 2.5% marketplace fee
  - Purchase tracking and analytics

### MockUSDC.sol
- **Purpose:** Test token for payments
- **Standard:** ERC20 compatible

---

## Installing Project

### Clone this repository
```
git clone <project repo>
```

### Create your ENV
```
cp .env .env.example
```

### Forge Install
```
forge install
```

## 🚀 Deployment Steps

### 1. Deploy Contracts Mantle Sepolia Testnet
```bash
# Deploy in order:
forge script script/DeployIdea.s.sol --rpc-url <mantle_sepolia_rpc_url> --broadcast
```

### 2. Configure Marketplace Authorization
```solidity
// Authorize marketplace to mark ideas as purchased
ideaNFT.authorizeMarketplace(marketplaceAddress);
```

### 3. Frontend Integration
- Implement AES-256 encryption/decryption
- IPFS integration for encrypted content
- Web3 wallet connection
- Marketplace UI with blurred previews

### 4. Backend Services
- Secure decryption key management
- Purchase verification
- API endpoints for key access

---

### Help

```shell
forge --help
anvil --help
cast --help
```

---

## 🤝 Contributing

This marketplace enables decentralized idea trading with proper encryption and reputation systems. The modular design allows for future enhancements while maintaining security and user experience.

---

Please refer to the [Foundry Book](https://book.getfoundry.sh/) for more information.