import { ponder } from "@/generated";

// Handle superhero creation
ponder.on("SuperheroNFT:CreateSuperhero", async ({ event, context }) => {
  const { Superhero, Transfer, EventLog } = context.db;

  try {
    // Read the full superhero profile from contract storage to get skills and specialities
    const superheroProfile = await context.client.readContract({
      abi: context.contracts.SuperheroNFT.abi,
      address: context.contracts.SuperheroNFT.address,
      functionName: "getSuperheroProfile",
      args: [event.args.addr],
    });

    // Create superhero record with complete data from contract
    await Superhero.create({
      id: event.args.addr,
      data: {
        superheroId: event.args.id,
        name: event.args.name,
        bio: event.args.bio,
        avatarUrl: event.args.uri,
        reputation: superheroProfile.reputation || 0n,
        skills: superheroProfile.skills || [], // Now gets actual skills from contract
        specialities: superheroProfile.specialities || [], // Now gets actual specialities from contract
        flagged: superheroProfile.flagged || false,
        createdAt: Number(event.block.timestamp),
        transactionHash: event.transaction.hash,
        blockNumber: event.block.number,
      },
    });

    // Log the event with complete data
    await EventLog.create({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      data: {
        contractAddress: event.log.address,
        eventName: "CreateSuperhero",
        eventData: {
          addr: event.args.addr,
          id: event.args.id.toString(),
          name: event.args.name,
          bio: event.args.bio,
          uri: event.args.uri,
          skills: superheroProfile.skills,
          specialities: superheroProfile.specialities,
        },
        transactionHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: Number(event.block.timestamp),
      },
    });
  } catch (error) {
    console.error("Error reading superhero profile from contract:", error);
    
    // Fallback to original behavior if contract read fails
    await Superhero.create({
      id: event.args.addr,
      data: {
        superheroId: event.args.id,
        name: event.args.name,
        bio: event.args.bio,
        avatarUrl: event.args.uri,
        reputation: 0n,
        skills: [], // Empty as fallback
        specialities: [], // Empty as fallback
        flagged: false,
        createdAt: Number(event.block.timestamp),
        transactionHash: event.transaction.hash,
        blockNumber: event.block.number,
      },
    });

    // Log the event with basic data
    await EventLog.create({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      data: {
        contractAddress: event.log.address,
        eventName: "CreateSuperhero",
        eventData: {
          addr: event.args.addr,
          id: event.args.id.toString(),
          name: event.args.name,
          bio: event.args.bio,
          uri: event.args.uri,
        },
        transactionHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: Number(event.block.timestamp),
      },
    });
  }
});

// Handle NFT transfers
ponder.on("SuperheroNFT:Transfer", async ({ event, context }) => {
  const { Transfer } = context.db;

  // Determine transfer type
  let transferType = "transfer";
  if (event.args.from === "0x0000000000000000000000000000000000000000") {
    transferType = "mint";
  } else if (event.args.to === "0x0000000000000000000000000000000000000000") {
    transferType = "burn";
  }

  await Transfer.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      tokenId: event.args.tokenId,
      from: event.args.from,
      to: event.args.to,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
      transferType,
    },
  });
});

// Handle role grants (when someone becomes a superhero)
ponder.on("SuperheroNFT:RoleGranted", async ({ event, context }) => {
  const { EventLog } = context.db;

  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "RoleGranted",
      eventData: {
        role: event.args.role,
        account: event.args.account,
        sender: event.args.sender,
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle role revokes (if someone loses superhero status)
ponder.on("SuperheroNFT:RoleRevoked", async ({ event, context }) => {
  const { EventLog } = context.db;

  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "RoleRevoked",
      eventData: {
        role: event.args.role,
        account: event.args.account,
        sender: event.args.sender,
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});