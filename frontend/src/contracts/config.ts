// Contract addresses and configuration for Mantle Sepolia
export const MANTLE_SEPOLIA_CHAIN_ID = 5003;

export const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84',
  IdeaRegistry: '0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF',
  TeamCore: '0xE7edb8902A71aB6709a99d34695edaE612afEB11',
  OptimizedMarketplace: '0x900bB95Ad371178EF48759E0305BECF649ecE553',
  MockUSDC: '0xed852d3Ef6a5B57005acDf1054d15af1CF09489c'
} as const;

export const NETWORK_CONFIG = {
  chainId: MANTLE_SEPOLIA_CHAIN_ID,
  chainName: 'Mantle Sepolia',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia.mantle.xyz',
    'wss://mantle-sepolia.drpc.org',
  ],
  blockExplorerUrls: [
    'https://sepolia.mantlescan.xyz'
  ],
};

// Ponder GraphQL endpoint
export const PONDER_GRAPHQL_URL = 'http://localhost:3002/graphql';

// Backend API for IPFS operations
export const BACKEND_API_URL = 'http://localhost:3001';