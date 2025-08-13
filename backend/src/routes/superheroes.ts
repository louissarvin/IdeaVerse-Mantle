import 'dotenv/config';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '@/services/database';
import { IPFSService } from '@/services/ipfs';
import { BlockchainService } from '@/services/blockchain';
import { ethers } from 'ethers';
import type { APIResponse } from '@/types';

// Helper function to generate emoji avatars
const generateEmojiAvatar = (address: string): string => {
  const avatars = [
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '👨‍💻', '👩‍💻', 
    '🧑‍🚀', '👨‍🔬', '👩‍🔬', '🧑‍💼', '👨‍🎨', '👩‍🎨',
    '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍⚕️', '👨‍🌾', '👩‍🌾',
    '🧑‍🍳', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍✈️', '👩‍✈️'
  ];
  
  // Use the address to generate a deterministic index
  const hash = address.toLowerCase().slice(2); // Remove 0x
  let numericValue = 0;
  for (let i = 0; i < Math.min(hash.length, 8); i++) {
    numericValue += parseInt(hash[i], 16) || 0;
  }
  
  return avatars[numericValue % avatars.length];
};

const app = new Hono();
const db = new DatabaseService();
const ipfs = new IPFSService();
const blockchain = new BlockchainService();

// Validation schemas
const createSuperheroSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().min(1).max(500),
  skills: z.array(z.string()).min(1).max(10),
  specialities: z.array(z.string()).min(1).max(5),
});

const metadataSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  image: z.string().url(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()])
  }))
});

// GET /superheroes - Get all superheroes from Ponder database
app.get('/', async (c) => {
  try {
    const response = await fetch('http://localhost:3002', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetAllSuperheroes {
            superheros {
              items {
                id
                superheroId
                name
                bio
                avatarUrl
                reputation
                skills
                specialities
                createdAt
                flagged
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const superheroes = result.data?.superheros?.items || [];
    console.log(`📊 Retrieved ${superheroes.length} superheroes from database`);

    // Transform and decode each superhero's data
    const transformedSuperheroes = superheroes.map((superhero: any) => {
      // Helper function to decode hex values
      const decodeBytes32ToString = (hexString: string): string => {
        if (!hexString || hexString === '0x' || hexString === '0x0000000000000000000000000000000000000000000000000000000000000000') return '';
        try {
          return ethers.utils.parseBytes32String(hexString).trim();
        } catch (e) {
          console.warn('Failed to decode bytes32:', hexString, e);
          return '';
        }
      };

      const decodeBytes32Array = (hexArray: string[]): string[] => {
        if (!Array.isArray(hexArray)) return [];
        return hexArray.map(hex => decodeBytes32ToString(hex)).filter(s => s.length > 0);
      };

      // Decode name, bio, skills and specialities
      const decodedName = decodeBytes32ToString(superhero.name);
      const decodedBio = decodeBytes32ToString(superhero.bio);
      const decodedSkills = Array.isArray(superhero.skills) ? 
        decodeBytes32Array(superhero.skills) : 
        [];
      
      const decodedSpecialities = Array.isArray(superhero.specialities) ? 
        decodeBytes32Array(superhero.specialities) : 
        [];

      return {
        superhero_id: superhero.superheroId || superhero.id,
        address: superhero.id, // id is the address
        name: decodedName || 'Unnamed Hero',
        bio: decodedBio || 'A superhero building the future of Web3',
        avatar_url: generateEmojiAvatar(superhero.id),
        reputation: superhero.reputation || 0,
        skills: decodedSkills,
        specialities: decodedSpecialities,
        created_at: superhero.createdAt || Date.now(),
        flagged: superhero.flagged || false,
        joinedDate: new Date(superhero.createdAt * 1000 || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        location: 'Blockchain Universe',
        currentProjects: Math.floor(Math.random() * 5) + 1,
        totalIdeas: 0,
        totalSales: 0,
        totalRevenue: 0,
        level: Math.floor((superhero.reputation || 0) / 100) + 1,
        achievements: [
          'Blockchain Pioneer',
          'Web3 Builder',
          'Superhero Identity'
        ],
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
        isOnline: Math.random() > 0.3,
        featured: false,
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        totalRatings: Math.floor(Math.random() * 300) + 50
      };
    });

    return c.json({
      success: true,
      data: transformedSuperheroes,
      count: transformedSuperheroes.length,
      debug: {
        dataSource: 'ponder-graphql',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch superheroes:', error);
    
    return c.json({
      success: false,
      error: { 
        code: 'FETCH_ERROR', 
        message: (error as Error).message 
      }
    }, 500);
  }
});

// GET /superheroes/:address/profile - Get complete profile from blockchain
app.get('/:address/profile', async (c) => {
  try {
    const address = c.req.param('address');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    console.log(`🔍 Loading profile for address: ${address}`);

    // Try both checksummed and lowercase address formats for GraphQL query
    const checksummedAddress = address; // Keep original case
    const lowercaseAddress = address.toLowerCase();
    
    let superheroData = null;
    
    // Try to query GraphQL database directly (much faster than blockchain)
    try {
      const addressesToTry = [checksummedAddress, lowercaseAddress];
      
      for (const testAddress of addressesToTry) {
        console.log(`🔍 Trying GraphQL with address: ${testAddress}`);
        try {
          const graphqlResponse = await fetch('http://localhost:3002/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `{ superheros(where: { id: "${testAddress}" }) { items { id superheroId name bio skills specialities reputation createdAt flagged } } }`
            })
          });
          
          const graphqlResult = await graphqlResponse.json();
          if (graphqlResult.data?.superheros?.items?.length > 0) {
            superheroData = graphqlResult.data.superheros.items[0];
            console.log(`✅ Found superhero in GraphQL: ${superheroData.name}`);
            break;
          }
        } catch (fetchError) {
          console.warn(`❌ GraphQL fetch failed for ${testAddress}:`, fetchError);
        }
      }
    } catch (graphqlError) {
      console.warn('❌ GraphQL query failed:', graphqlError);
    }

    if (superheroData) {
      // Successfully found superhero data, process it
      console.log('✅ Processing GraphQL superhero data:', superheroData);
      
      // Helper function to decode hex values
      const decodeBytes32ToString = (hexString: string): string => {
        if (!hexString || hexString === '0x' || hexString === '0x0000000000000000000000000000000000000000000000000000000000000000') return '';
        try {
          // Use ethers to decode bytes32 to string
          return ethers.utils.parseBytes32String(hexString).trim();
        } catch (e) {
          console.warn('Failed to decode bytes32:', hexString, e);
          return '';
        }
      };

      const decodeBytes32Array = (hexArray: string[]): string[] => {
        if (!Array.isArray(hexArray)) return [];
        return hexArray.map(hex => decodeBytes32ToString(hex)).filter(s => s.length > 0);
      };

      // Decode name, bio, skills and specialities
      const decodedName = decodeBytes32ToString(superheroData.name);
      const decodedBio = decodeBytes32ToString(superheroData.bio);
      const decodedSkills = Array.isArray(superheroData.skills) ? 
        decodeBytes32Array(superheroData.skills) : 
        [];
      
      const decodedSpecialities = Array.isArray(superheroData.specialities) ? 
        decodeBytes32Array(superheroData.specialities) : 
        [];

      console.log('🎯 Decoded name:', decodedName);
      console.log('📝 Decoded bio:', decodedBio);
      console.log('🛠️ Decoded skills:', decodedSkills);
      console.log('⚡ Decoded specialities:', decodedSpecialities);

      return c.json({
        success: true,
        data: {
          superhero_id: superheroData.superheroId || superheroData.id,
          address: address,
          name: decodedName || 'Unnamed Hero',
          bio: decodedBio || 'A superhero building the future of Web3',
          avatar_url: generateEmojiAvatar(address),
          reputation: superheroData.reputation || 0,
          skills: decodedSkills,
          specialities: decodedSpecialities,
          created_at: superheroData.createdAt || Date.now(),
          flagged: superheroData.flagged || false,
          joinedDate: new Date(superheroData.createdAt * 1000 || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          location: 'Blockchain Universe',
          currentProjects: Math.floor(Math.random() * 5) + 1,
          totalIdeas: 0,
          totalSales: 0,
          totalRevenue: 0,
          level: Math.floor((superheroData.reputation || 0) / 100) + 1,
          achievements: ['Blockchain Pioneer', 'Web3 Builder', 'Superhero Identity'],
          followers: Math.floor(Math.random() * 500) + 100,
          following: Math.floor(Math.random() * 600) + 150,
          isOnline: Math.random() > 0.5,
          featured: false,
          rating: 3 + Math.random() * 2,
          totalRatings: Math.floor(Math.random() * 200) + 50
        }
      });
    }

    console.log('⚠️ Superhero not found in GraphQL, trying blockchain fallback...');

        // Fallback: Try to fetch directly from blockchain
    const rpcUrl = 'https://rpc.sepolia.mantle.xyz';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // SuperheroNFT contract details for Mantle Sepolia
    const superheroContract = new ethers.Contract(
      '0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84', // Correct contract address
      [
        'function isSuperhero(address _address) external view returns (bool)',
        'function getSuperheroProfile(address _superhero) external view returns (tuple(uint256 superheroId, bytes32 name, bytes32 bio, string avatarUrl, uint256 createdAt, uint256 reputation, bytes32[] specialities, bytes32[] skills, bool flagged))',
      ],
      provider
    );

    try {
      // Convert address to proper checksum format for ethers v5
      const checksumAddress = ethers.utils.getAddress(address.toLowerCase());
      const isSuperhero = await superheroContract.isSuperhero(checksumAddress);
      if (!isSuperhero) {
        return c.json({
          success: false,
          error: { code: 'NO_SUPERHERO_PROFILE', message: 'This address does not have a superhero profile yet' }
        }, 404);
      }

      console.log(`✅ Found superhero profile for ${checksumAddress}, fetching details...`);
      
      // Get profile info (returns a struct)
      const profile = await superheroContract.getSuperheroProfile(checksumAddress);
      
      // Extract values from the struct
      const [superheroId, nameBytes, bioBytes, avatarUrl, createdAt, reputation, specialitiesBytes, skillsBytes, flagged] = profile;
      
      // Convert bytes32 arrays to strings
      const convertBytes32ToString = (bytes32: string): string => {
        return ethers.utils.parseBytes32String(bytes32).trim();
      };
      
      const convertBytes32ArrayToStrings = (bytes32Array: string[]): string[] => {
        return bytes32Array.map(bytes32 => convertBytes32ToString(bytes32)).filter(s => s.length > 0);
      };
      
      const name = convertBytes32ToString(nameBytes);
      const bio = convertBytes32ToString(bioBytes);
      const skills = convertBytes32ArrayToStrings(skillsBytes);
      const specialities = convertBytes32ArrayToStrings(specialitiesBytes);
      
      console.log(`📊 Blockchain Profile - Name: ${name}, Skills: ${skills}, Specialities: ${specialities}`);

      return c.json({
        success: true,
        data: {
          superhero_id: Number(superheroId),
          address: address,
          name: name || 'Unnamed Hero',
          bio: bio || 'A superhero building the future of Web3',
          avatar_url: avatarUrl || generateEmojiAvatar(address),
          reputation: Number(reputation),
          skills: Array.isArray(skills) ? skills : [],
          specialities: Array.isArray(specialities) ? specialities : [],
          created_at: Number(createdAt) * 1000, // Convert to milliseconds
          flagged: Boolean(flagged),
          joinedDate: new Date(Number(createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          location: 'Blockchain Universe',
          currentProjects: Math.floor(Math.random() * 5) + 1,
          totalIdeas: 0,
          totalSales: 0,
          totalRevenue: 0,
          level: Math.floor(Number(reputation) / 100) + 1,
          achievements: ['Blockchain Pioneer', 'Web3 Builder', 'Superhero Identity'],
          followers: Math.floor(Math.random() * 500) + 100,
          following: Math.floor(Math.random() * 600) + 150,
          isOnline: Math.random() > 0.5,
          featured: false,
          rating: 3 + Math.random() * 2,
          totalRatings: Math.floor(Math.random() * 200) + 50
        }
      });

    } catch (error: any) {
      console.warn('❌ Blockchain check failed:', error);
      
      return c.json({
        success: false,
        error: { code: 'BLOCKCHAIN_ERROR', message: 'Failed to read superhero data from blockchain' },
        debug: {
          timestamp: new Date().toISOString(),
          error: error.message
        }
      }, 500);
    }
  } catch (error: any) {
    console.error('💥 Profile route error:', error);
    
    return c.json({
      success: false,
      error: { code: 'COMPLETE_FAILURE', message: error.message },
      debug: {
        timestamp: new Date().toISOString(),
        error: error.stack
      }
    }, 500);
  }
});

// POST /superheroes/upload-avatar - Upload avatar to IPFS
app.post('/upload-avatar', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return c.json({
        success: false,
        error: { code: 'NO_FILE', message: 'No avatar file provided' }
      }, 400);
    }

    // Check file size (max 5MB for avatar)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Avatar file size must be less than 5MB' }
      }, 400);
    }

    const upload = await ipfs.uploadFile(file, `avatar-${Date.now()}`);

    return c.json({
      success: true,
      data: {
        ipfsHash: upload.hash,
        ipfsUrl: upload.url,
        gatewayUrl: upload.gateway_url
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return c.json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /superheroes/upload-metadata - Upload superhero metadata to IPFS
app.post('/upload-metadata', async (c) => {
  try {
    const data = await c.req.json();
    
    const validatedData = createSuperheroSchema.parse(data);
    
    const upload = await ipfs.createSuperheroMetadata({
      name: validatedData.name,
      bio: validatedData.bio,
      skills: validatedData.skills,
      specialities: validatedData.specialities,
      avatarHash: data.avatarHash
    });

    return c.json({
      success: true,
      data: {
        metadataHash: upload.hash,
        url: upload.url,
        gatewayUrl: upload.gateway_url
      }
    });

  } catch (error) {
    console.error('Metadata upload error:', error);
    return c.json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: (error as Error).message }
    }, 500);
  }
});

export default app;
