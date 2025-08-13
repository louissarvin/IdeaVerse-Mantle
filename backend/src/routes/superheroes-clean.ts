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
  
  // Use address to deterministically select an emoji avatar
  const hash = parseInt(address.slice(-8), 16);
  return avatars[hash % avatars.length];
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
      
      // Helper function to decode hex arrays
      const decodeHexArray = (hexString: string): string[] => {
        if (!hexString || hexString === '0x') return [];
        try {
          // Remove 0x prefix and decode
          const hex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
          const bytes = Buffer.from(hex, 'hex');
          const decoded = bytes.toString('utf8').replace(/\0/g, '');
          return decoded ? decoded.split(',').map(s => s.trim()).filter(s => s) : [];
        } catch (e) {
          console.warn('Failed to decode hex array:', e);
          return [];
        }
      };

      // Decode skills and specialities
      const decodedSkills = Array.isArray(superheroData.skills) ? 
        superheroData.skills : 
        decodeHexArray(superheroData.skills || '');
      
      const decodedSpecialities = Array.isArray(superheroData.specialities) ? 
        superheroData.specialities : 
        decodeHexArray(superheroData.specialities || '');

      console.log('🎯 Decoded skills:', decodedSkills);
      console.log('⚡ Decoded specialities:', decodedSpecialities);

      return c.json({
        success: true,
        data: {
          superhero_id: superheroData.superheroId || superheroData.id,
          address: address,
          name: superheroData.name || 'Unnamed Hero',
          bio: superheroData.bio || 'A superhero building the future of Web3',
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
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // SuperheroNFT contract details for Mantle Sepolia
    const superheroContract = new ethers.Contract(
      '0x4eB7F648e0be63C8AA80E8c88dCDEcC8fB40CD9a',
      [
        'function hasSuperheroProfile(address user) external view returns (bool)',
        'function getSuperheroProfile(address user) external view returns (uint256 superheroId, string memory name, string memory bio, uint256 reputation, uint256 createdAt)',
        'function getSkills(address user) external view returns (string[] memory)',
        'function getSpecialities(address user) external view returns (string[] memory)',
        'function isFlagged(address user) external view returns (bool)'
      ],
      provider
    );

    try {
      const hasProfile = await superheroContract.hasSuperheroProfile(address);
      if (!hasProfile) {
        return c.json({
          success: false,
          error: { code: 'NO_SUPERHERO_PROFILE', message: 'This address does not have a superhero profile yet' }
        }, 404);
      }

      console.log(`✅ Found superhero profile for ${address}, fetching details...`);
      
      // Get basic profile info
      const [superheroId, name, bio, reputation, createdAt] = await superheroContract.getSuperheroProfile(address);
      
      // Get skills and specialities
      const skills = await superheroContract.getSkills(address);
      const specialities = await superheroContract.getSpecialities(address);
      const flagged = await superheroContract.isFlagged(address);
      
      console.log(`📊 Blockchain Profile - Name: ${name}, Skills: ${skills}, Specialities: ${specialities}`);

      return c.json({
        success: true,
        data: {
          superhero_id: Number(superheroId),
          address: address,
          name: name || 'Unnamed Hero',
          bio: bio || 'A superhero building the future of Web3',
          avatar_url: generateEmojiAvatar(address),
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

export default app;
