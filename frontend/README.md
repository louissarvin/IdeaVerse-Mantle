# IdeaVerse-Mantle Frontend

A modern React-based Web3 marketplace frontend for trading intellectual property as NFTs, featuring superhero identities, idea minting, and seamless blockchain integration on the Mantle network.

## 🎨 Overview

IdeaVerse is a decentralized marketplace where users create superhero identities, mint their ideas as NFTs, and trade intellectual property in a gamified environment. Built with React, TypeScript, and modern Web3 technologies.

## ✨ Features

### 🦸‍♀️ Superhero Identity System
- **Create Unique Profiles**: Mint superhero NFTs with custom names, bios, and avatars
- **Skills & Specialities**: Showcase expertise areas and capabilities
- **Reputation System**: Build credibility through community interactions
- **Profile Management**: View and update superhero information

### 💡 Idea Marketplace
- **Mint Ideas as NFTs**: Transform concepts into tradeable digital assets
- **Rich Content Support**: Upload files, images, and detailed descriptions
- **Category System**: Organize ideas by DeFi, Gaming, Sustainability, etc.
- **Real-time Pricing**: Dynamic pricing based on demand and ratings

### � Trading & Purchases
- **Secure Transactions**: USDC-based payments with smart contract escrow
- **Purchase History**: Track owned ideas and transaction history
- **Content Access**: Unlock premium content after purchase
- **Ownership Verification**: Blockchain-verified ownership rights

### 👥 Team Collaboration
- **Team Formation**: Create collaborative projects with stake requirements
- **Role-based Structure**: Define specific roles and responsibilities
- **Collective Ownership**: Share profits from team-created ideas
- **Project Management**: Track team progress and deliverables

### 🔗 Web3 Integration
- **MetaMask Support**: Seamless wallet connection and transaction signing
- **Mantle Network**: Optimized for low-cost, fast transactions
- **Real-time Updates**: Live blockchain data via GraphQL subscriptions
- **Gas Optimization**: Efficient smart contract interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Access to Mantle Sepolia testnet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ideaverse-mantle/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_GRAPHQL_URL=http://localhost:3002/graphql

# Blockchain Configuration
VITE_CHAIN_ID=5003
VITE_CHAIN_NAME=Mantle Sepolia
VITE_RPC_URL=https://rpc.sepolia.mantle.xyz

# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key

# Feature Flags
VITE_ENABLE_DEV_MODE=true
```

### Development Server

```bash
# Start with hot reload
npm run dev

# Open browser to
# http://localhost:5175
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BackendStatus.tsx
│   │   ├── BuilderProfiles.tsx
│   │   ├── CreateTeamModal.tsx
│   │   ├── Header.tsx
│   │   ├── IdeaDetailModal.tsx
│   │   ├── MintIdeaModal.tsx
│   │   └── ...
│   ├── contexts/           # React Context providers
│   │   ├── AppContext.tsx  # Main application state
│   │   ├── WalletContext.tsx # Web3 wallet integration
│   │   └── ToastContext.tsx # Notification system
│   ├── hooks/              # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useToast.ts
│   │   └── useLocalStorage.ts
│   ├── pages/              # Main application pages
│   │   ├── MarketplacePage.tsx
│   │   ├── BuildersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── MyPurchasesPage.tsx
│   │   └── TeamsPage.tsx
│   ├── services/           # External service integrations
│   │   ├── web3.ts         # Blockchain interactions
│   │   ├── api.ts          # Backend API calls
│   │   ├── ipfs.ts         # IPFS file storage
│   │   └── crypto.ts       # Cryptographic utilities
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts
│   │   └── index.ts
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── dist/                   # Build output
└── index.html             # Entry point
```

## 🎯 User Journey

### 1. Getting Started
1. **Connect Wallet**: Link MetaMask to Mantle Sepolia
2. **Create Superhero**: Mint your unique identity NFT
3. **Set up Profile**: Add bio, skills, and specialities
4. **Get Test Tokens**: Receive USDC for marketplace transactions

### 2. Creating Ideas
1. **Access Mint Modal**: Click "MINT" in header
2. **Fill Details**: Add title, description, categories
3. **Upload Content**: Attach files, images, documents
4. **Set Price**: Define USDC price for your idea
5. **Mint NFT**: Complete blockchain transaction

### 3. Trading Ideas
1. **Browse Marketplace**: Explore available ideas
2. **View Details**: Click ideas to see full information
3. **Purchase**: Use USDC to buy idea access
4. **Access Content**: Download purchased materials
5. **Rate & Review**: Provide feedback to creators

### 4. Team Collaboration
1. **Create Team**: Set up collaborative project
2. **Define Roles**: Specify required skills and stakes
3. **Recruit Members**: Invite other superheroes
4. **Collaborate**: Work together on shared ideas
5. **Share Profits**: Distribute earnings from team ideas

## � Key Components

### AppContext.tsx
Central state management for:
- Idea marketplace data
- User authentication state
- Superhero profile information
- Purchase history tracking
- Real-time GraphQL updates

### WalletContext.tsx
Web3 wallet integration:
- MetaMask connection management
- Network switching and validation
- Transaction state tracking
- Balance monitoring

### Web3Service
Blockchain interaction layer:
- Smart contract calls
- Transaction signing
- Event listening
- Gas optimization

### IPFS Integration
Decentralized file storage:
- Content upload to Pinata
- File retrieval and caching
- Metadata management
- Access control

## 🎨 UI/UX Features

### Design System
- **Modern Aesthetic**: Clean, professional interface
- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: User preference support
- **Accessibility**: WCAG 2.1 compliant

### Interactive Elements
- **Real-time Updates**: Live data synchronization
- **Toast Notifications**: User feedback system
- **Loading States**: Progressive loading indicators
- **Error Handling**: Graceful error recovery

### Gamification
- **Superhero Avatars**: Visual identity representation
- **Reputation System**: Community-driven credibility
- **Achievement Badges**: Milestone recognition
- **Leaderboards**: Top creators and traders

## 🔍 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |

## 🧪 Testing

### Manual Testing Checklist
- [ ] Wallet connection and disconnection
- [ ] Superhero creation and profile updates
- [ ] Idea minting with file uploads
- [ ] Marketplace browsing and filtering
- [ ] Purchase flow with USDC payments
- [ ] Team creation and member management
- [ ] Responsive design across devices

### Test Network Setup
1. **Add Mantle Sepolia to MetaMask**:
   - Network Name: Mantle Sepolia
   - RPC URL: https://rpc.sepolia.mantle.xyz
   - Chain ID: 5003
   - Currency Symbol: MNT

2. **Get Test Tokens**:
   - Request MNT from Mantle faucet
   - Use in-app USDC minting for payments

## 🚢 Deployment

### Build for Production

```bash
# Create optimized build
npm run build

# Preview build locally
npm run preview

# Deploy to hosting platform
# (Vercel, Netlify, AWS S3, etc.)
```

### Environment Variables (Production)

```env
VITE_API_BASE_URL=https://api.ideaverse.com
VITE_GRAPHQL_URL=https://api.ideaverse.com/graphql
VITE_CHAIN_ID=5000
VITE_RPC_URL=https://rpc.mantle.xyz
VITE_ENABLE_DEV_MODE=false
```

### Performance Optimization

1. **Code Splitting**: Automatic route-based splitting
2. **Image Optimization**: WebP format with fallbacks
3. **Bundle Analysis**: Monitor and optimize bundle size
4. **Caching Strategy**: Aggressive caching for static assets

## 🔧 Customization

### Adding New Features

1. **New Components**: Create in `src/components/`
2. **New Pages**: Add to `src/pages/` and update routing
3. **State Management**: Extend AppContext or create new contexts
4. **API Integration**: Add endpoints in `src/services/api.ts`

### Styling and Themes

- **Tailwind CSS**: Utility-first styling framework
- **Custom Components**: Styled with modern CSS patterns
- **Theme System**: CSS custom properties for theming
- **Icons**: Lucide React icon library

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   ```bash
   # Clear browser cache and cookies
   # Restart MetaMask extension
   # Check network configuration
   ```

2. **Transaction Failures**
   ```bash
   # Verify sufficient balance
   # Check gas price settings
   # Ensure contract addresses are correct
   ```

3. **GraphQL Errors**
   ```bash
   # Verify backend is running
   # Check network connectivity
   # Review browser console for details
   ```

### Debug Mode

Enable development features:

```bash
# Set environment variable
VITE_ENABLE_DEV_MODE=true

# Or toggle in UI
# Click DevModeIndicator in bottom-right
```

## 📱 Browser Support

- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Web3 Requirements
- MetaMask extension installed
- JavaScript enabled
- Local storage available
- WebGL support for 3D elements

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes with proper TypeScript types
4. Test thoroughly across components
5. Submit pull request with detailed description

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For technical support:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check inline code comments
- **Community**: Join our Discord server
- **Email**: support@ideaverse.com

---

**Happy building with IdeaVerse! 🚀**

*Empowering creators in the decentralized economy through superhero identities and idea trading.*

- **🎨 Idea Minting**: Transform your creative concepts into unique NFT collectibles
- **🏪 Marketplace**: Browse, discover, and trade idea NFTs created by the community
- **👥 Team Building**: Form collaborative teams around promising ideas
- **👤 Builder Profiles**: Showcase your skills, ratings, and project history
- **📈 Progress Tracking**: Monitor team development and project milestones
- **🎮 Gamified Experience**: Superhero-themed UI with floating animations and modern design

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── HeroSection.tsx # Landing page hero
│   └── ...            # Other components
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Landing page
│   ├── MarketplacePage.tsx # NFT marketplace
│   ├── BuildersPage.tsx    # Builder profiles
│   └── ...            # Other pages
├── contexts/           # React context providers
│   └── AppContext.tsx  # Global application state
└── main.tsx           # Application entry point
```

## 🎯 Core Pages

- **Home** (`/`) - Welcome page with hero section and features overview
- **Marketplace** (`/marketplace`) - Browse and trade idea NFTs
- **Builders** (`/builders`) - Discover talented builders and their profiles
- **Teams** (`/teams`) - View and join collaborative teams
- **Profile** (`/profile/:id`) - Individual user profiles and achievements
- **Create Superhero** (`/create-superhero`) - Mint new idea NFTs

## 🎨 Design System

The application features a superhero-themed design with:
- **Custom gradients**: Dreamy sky-to-mint color schemes
- **Floating animations**: Subtle animated elements throughout the UI
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Custom fonts**: Orbitron and Press Start 2P for themed typography

## 🔧 Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Functional React components with hooks
- Tailwind CSS for styling

### Key Dependencies
- `react` & `react-dom` - Core React framework
- `react-router-dom` - Client-side routing
- `lucide-react` - Modern icon library
- `tailwindcss` - Utility-first CSS framework

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not currently licensed for public use.

---

Built with ❤️ using React and TypeScript