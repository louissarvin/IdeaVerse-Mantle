import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { web3Service } from '../services/web3';
import { CONTRACT_ADDRESSES } from '../contracts/config';

interface SuperheroState {
  hasSuperhero: boolean;
  name: string | null;
  timestamp: number;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
  hasSuperheroIdentity: boolean;
  superheroName: string | null;
  isCheckingSuperhero: boolean;
  lastCheckedAddress: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<{ address: string; chainId: number }>;
  disconnectWallet: () => void;
  checkConnection: () => Promise<void>;
  validateSuperheroState: (address: string) => Promise<SuperheroState>;
  refreshWalletState: () => Promise<void>;
  refreshSuperheroIdentity: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isLoading: false,
    error: null,
    hasSuperheroIdentity: false,
    superheroName: null,
    isCheckingSuperhero: false,
    lastCheckedAddress: null,
  });

  // ✅ Smart Cache for Superhero States
  const superheroCache = new Map<string, SuperheroState>();
  const activeRequests = new Map<string, Promise<SuperheroState>>();


  // ✅ CORE FUNCTION: Smart Superhero State Validation with Caching
  const validateSuperheroState = useCallback(async (address: string): Promise<SuperheroState> => {
    if (!address) {
      return { hasSuperhero: false, name: null, timestamp: Date.now() };
    }


    // ✅ STEP 1: Check cache first (30 second expiry)
    const cacheKey = address.toLowerCase();
    const cached = superheroCache.get(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const isExpired = age > 30000;
      
      if (!isExpired) {
        return cached;
      } else {
        superheroCache.delete(cacheKey);
      }
    }

    // ✅ STEP 2: Check if there's already an active request for this address
    const activeRequest = activeRequests.get(address.toLowerCase());
    if (activeRequest) {
      return activeRequest;
    }

    // ✅ STEP 3: Create new validation request
    const validationPromise = (async (): Promise<SuperheroState> => {
      try {

        // ✅ STEP 1: Check GraphQL database first (most reliable)
        try {
          console.log('🔍 Checking GraphQL for address:', address);
          
          // Try checksummed address first (most likely to match database), then lowercase
          const checksummedAddress = ethers.utils.getAddress(address);
          const queries = [
            { address: checksummedAddress, description: 'checksummed case' },
            { address: address.toLowerCase(), description: 'lowercase' },
            { address: address, description: 'original case' }
          ];
          
          for (const { address: queryAddress, description } of queries) {
            console.log(`🔍 Trying ${description}:`, queryAddress);
            
            const graphqlResponse = await fetch('http://localhost:3002/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `{ superheros(where: { id: "${queryAddress}" }) { items { id name bio } } }`
              })
            });

            console.log('📡 GraphQL response status:', graphqlResponse.status);
            const graphqlResult = await graphqlResponse.json();
            console.log('📊 GraphQL result:', graphqlResult);
            
            if (graphqlResult.data?.superheros?.items?.length > 0) {
              const superhero = graphqlResult.data.superheros.items[0];
              let decodedName = superhero.name;
              
              // Decode hex-encoded name if needed
              if (superhero.name && superhero.name.startsWith('0x')) {
                try {
                  const hex = superhero.name.slice(2);
                  let str = '';
                  for (let i = 0; i < hex.length; i += 2) {
                    const charCode = parseInt(hex.substr(i, 2), 16);
                    if (charCode !== 0) str += String.fromCharCode(charCode);
                  }
                  decodedName = str;
                } catch (e) {
                  console.warn('Failed to decode hex name:', e);
                }
              }

              console.log('✅ GraphQL found superhero:', {
                address: queryAddress,
                rawName: superhero.name,
                decodedName,
                bio: superhero.bio
              });

              const result: SuperheroState = {
                hasSuperhero: true,
                name: decodedName,
                timestamp: Date.now()
              };
              return result;
            } else {
              console.log(`❌ No superhero found with ${description}:`, queryAddress);
            }
          }
          
          console.log('❌ GraphQL found no superhero for address (tried both cases):', address);
        } catch (error) {
          console.warn('GraphQL check failed:', error);
        }

        // ✅ STEP 2: Check blockchain directly using contract - DISABLED due to call revert exception
        /*
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
              CONTRACT_ADDRESSES.SuperheroNFT,
              [
                "function getSuperheroByOwner(address owner) view returns (tuple(uint256 superheroId, address owner, bytes32 name, bytes32 bio, string metadataUrl))",
                "function hasSuperhero(address owner) view returns (bool)"
              ],
              provider
            );

            const hasSuperhero = await contract.hasSuperhero(address);
            
            if (hasSuperhero) {
              try {
                const superheroData = await contract.getSuperheroByOwner(address);
                let decodedName = ethers.utils.parseBytes32String(superheroData.name);
                
                const result: SuperheroState = {
                  hasSuperhero: true,
                  name: decodedName,
                  timestamp: Date.now()
                };
                return result;
              } catch (e) {
                // If we can't get the name, at least we know they have a superhero
                const result: SuperheroState = {
                  hasSuperhero: true,
                  name: 'Unknown Hero',
                  timestamp: Date.now()
                };
                return result;
              }
            }
          }
        } catch (error) {
          console.warn('Blockchain check failed:', error);
        }
        */

        // ✅ STEP 3: Fallback to API server check
        try {
          const apiResponse = await fetch(`http://localhost:3001/superheroes/${address}?t=${Date.now()}`);
          const apiResult = await apiResponse.json();

          if (apiResult.success && apiResult.data && apiResult.data.name) {
            let decodedName = apiResult.data.name;
            
            // Decode hex-encoded name if needed
            if (apiResult.data.name.startsWith('0x')) {
              try {
                const hex = apiResult.data.name.slice(2);
                let str = '';
                for (let i = 0; i < hex.length; i += 2) {
                  const charCode = parseInt(hex.substr(i, 2), 16);
                  if (charCode !== 0) str += String.fromCharCode(charCode);
                }
                decodedName = str;
              } catch (e) {
                console.warn('Failed to decode hex name:', e);
              }
            }

            const result: SuperheroState = {
              hasSuperhero: true,
              name: decodedName,
              timestamp: Date.now()
            };
            return result;
          }
        } catch (error) {
          console.warn('API check failed:', error);
        }

        // No superhero found
        const result: SuperheroState = {
          hasSuperhero: false,
          name: null,
          timestamp: Date.now()
        };
        return result;

      } catch (error) {
        return {
          hasSuperhero: false,
          name: null,
          timestamp: Date.now()
        };
      }
    })();

    // ✅ STEP 4: Store active request and execute
    activeRequests.set(address.toLowerCase(), validationPromise);

    try {
      const result = await validationPromise;
      
      // ✅ STEP 5: Cache result and cleanup
      const cacheKey = address.toLowerCase();
      superheroCache.set(cacheKey, result);
      activeRequests.delete(cacheKey);
      
      return result;
    } catch (error) {
      activeRequests.delete(address.toLowerCase());
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await web3Service.connectWallet();
      
      // ✅ Use smart validation for connection too
      try {
        const superheroState = await validateSuperheroState(result.address);
        
        const newState = {
          isConnected: true,
          address: result.address,
          chainId: result.chainId,
          isLoading: false,
          error: null,
          hasSuperheroIdentity: superheroState.hasSuperhero,
          superheroName: superheroState.name,
          isCheckingSuperhero: false,
          lastCheckedAddress: result.address,
        };
        
        setState(newState);
      } catch (error) {
        // Fallback to basic connection
        setState({
          isConnected: true,
          address: result.address,
          chainId: result.chainId,
          isLoading: false,
          error: null,
          hasSuperheroIdentity: false,
          superheroName: null,
          isCheckingSuperhero: false,
          lastCheckedAddress: null,
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    // ✅ FIX: Clear cache when disconnecting to prevent data leakage to next connection
    superheroCache.clear();
    activeRequests.clear();
    
    web3Service.disconnect();
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      isLoading: false,
      error: null,
      hasSuperheroIdentity: false,
      superheroName: null,
      isCheckingSuperhero: false,
      lastCheckedAddress: null,
    });
  }, []);

  const checkConnection = useCallback(async () => {
    // First, let's see what MetaMask reports directly
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          
          // ✅ Use smart validation for connection check too
          try {
            const superheroState = await validateSuperheroState(accounts[0]);
            
            setState({
              isConnected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              isLoading: false,
              error: null,
              hasSuperheroIdentity: superheroState.hasSuperhero,
              superheroName: superheroState.name,
              isCheckingSuperhero: false,
              lastCheckedAddress: accounts[0],
            });
            
          } catch (error) {
            // Fallback to basic state
            setState({
              isConnected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              isLoading: false,
              error: null,
              hasSuperheroIdentity: false,
              superheroName: null,
              isCheckingSuperhero: false,
              lastCheckedAddress: null,
            });
          }
          return;
        } else {
        }
      } catch (error) {
      }
    }
    
    // Fallback to web3Service (but this might be cached)
    try {
      const address = await web3Service.getAccount();
      
      if (address) {
        const network = await web3Service.getNetwork();
        // ✅ Use smart validation for web3Service connection too
        try {
          const superheroState = await validateSuperheroState(address);
          
          setState({
            isConnected: true,
            address,
            chainId: network.chainId,
            isLoading: false,
            error: null,
            hasSuperheroIdentity: superheroState.hasSuperhero,
            superheroName: superheroState.name,
            isCheckingSuperhero: false,
            lastCheckedAddress: address,
          });
        } catch (error) {
          setState({
            isConnected: true,
            address,
            chainId: network.chainId,
            isLoading: false,
            error: null,
            hasSuperheroIdentity: false,
            superheroName: null,
            isCheckingSuperhero: false,
            lastCheckedAddress: null,
          });
        }
      } else {
        setState({
          isConnected: false,
          address: null,
          chainId: null,
          hasSuperheroIdentity: false,
          superheroName: null,
          isLoading: false,
          error: null,
          isCheckingSuperhero: false,
          lastCheckedAddress: null,
        });
      }
    } catch (error) {
      setState({
        isConnected: false,
        address: null,
        chainId: null,
        hasSuperheroIdentity: false,
        superheroName: null,
        isLoading: false,
        error: null,
        isCheckingSuperhero: false,
        lastCheckedAddress: null,
      });
    }
  }, []);

  const refreshWalletState = useCallback(async () => {
    
    // Force disconnect from web3Service
    web3Service.disconnect();
    
    // Clear the cache to force fresh lookups
    superheroCache.clear();
    activeRequests.clear();
    
    try {
      if (window.ethereum) {
        // Force MetaMask to give us the current account with no caching
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts'
        });
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          const numericChainId = parseInt(chainId, 16);
          
          // Always validate the current address fresh (no cache)
          const superheroState = await validateSuperheroState(currentAccount);
          
          setState({
            isConnected: true,
            address: currentAccount,
            chainId: numericChainId,
            hasSuperheroIdentity: superheroState.hasSuperhero,
            superheroName: superheroState.name,
            isLoading: false,
            error: null,
            isCheckingSuperhero: false,
            lastCheckedAddress: currentAccount,
          });
          
          
        } else {
          setState({
            isConnected: false,
            address: null,
            chainId: null,
            hasSuperheroIdentity: false,
            superheroName: null,
            isLoading: false,
            error: null,
            isCheckingSuperhero: false,
            lastCheckedAddress: null,
          });
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh'
      }));
    }
  }, []); // Remove state dependency to prevent infinite loop

  // ✅ Function to refresh superhero identity after creation
  const refreshSuperheroIdentity = useCallback(async () => {
    if (!state.address) {
      console.warn('Cannot refresh superhero identity: no address connected');
      return;
    }

    try {
      // Clear cache for this address to force fresh lookup
      const cacheKey = state.address.toLowerCase();
      superheroCache.delete(cacheKey);
      activeRequests.delete(cacheKey);

      setState(prev => ({
        ...prev,
        isCheckingSuperhero: true,
        error: null
      }));

      // Get fresh superhero state
      const superheroState = await validateSuperheroState(state.address);
      
      setState(prev => ({
        ...prev,
        hasSuperheroIdentity: superheroState.hasSuperhero,
        superheroName: superheroState.name,
        isCheckingSuperhero: false,
        lastCheckedAddress: state.address
      }));

      console.log('Superhero identity refreshed:', {
        address: state.address,
        hasSuperhero: superheroState.hasSuperhero,
        name: superheroState.name
      });

    } catch (error) {
      console.error('Failed to refresh superhero identity:', error);
      setState(prev => ({
        ...prev,
        isCheckingSuperhero: false,
        error: 'Failed to refresh superhero identity'
      }));
    }
  }, [state.address, validateSuperheroState]);

  // ✅ OLD checkSuperheroIdentity REMOVED - Replaced with smart validateSuperheroState approach

  // ✅ Removed old useEffect - now using smart validation approach

  useEffect(() => {
    checkConnection();

    // ✅ SMART EVENT HANDLER - Pre-validation approach
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
        return;
      }

      const newAddress = accounts[0];
      // ✅ FIX: Clear cache immediately when address changes to prevent stale data
      superheroCache.clear();
      activeRequests.clear();

      // ✅ STEP 1: Set loading state immediately
      setState(prev => ({
        ...prev,
        address: newAddress,
        isCheckingSuperhero: true,
        error: null
      }));

      try {
        // ✅ STEP 2: Validate what this address SHOULD show
        const superheroState = await validateSuperheroState(newAddress);
        
        // ✅ STEP 3: Set the correct state immediately based on validation
        setState(prev => {
          // Double-check this is still the current address
          if (prev.address !== newAddress) {
            return prev;
          }

          const newState = {
            isConnected: true,
            address: newAddress,
            chainId: prev.chainId,
            isLoading: false,
            error: null,
            // ✅ CONDITIONAL STATE - Set correct state immediately
            hasSuperheroIdentity: superheroState.hasSuperhero,
            superheroName: superheroState.name,
            isCheckingSuperhero: false,
            lastCheckedAddress: newAddress,
          };


          return newState;
        });

      } catch (error) {
        
        // ✅ FALLBACK: Set safe state on error
        setState(prev => {
          if (prev.address !== newAddress) return prev;
          
          return {
            ...prev,
            hasSuperheroIdentity: false,
            superheroName: null,
            isCheckingSuperhero: false,
            error: error instanceof Error ? error.message : 'Validation failed'
          };
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setState(prev => ({ ...prev, chainId: newChainId }));
    };

    web3Service.setupEventListeners(handleAccountsChanged, handleChainChanged);

    return () => {
      web3Service.removeEventListeners();
    };
  }, [checkConnection, disconnectWallet]);

  // Log state changes

  const value: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    checkConnection,
    validateSuperheroState,
    refreshWalletState,
    refreshSuperheroIdentity,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};