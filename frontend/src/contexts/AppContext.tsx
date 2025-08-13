import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  reputation: number;
  walletConnected: boolean;
  balance: number;
}

interface Builder {
  id: number;
  address?: string; // Wallet address for fetching profile data
  name: string;
  username: string;
  avatar: string;
  level: number;
  reputation: number;
  specialties: string[];
  achievements: string[];
  teamsFormed: number;
  ideasMinted: number;
  bgGradient: string;
  location: string;
  joinedDate: string;
  bio: string;
  skills: string[];
  currentProjects: number;
  followers: number;
  following: number;
  isOnline: boolean;
  featured: boolean;
  pixelColor: string;
  rating: number;
  totalRatings: number;
  userRating?: number;
}

interface BuilderRating {
  builderId: number;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  creator: string;
  avatar: string;
  price: string;
  likes: number;
  views: number;
  isLocked: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  featured: boolean;
  pixelColor: string;
  isLiked?: boolean;
  isOwned?: boolean;
  categories: string[]; // Multiple categories from mint form
  attachments?: string[]; // File attachments
  isSold?: boolean; // Track if idea has been sold
  soldDate?: string; // When it was sold
  soldPrice?: string; // Final sale price
}

interface SuperheroData {
  name: string;
  bio: string;
  avatarUrl: string;
  createdAt: number;
  reputation: number;
  specialties: string[];
  skills: string[];
  location: string;
}

interface AppContextType {
  user: User | null;
  ideas: Idea[];
  builders: Builder[];
  builderRatings: BuilderRating[];
  connectedWallet: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  likeIdea: (ideaId: number) => void;
  purchaseIdea: (ideaId: number) => Promise<void>;
  mintNewIdea: (idea: Omit<Idea, 'id' | 'likes' | 'views' | 'createdAt'>) => void;
  rateBuilder: (builderId: number, rating: number, review?: string) => void;
  getBuilderRating: (builderId: number) => number;
  createSuperhero: (data: SuperheroData) => Promise<Builder>;
  loadBuilders: (forceBlockchain?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  refreshIdeas: () => Promise<void>;
  refreshPurchaseHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const initialBuilders: Builder[] = [
  {
    id: 1,
    name: 'Alex Chen',
    username: '@alexbuilds',
    avatar: '👨‍💻',
    level: 42,
    reputation: 2850,
    specialties: ['DeFi', 'Smart Contracts', 'Solidity'],
    achievements: ['First Mint', 'Team Player', 'Innovation Leader', 'Code Master'],
    teamsFormed: 12,
    ideasMinted: 8,
    bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
    location: 'San Francisco, CA',
    joinedDate: 'Jan 2024',
    bio: 'Passionate DeFi developer with 5+ years of experience building innovative blockchain solutions.',
    skills: ['Solidity', 'React', 'Node.js', 'Web3.js'],
    currentProjects: 3,
    followers: 1240,
    following: 340,
    isOnline: true,
    featured: true,
    pixelColor: 'from-blue-400 to-purple-500',
    rating: 4.8,
    totalRatings: 156,
  },
  {
    id: 2,
    name: 'Sarah Kim',
    username: '@sarahcodes',
    avatar: '👩‍🎨',
    level: 38,
    reputation: 2340,
    specialties: ['UI/UX', 'Frontend', 'Design Systems'],
    achievements: ['Design Master', 'Community Builder', 'Pixel Artist', 'Mentor'],
    teamsFormed: 9,
    ideasMinted: 15,
    bgGradient: 'from-moss-green/20 to-sunset-coral/20',
    location: 'New York, NY',
    joinedDate: 'Feb 2024',
    bio: 'Creative designer focused on making Web3 accessible through beautiful user experiences.',
    skills: ['Figma', 'React', 'Tailwind', 'Framer'],
    currentProjects: 5,
    followers: 890,
    following: 520,
    isOnline: false,
    featured: true,
    pixelColor: 'from-pink-400 to-rose-500',
    rating: 4.6,
    totalRatings: 89,
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    username: '@marcusdev',
    avatar: '🚀',
    level: 55,
    reputation: 3420,
    specialties: ['Blockchain', 'Backend', 'Architecture'],
    achievements: ['Code Ninja', 'Mentor', 'Tech Lead', 'Pioneer'],
    teamsFormed: 18,
    ideasMinted: 6,
    bgGradient: 'from-sky-blue/20 to-moss-green/20',
    location: 'London, UK',
    joinedDate: 'Dec 2023',
    bio: 'Senior blockchain architect with expertise in scalable Web3 infrastructure.',
    skills: ['Rust', 'Go', 'Docker', 'Kubernetes'],
    currentProjects: 2,
    followers: 1560,
    following: 280,
    isOnline: true,
    featured: true,
    pixelColor: 'from-green-400 to-emerald-500',
    rating: 4.9,
    totalRatings: 203,
  },
  {
    id: 4,
    name: 'Luna Rodriguez',
    username: '@lunacrypto',
    avatar: '🌙',
    level: 33,
    reputation: 1890,
    specialties: ['GameFi', 'NFTs', 'Community'],
    achievements: ['Game Master', 'NFT Creator', 'Community Leader'],
    teamsFormed: 7,
    ideasMinted: 12,
    bgGradient: 'from-sunset-coral/20 to-moss-green/20',
    location: 'Barcelona, Spain',
    joinedDate: 'Mar 2024',
    bio: 'GameFi enthusiast building the future of play-to-earn experiences.',
    skills: ['Unity', 'C#', 'Solidity', 'Blender'],
    currentProjects: 4,
    followers: 670,
    following: 450,
    isOnline: true,
    featured: false,
    pixelColor: 'from-indigo-400 to-purple-500',
    rating: 4.4,
    totalRatings: 67,
  },
  {
    id: 5,
    name: 'David Park',
    username: '@davidbuilds',
    avatar: '⚡',
    level: 29,
    reputation: 1560,
    specialties: ['Mobile', 'React Native', 'Flutter'],
    achievements: ['Mobile Expert', 'Fast Learner', 'Team Builder'],
    teamsFormed: 5,
    ideasMinted: 9,
    bgGradient: 'from-sky-blue/20 to-sunset-coral/20',
    location: 'Seoul, South Korea',
    joinedDate: 'Apr 2024',
    bio: 'Mobile developer bringing Web3 to mobile platforms worldwide.',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    currentProjects: 3,
    followers: 420,
    following: 380,
    isOnline: false,
    featured: false,
    pixelColor: 'from-yellow-400 to-orange-500',
    rating: 4.2,
    totalRatings: 34,
  },
  {
    id: 6,
    name: 'Emma Wilson',
    username: '@emmaweb3',
    avatar: '🎯',
    level: 46,
    reputation: 2680,
    specialties: ['Product', 'Strategy', 'Growth'],
    achievements: ['Product Leader', 'Growth Hacker', 'Strategist', 'Connector'],
    teamsFormed: 14,
    ideasMinted: 4,
    bgGradient: 'from-moss-green/20 to-sky-blue/20',
    location: 'Toronto, Canada',
    joinedDate: 'Jan 2024',
    bio: 'Product strategist helping Web3 projects achieve product-market fit.',
    skills: ['Product Management', 'Analytics', 'Growth', 'Strategy'],
    currentProjects: 6,
    followers: 980,
    following: 290,
    isOnline: true,
    featured: false,
    pixelColor: 'from-cyan-400 to-teal-500',
    rating: 4.7,
    totalRatings: 112,
  },
];

const initialIdeas: Idea[] = [
  {
    id: 1,
    title: 'DeFi Social Trading Platform',
    description: 'Revolutionary platform combining social media with decentralized trading. Users can follow top traders, copy their strategies, and earn rewards through social interactions.',
    creator: 'Alex Chen',
    avatar: '👨‍💻',
    price: '2.5 ETH',
    likes: 42,
    views: 1234,
    isLocked: false,
    category: 'DeFi',
    tags: ['DeFi', 'Trading', 'Social'],
    categories: ['DeFi', 'Social'],
    createdAt: '2 days ago',
    featured: true,
    pixelColor: 'from-blue-400 to-purple-500',
    isSold: true,
    soldDate: '1 day ago',
    soldPrice: '2.5 ETH',
  },
  {
    id: 2,
    title: 'NFT Fitness Gamification',
    description: 'Turn your workout routine into an engaging NFT collection game. Earn unique fitness NFTs based on your achievements and compete with friends.',
    creator: 'Luna Rodriguez',
    avatar: '🌙',
    price: '1.8 ETH',
    likes: 38,
    views: 892,
    isLocked: true,
    category: 'Gaming',
    tags: ['Gaming', 'NFTs', 'Fitness'],
    categories: ['Gaming', 'NFTs'],
    createdAt: '1 week ago',
    featured: false,
    pixelColor: 'from-green-400 to-emerald-500',
    isSold: false,
  },
  {
    id: 3,
    title: 'Carbon Credit Marketplace',
    description: 'Transparent blockchain-based carbon credit trading platform. Verify, trade, and track environmental impact with smart contracts and real-time monitoring.',
    creator: 'Emma Wilson',
    avatar: '🎯',
    price: '3.2 ETH',
    likes: 67,
    views: 1876,
    isLocked: false,
    category: 'Sustainability',
    tags: ['Sustainability', 'Trading', 'Environment'],
    categories: ['Sustainability', 'DeFi'],
    createdAt: '3 days ago',
    featured: true,
    pixelColor: 'from-orange-400 to-red-500',
    isSold: true,
    soldDate: '2 days ago',
    soldPrice: '3.2 ETH',
  },
  {
    id: 4,
    title: 'Decentralized Education Hub',
    description: 'Learn, teach, and earn with blockchain-verified educational content. Create courses, earn tokens for learning, and build your reputation as an educator.',
    creator: 'Sarah Kim',
    avatar: '👩‍🎨',
    price: '2.1 ETH',
    likes: 53,
    views: 1456,
    isLocked: false,
    category: 'Education',
    tags: ['Education', 'Learning', 'Tokens'],
    categories: ['Education', 'DeFi'],
    createdAt: '5 days ago',
    featured: false,
    pixelColor: 'from-indigo-400 to-blue-500',
    isSold: true,
    soldDate: '3 days ago',
    soldPrice: '2.1 ETH',
  },
  {
    id: 5,
    title: 'AI-Powered Smart Contracts',
    description: 'Next-generation smart contracts that adapt and optimize themselves using artificial intelligence and machine learning algorithms.',
    creator: 'Marcus Johnson',
    avatar: '🚀',
    price: '4.5 ETH',
    likes: 89,
    views: 2341,
    isLocked: false,
    category: 'DeFi',
    tags: ['DeFi', 'AI', 'Smart Contracts'],
    categories: ['DeFi', 'AI'],
    createdAt: '4 days ago',
    featured: true,
    pixelColor: 'from-purple-400 to-pink-500',
    isSold: true,
    soldDate: '1 day ago',
    soldPrice: '4.5 ETH',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]); // Start empty, load from API
  const [builders, setBuilders] = useState<Builder[]>(initialBuilders);
  const [builderRatings, setBuilderRatings] = useState<BuilderRating[]>([]);
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = () => {
    // Simulate wallet connection
    setConnectedWallet(true);
    setUser({
      id: '1',
      name: 'Alex Builder',
      username: '@alexbuilder',
      avatar: '🦸‍♂️',
      level: 25,
      reputation: 1850,
      walletConnected: true,
      balance: 5.2,
    });
  };

  const disconnectWallet = () => {
    setConnectedWallet(false);
    setUser(null);
  };

  const likeIdea = (ideaId: number) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            likes: idea.isLiked ? idea.likes - 1 : idea.likes + 1,
            isLiked: !idea.isLiked 
          }
        : idea
    ));
  };

  const purchaseIdea = async (ideaId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Import web3Service and ApiService dynamically to avoid circular imports
      const { web3Service } = await import('../services/web3');
      const { ApiService } = await import('../services/api');

      // Ensure Web3 provider is connected
      let currentAddress;
      
      try {
        currentAddress = await web3Service.getAccount();
      } catch (error) {
      }
      
      // If web3Service doesn't have an address, try to connect it
      if (!currentAddress) {
        try {
          const connectionResult = await web3Service.connectWallet();
          currentAddress = connectionResult.address;
          
          // Wait a moment for provider to fully initialize
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (connectError) {
          throw new Error('Failed to initialize wallet connection for purchase. Please try refreshing the page.');
        }
      }

      if (!currentAddress) {
        throw new Error('Wallet connection failed');
      }

      
      // Add a simple USDC balance check first with retry logic
      let usdcBalance;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          usdcBalance = await web3Service.getUSDCBalance(currentAddress);
          break; // Success, exit retry loop
        } catch (balanceError: any) {
          retryCount++;
          console.warn(`⚠️ USDC balance check attempt ${retryCount} failed:`, balanceError.message);
          
          if (balanceError.message.includes('Provider not initialized') && retryCount < maxRetries) {
            // Wait before retry and try to reinitialize
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try to reconnect if provider is not initialized
            try {
              await web3Service.connectWallet();
            } catch (reconnectError) {
              console.warn('Failed to reconnect during retry:', reconnectError);
            }
          } else {
            // Final attempt failed or different error
            if (balanceError.message.includes('Provider not initialized')) {
              throw new Error('Wallet connection issue. Please disconnect and reconnect your wallet, then try again.');
            }
            throw balanceError;
          }
        }
      }
      
      if (retryCount >= maxRetries) {
        throw new Error('Failed to connect to wallet after multiple attempts. Please disconnect and reconnect your wallet.');
      }
      
      
      if (parseFloat(usdcBalance) === 0) {
        // Auto-mint USDC for testing since this is a test environment
        setError('Minting test USDC tokens...');
        try {
          await web3Service.mintUSDC('10000', currentAddress);
          setError('USDC minted! Proceeding with purchase...');
        } catch (mintError: any) {
          throw new Error(`Failed to mint USDC tokens: ${mintError.message}`);
        }
      }

      
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) {
        throw new Error(`Idea not found. Looking for ID: ${ideaId}, Available IDs: ${ideas.map(i => i.id).join(', ')}`);
      }

      // Extract price value (remove 'USDC' suffix)
      const priceStr = idea.price.replace(' USDC', '').replace(' ETH', '');
      const priceAmount = parseFloat(priceStr);

      if (isNaN(priceAmount)) {
        throw new Error('Invalid price format');
      }


      // Step 1: Check USDC balance and allowance
      setError('Checking USDC balance...');
      
      let usdcStatus;
      try {
        usdcStatus = await web3Service.checkUSDCAllowanceAndBalance(priceAmount.toString(), currentAddress);
      } catch (usdcError: any) {
        throw new Error(`Failed to check USDC balance: ${usdcError.message}`);
      }
      
      if (!usdcStatus.hasBalance) {
        throw new Error(`Insufficient USDC balance. You have ${usdcStatus.balance} USDC but need ${priceAmount} USDC`);
      }

      // Step 2: Approve USDC if needed
      if (usdcStatus.needsApproval) {
        setError('Please approve USDC spending in your wallet...');
        
        try {
          const approvalTxHash = await web3Service.approveUSDC(priceAmount.toString());
          setError('USDC approved! Processing purchase...');
          
          // Wait a moment for the approval to be confirmed
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (approvalError: any) {
          throw new Error(`Failed to approve USDC spending: ${approvalError.message}. Please try again.`);
        }
      }

      // Step 3: Execute purchase via smart contract
      setError('Processing purchase on blockchain...');
      
      let transactionHash;
      try {
        transactionHash = await web3Service.buyIdea(ideaId);
      } catch (purchaseError: any) {
        throw new Error(`Purchase failed: ${purchaseError.message}`);
      }

      // Log transaction details for verification

      // Record the purchase for future purchase history
      try {
        await ApiService.recordPurchase({
          ideaId,
          buyer: currentAddress,
          seller: idea.creator || 'Unknown',
          price: priceAmount.toString(),
          transactionHash,
          timestamp: new Date().toISOString()
        });
      } catch (recordError) {
        // Don't fail the entire purchase for this
      }

      // Step 4: Retrieve and decrypt content
      setError('Decrypting content...');
      
      try {
        const contentResponse = await ApiService.getIdeaContent(ideaId, currentAddress);
        if (contentResponse.success) {
          // Clear error state on success
          setError(null);
        } else {
          }
      } catch (contentError) {
        // Don't fail the entire purchase for content issues
      }

      // Step 5: Update UI state
      setIdeas(prev => {
        const updatedIdeas = prev.map(ideaItem => 
          ideaItem.id === ideaId 
            ? { 
                ...ideaItem, 
                isOwned: true,
                isSold: true,
                soldDate: 'Just now',
                soldPrice: `${priceAmount} USDC`
              }
            : ideaItem
        );
        
        
        return updatedIdeas;
      });
      
      // Refresh user data to update balance
      await refreshData();
      

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase idea';
      setError(errorMessage);
      
      // Re-throw error so UI can handle it with toast
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const mintNewIdea = (newIdea: Omit<Idea, 'id' | 'likes' | 'views' | 'createdAt'>) => {
    // Generate pixel color based on primary category
    const getPixelColor = (category: string) => {
      const colorMap: Record<string, string> = {
        'DeFi': 'from-blue-400 to-purple-500',
        'Gaming': 'from-green-400 to-emerald-500',
        'Sustainability': 'from-orange-400 to-red-500',
        'Education': 'from-indigo-400 to-blue-500',
        'Art': 'from-pink-400 to-rose-500',
        'Metaverse': 'from-cyan-400 to-teal-500',
      };
      return colorMap[category] || 'from-gray-400 to-gray-600';
    };

    const idea: Idea = {
      ...newIdea,
      id: ideas.length + 1,
      likes: 0,
      views: 0,
      createdAt: 'Just now',
      pixelColor: getPixelColor(newIdea.category),
      tags: newIdea.categories || [], // Use categories as tags
      isSold: false, // New ideas start as unsold
    };
    
    setIdeas(prev => [idea, ...prev]);

    // Update user's ideas minted count
    if (user) {
      const userBuilder = builders.find(b => b.name === user.name);
      if (userBuilder) {
        setBuilders(prev => prev.map(builder => 
          builder.id === userBuilder.id 
            ? { ...builder, ideasMinted: builder.ideasMinted + 1 }
            : builder
        ));
      }
    }
  };

  const rateBuilder = (builderId: number, rating: number, review?: string) => {
    if (!user) return;

    // Remove existing rating from this user for this builder
    setBuilderRatings(prev => prev.filter(r => !(r.builderId === builderId && r.userId === user.id)));

    // Add new rating
    const newRating: BuilderRating = {
      builderId,
      userId: user.id,
      rating,
      review,
      createdAt: new Date().toISOString(),
    };
    setBuilderRatings(prev => [...prev, newRating]);

    // Update builder's rating and total ratings
    setBuilders(prev => prev.map(builder => {
      if (builder.id === builderId) {
        const builderRatings = [...builderRatings.filter(r => r.builderId === builderId), newRating];
        const avgRating = builderRatings.reduce((sum, r) => sum + r.rating, 0) / builderRatings.length;
        return {
          ...builder,
          rating: Math.round(avgRating * 10) / 10,
          totalRatings: builderRatings.length,
          userRating: rating,
        };
      }
      return builder;
    }));
  };

  const getBuilderRating = (builderId: number): number => {
    if (!user) return 0;
    const userRating = builderRatings.find(r => r.builderId === builderId && r.userId === user.id);
    return userRating?.rating || 0;
  };

  const createSuperhero = async (data: SuperheroData): Promise<Builder> => {
    const newId = Math.max(...builders.map(b => b.id)) + 1;
    
    const newSuperhero: Builder = {
      id: newId,
      name: data.name,
      username: `@${data.name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: data.avatarUrl,
      level: 1,
      reputation: data.reputation,
      specialties: data.specialties,
      achievements: ['New Superhero'],
      teamsFormed: 0,
      ideasMinted: 0,
      bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
      location: data.location,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      bio: data.bio,
      skills: data.skills,
      currentProjects: 0,
      followers: 0,
      following: 0,
      isOnline: true,
      featured: false,
      pixelColor: 'from-green-400 to-emerald-500',
      rating: 0,
      totalRatings: 0,
    };

    setBuilders(prev => [...prev, newSuperhero]);
    
    // Update user to reflect the new superhero
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        name: data.name,
        avatar: data.avatarUrl,
        level: 1,
        reputation: data.reputation,
      } : null);
    }

    return newSuperhero;
  };

  const loadBuilders = async (forceBlockchain: boolean = false): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use API server instead of direct Ponder access
      const url = `http://localhost:3001/superheroes`;
      console.log(`Loading builders from API server: ${url}`);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`Received ${result.data.length} builders from ${result.debug?.dataSource || 'api'} source`);
        console.log('Sample superhero data:', result.data[0]);
        
        // Transform API superhero data to Builder format
        const transformedBuilders: Builder[] = result.data.map((superhero: any, index: number) => {
          // Data is already decoded by the API server
          const name = superhero.name || `Superhero ${superhero.superhero_id}`;
          const bio = superhero.bio || 'A superhero builder';
          
          // Skills and specialties are already decoded arrays
          const skills = Array.isArray(superhero.skills) ? superhero.skills : [];
          const specialties = Array.isArray(superhero.specialities) ? superhero.specialities : [];
          
          // Use the emoji avatar from backend
          const avatarEmoji = superhero.avatar_url || '🦸‍♂️';
          
          return {
            id: superhero.superhero_id || superhero.id || index + 1,
            address: superhero.address, // Wallet address for profile fetching
            name: name,
            username: `@${(name || `hero${superhero.superhero_id}`).toLowerCase().replace(/\s+/g, '')}`,
            avatar: avatarEmoji,
            avatarUrl: null,
            level: superhero.level || Math.floor((superhero.reputation || 0) / 100) + 1,
            reputation: superhero.reputation || 0,
            specialties: specialties.length > 0 ? specialties : ['Blockchain', 'Web3'],
            achievements: superhero.achievements || ['Blockchain Pioneer', 'Builder'],
            teamsFormed: 0,
            ideasMinted: 0,
            bgGradient: `from-${['blue', 'green', 'purple', 'orange', 'pink'][index % 5]}-400/20 to-${['purple', 'blue', 'indigo', 'red', 'yellow'][index % 5]}-500/20`,
            location: superhero.location || 'Decentralized',
            joinedDate: superhero.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            bio: bio,
            skills: skills.length > 0 ? skills : ['Smart Contracts', 'DeFi', 'NFTs'],
            currentProjects: superhero.currentProjects || Math.floor(Math.random() * 3),
            followers: superhero.followers || Math.floor(Math.random() * 500),
            following: superhero.following || Math.floor(Math.random() * 200),
            isOnline: superhero.isOnline !== undefined ? superhero.isOnline : Math.random() > 0.3,
            featured: superhero.featured || index < 3,
            pixelColor: `from-${['blue', 'green', 'purple', 'orange', 'pink'][index % 5]}-400 to-${['purple', 'blue', 'indigo', 'red', 'yellow'][index % 5]}-500`,
            rating: superhero.rating || 0,
            totalRatings: superhero.totalRatings || 0,
            source: result.debug?.dataSource || 'api',
          };
        });
        
        setBuilders(transformedBuilders);
        
        // Show data source info to user
        if (result.debug?.dataSource) {
          const sourceMessage = result.debug.dataSource === 'hybrid' 
            ? `Loaded ${transformedBuilders.length} builders (${result.stats?.databaseCount || 0} from database, ${result.stats?.blockchainCount || 0} from blockchain)`
            : `Loaded ${transformedBuilders.length} builders from ${result.debug.dataSource}`;
          
          console.log(sourceMessage);
          
          // Only show error if we had to use fallback
          if (result.debug.dataSource === 'hybrid' && result.stats?.blockchainCount > result.stats?.databaseCount) {
            setError(`Database incomplete. Showing all ${transformedBuilders.length} builders from blockchain.`);
          }
        }
        
      } else {
        console.warn('❌ API returned no data or failed, using mock data temporarily');
        console.log('API response:', result);
        setBuilders(initialBuilders);
        setError('API unavailable. Showing demo builders temporarily.');
      }
    } catch (error) {
      console.error('❌ Failed to load builders:', error);
      setBuilders(initialBuilders);
      setError(`Failed to connect to backend: ${error}. Showing demo data.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse hex-encoded strings
  const parseHexString = (hexString: string): string => {
    try {
      if (!hexString.startsWith('0x')) return hexString;
      
      const hex = hexString.slice(2);
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode !== 0) { // Skip null bytes
          str += String.fromCharCode(charCode);
        }
      }
      return str.trim() || hexString;
    } catch (e) {
      return hexString;
    }
  };

  const refreshData = async (): Promise<void> => {
    // Placeholder for refresh functionality
  };

  const refreshIdeas = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load ideas from backend API
      const ideasResponse = await fetch('http://localhost:3002/ideas?page=1&limit=50&available=false');
      const ideasResult = await ideasResponse.json();
      
      if (ideasResult.success && ideasResult.data) {
        
        // Convert API ideas to local format for display
        const apiIdeas = ideasResult.data.map((apiIdea: any, index: number) => {
          // Parse hex-encoded title if needed
          const title = apiIdea.title?.startsWith('0x') ? 
            parseHexString(apiIdea.title) : 
            apiIdea.title;
          
          return {
            id: parseInt(apiIdea.ideaId || apiIdea.idea_id) || (1000 + index + Date.now() % 1000),
            backendId: parseInt(apiIdea.ideaId || apiIdea.idea_id), // Store original backend ID for API calls
            title: title || 'Untitled Idea',
            description: apiIdea.description || 'No description provided',
            creator: apiIdea.creatorName || apiIdea.creator || 'Unknown Creator',
            avatar: '🦸‍♂️', // Default avatar - we'll improve this with actual superhero avatars
            price: typeof apiIdea.price === 'string' ? `${apiIdea.price} USDC` : `${(apiIdea.price / 1000000).toFixed(2)} USDC`,
            likes: parseInt(apiIdea.ratingTotal || apiIdea.rating_total) || 0,
            views: Math.floor(Math.random() * 1000) + 100,
            isLocked: apiIdea.isPurchased || apiIdea.is_purchased,
            category: apiIdea.categories?.[0] || apiIdea.category?.[0] || 'General',
            tags: apiIdea.categories || apiIdea.category || ['General'],
            categories: apiIdea.categories || apiIdea.category || ['General'],
            createdAt: apiIdea.createdAt ? new Date(apiIdea.createdAt).toLocaleDateString() : 'Recently',
            featured: !(apiIdea.isPurchased || apiIdea.is_purchased),
            pixelColor: 'from-blue-400 to-purple-500',
            isSold: apiIdea.isPurchased || apiIdea.is_purchased,
            isLiked: false,
            isOwned: false
          };
        });
        
        setIdeas(apiIdeas);
        
      } else {
        setIdeas([]); // Clear ideas if API returns empty
      }
    } catch (error) {
      
      // Use mock ideas when backend is unavailable
      const mockIdeas = [
        {
          id: 1,
          backendId: 1,
          title: 'Decentralized Social Network',
          description: 'A revolutionary social platform built on blockchain technology that gives users full control over their data.',
          creator: 'Alex Chen',
          avatar: '🚀',
          price: '50.00 USDC',
          likes: 234,
          views: 1205,
          isLocked: false,
          isSold: false,
          isOwned: false,
          category: 'Social',
          tags: ['Social', 'Blockchain', 'Privacy'],
          categories: ['Social', 'Blockchain'],
          createdAt: 'Dec 15',
          featured: true,
          pixelColor: 'from-blue-400 to-purple-600',
        }
      ];
      
      setIdeas(mockIdeas);
      setError('Failed to connect to backend. Showing demo data.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPurchaseHistory = async (): Promise<void> => {
    // Placeholder for refresh purchase history functionality
  };

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await refreshIdeas();
    };
    
    loadInitialData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <AppContext.Provider value={{
      user,
      ideas,
      builders,
      builderRatings,
      connectedWallet,
      isLoading,
      error,
      connectWallet,
      disconnectWallet,
      likeIdea,
      purchaseIdea,
      mintNewIdea,
      rateBuilder,
      getBuilderRating,
      createSuperhero,
      loadBuilders,
      refreshData,
      refreshIdeas,
      refreshPurchaseHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
};