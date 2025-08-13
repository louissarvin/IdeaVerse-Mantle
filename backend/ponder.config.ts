import { createConfig } from "@ponder/core";
import { http } from "viem";

import SuperheroABI from "./src/abi/SUPERHERO.json";
import IdeaRegistryABI from "./src/abi/IDEA_REGISTRY.json";
import TeamCoreABI from "./src/abi/TEAM_CORE.json";
import MarketplaceABI from "./src/abi/MARKETPLACE.json";
import USDCABI from "./src/abi/USDC.json";

export default createConfig({
  networks: {
    mantleSepolia: {
      chainId: 5003,
      transport: http(process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz"),
    },
  },
  contracts: {
    SuperheroNFT: {
      network: "mantleSepolia",
      address: "0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84",
      abi: SuperheroABI,
      startBlock: 26600721,
    },
    IdeaRegistry: {
      network: "mantleSepolia",
      address: "0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF",
      abi: IdeaRegistryABI,
      startBlock: 26600723,
    },
    TeamCore: {
      network: "mantleSepolia",
      address: "0xE7edb8902A71aB6709a99d34695edaE612afEB11",
      abi: TeamCoreABI,
      startBlock: 26600725,
    },
    OptimizedMarketplace: {
      network: "mantleSepolia",
      address: "0x900bB95Ad371178EF48759E0305BECF649ecE553",
      abi: MarketplaceABI,
      startBlock: 26600727,
    },
    MockUSDC: {
      network: "mantleSepolia",
      address: "0xed852d3Ef6a5B57005acDf1054d15af1CF09489c",
      abi: USDCABI,
      startBlock: 26600719,
    },
  },
  database: {
    kind: "sqlite",
    directory: "./db",
  },
});