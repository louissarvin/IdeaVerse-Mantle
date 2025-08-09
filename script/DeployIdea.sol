// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SuperheroNFT} from "../src/SuperheroNFT.sol";
import {IdeaRegistry} from "../src/IdeaRegistry.sol";
import {TeamCore} from "../src/TeamCore.sol";
import {MarketPlace} from "../src/MarketPlace.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployLiskSepolia is Script {
    function run() public returns (address[] memory) {
        console.log("Deploying to Mantle Sepolia Testnet");
        console.log("");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Network: Mantle Sepolia Testnet (Chain ID : 5003)");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy MockUSDC
        console.log("Step 1: Deploying MockUSDC...");
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        
        // Step 2: Deploy SuperheroNFT
        console.log("");
        console.log("Step 2: Deploying SuperheroNFT...");
        SuperheroNFT superheroNFT = new SuperheroNFT();
        console.log("SuperheroNFT deployed at:", address(superheroNFT));
        
        // Step 3: Deploy IdeaRegistry
        console.log("");
        console.log("Step 3: Deploying IdeaRegistry...");
        IdeaRegistry ideaRegistry = new IdeaRegistry(address(superheroNFT));
        console.log("IdeaRegistry deployed at:", address(ideaRegistry));
        
        // Step 4: Deploy TeamCore
        console.log("");
        console.log("Step 5: Deploying TeamCore...");
        TeamCore teamCore = new TeamCore(address(superheroNFT), address(usdc));
        console.log("TeamCore deployed at:", address(teamCore));
        
        // Step 5: Deploy MarketPlace
        console.log("");
        console.log("Step 7: Deploying OptimizedIdeaMarketplace...");
        OptimizedIdeaMarketplace marketplace = new OptimizedIdeaMarketplace(
            address(superheroNFT),
            address(ideaRegistry),
            address(usdc),
            deployer  // Fee recipient
        );
        console.log("MarketPlace deployed at:", address(marketplace));
        
        // Step 8: Setup configuration
        console.log("");
        console.log("Step 8: Setting up configuration...");
        
        // Authorize marketplace contracts
        ideaRegistry.authorizeMarketplace(address(marketplace));
        ideaNFT.setMarketplaceAuth(address(marketplace), true);
        console.log("Authorized marketplace contracts");
        
        // Mint test USDC tokens to deployer
        usdc.mint(deployer, 10000 * 10**6);
        console.log("Minted 10,000 USDC to deployer for testing");
        
        vm.stopBroadcast();
        
        // Step 9: Display results
        console.log("");
        console.log("=== DEPLOYMENT SUCCESSFUL ===");
        console.log("MockUSDC:                 ", address(usdc));
        console.log("SuperheroNFT:             ", address(superheroNFT));
        console.log("IdeaRegistry:             ", address(ideaRegistry));
        console.log("TeamCore:                 ", address(teamCore));
        console.log("MarketPlace               ", address(marketplace));
        console.log("");
        console.log("=== MANTLE SEPOLIA BLOCK EXPLORER ===");
        console.log("View contracts at: https://rpc.sepolia.mantle.xyz");
        
        address[] memory addresses = new address[](5);
        addresses[0] = address(usdc);
        addresses[1] = address(superheroNFT);
        addresses[2] = address(ideaRegistry);
        addresses[3] = address(teamCore);
        addresses[4] = address(marketplace);
        
        return addresses;
    }
}