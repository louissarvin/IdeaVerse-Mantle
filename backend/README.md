# IdeaVerse-Mantle Backend

A comprehensive blockchain indexer and API server for the IdeaVerse marketplace, built with Ponder for real-time smart contract event indexing and GraphQL API generation.

## 🏗️ Architecture

The backend consists of two main components:

### 1. **Ponder Indexer** (Primary Service)
- Real-time blockchain event indexing
- Automatic GraphQL API generation
- SQLite database with live syncing
- Multi-contract support for comprehensive data indexing

### 2. **API Server** (Secondary Service)
- REST API endpoints for additional functionality
- IPFS integration for content storage/retrieval
- File upload handling
- Enhanced data processing

## 📋 Features

### Smart Contract Integration
- **SuperheroNFT**: Superhero identity creation and management
- **IdeaRegistry**: Idea minting and metadata storage
- **OptimizedMarketplace**: Idea trading and purchases
- **TeamCore**: Team formation and collaboration
- **MockUSDC**: Test token for payments

### Data Models
- **Superheroes**: Identity profiles with skills and specialities
- **Ideas**: Tradeable intellectual property NFTs
- **Teams**: Collaborative project structures
- **Purchases**: Transaction records and ownership
- **Ratings**: Community feedback system
- **Transfers**: NFT ownership tracking

### Real-time Indexing
- Automatic event detection and processing
- Historical data synchronization
- Live updates via GraphQL subscriptions
- Error handling and retry mechanisms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Access to Mantle Sepolia testnet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ideaverse-mantle/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz
PRIVATE_KEY=your_private_key_here

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Database Configuration
DATABASE_URL=file:./dev.db

# API Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5175
```

### Running the Services

```bash
# Start the main Ponder indexer (recommended)
npm run dev

# And start API server too
npm run dev:api

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development

### Project Structure

```
backend/
├── src/                    # Source code
│   ├── index.ts           # Main indexer logic
│   ├── abi/               # Smart contract ABIs
│   ├── middleware/        # API middleware
│   ├── routes/           # REST API endpoints
│   ├── services/         # Business logic
│   └── types/            # TypeScript definitions
├── ponder.config.ts      # Ponder configuration
├── ponder.schema.ts      # Database schema
├── api-server.ts         # Standalone API server
└── generated/            # Auto-generated files
    └── schema.graphql    # GraphQL schema
```

### Smart Contract Addresses (Mantle Sepolia)

```typescript
const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0x5B0b0F0F24f82C9a8e93C83fCa5Ab9Cc1c7BE4C7',
  IdeaRegistry: '0x1234567890123456789012345678901234567890',
  OptimizedMarketplace: '0x900bB95Ad371178EF48759E0305BECF649ecE553',
  TeamCore: '0xF2E77e3d0E3dE4F3ce0A5D6a8E1f3c9f8E2d7D1a',
  MockUSDC: '0x23C2B7D7b4f5D6e7F8a9B0c1D2e3F4g5H6i7J8k9'
};
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Ponder indexer with hot reload |
| `npm run dev:api` | Start standalone API server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run codegen` | Generate GraphQL schema |
| `npm test` | Run test suite |

## 📊 GraphQL API

### Endpoint
- **URL**: `http://localhost:3002/graphql`
- **Playground**: Available in development mode

### Example Queries

#### Get All Ideas
```graphql
query GetIdeas {
  ideas(limit: 10, orderBy: "createdAt", orderDirection: "desc") {
    items {
      id
      ideaId
      creator
      title
      categories
      price
      ratingTotal
      numRaters
      isPurchased
      createdAt
    }
  }
}
```

#### Get Superhero Profiles
```graphql
query GetSuperheroes {
  superheros {
    items {
      id
      superheroId
      name
      bio
      reputation
      skills
      specialities
      createdAt
    }
  }
}
```

#### Get User Purchases
```graphql
query GetPurchases($buyer: String!) {
  purchases(where: { buyer: $buyer }) {
    items {
      id
      ideaId
      buyer
      seller
      price
      timestamp
      transactionHash
    }
  }
}
```

## 🔄 Real-time Updates

The indexer automatically processes the following events:

### SuperheroNFT Events
- `CreateSuperhero`: New superhero registration
- `Transfer`: Superhero ownership changes
- `RoleGranted/Revoked`: Permission updates

### IdeaRegistry Events
- `CreateIdea`: New idea minting
- `Transfer`: Idea ownership changes

### Marketplace Events
- `IdeaPurchased`: Successful purchases
- `ListingCreated/Updated`: Marketplace changes

### USDC Events
- `Transfer`: Payment tracking
- `Approval`: Spending permission updates

## 🛠️ Troubleshooting

### Common Issues

1. **Database Lock Error**
   ```bash
   # Clear database locks
   rm -rf .ponder/sqlite/public.db*
   npm run dev
   ```

2. **Network Connection Issues**
   ```bash
   # Verify RPC endpoint
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     https://rpc.sepolia.mantle.xyz
   ```

3. **Missing Events**
   ```bash
   # Force resync from specific block
   # Edit ponder.config.ts startBlock value
   npm run dev
   ```

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
export DEBUG=ponder:*
npm run dev
```

## 📈 Performance

### Optimization Tips

1. **Database Performance**
   - Regular cleanup of old events
   - Index optimization for frequent queries
   - Connection pooling for high traffic

2. **Network Efficiency**
   - Use archive RPC nodes for historical data
   - Implement rate limiting for public endpoints
   - Cache frequently accessed data

3. **Memory Management**
   - Monitor event processing queues
   - Implement pagination for large datasets
   - Regular garbage collection

## 🔐 Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure key management
   - Rotate API keys regularly

2. **Database Security**
   - Backup data regularly
   - Implement access controls
   - Monitor for unusual activity

3. **API Security**
   - Rate limiting on endpoints
   - Input validation and sanitization
   - CORS configuration for production

## 🚢 Deployment

### Production Setup

```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production

# Start with PM2 (recommended)
pm2 start dist/index.js --name ideaverse-backend

# Or use Docker
docker build -t ideaverse-backend .
docker run -p 3002:3002 ideaverse-backend
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://localhost:6379
MANTLE_MAINNET_RPC_URL=https://rpc.mantle.xyz
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review Ponder documentation: https://ponder.sh

---

**Built with ❤️ for the IdeaVerse ecosystem on Mantle Network**
