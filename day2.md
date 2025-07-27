# Sui Blockchain Workshop Day 2 (27 July 2025)

## Workshop Overview

**Duration**: 1 Day (6 hours)  
**Target Audience**: Developers who completed Day 1  
**Prerequisites**: Day 1 completion, basic React/TypeScript knowledge  
**Network**: Sui Testnet

---

# 🚀 Module 3: Advanced Smart Contract Development (9:00 AM - 12:00 PM)

## 🎯 Learning Objectives

By the end of this module, you will:

- Learn advanced Sui and Move features
- Understand ownership, dynamic fields, and time-based logic
- Build a complete NFT minting system with metadata
- Apply gas optimization techniques

## 🧠 Key Topics

### Object-Centric Storage Model

Unlike traditional blockchains with global storage, Sui uses object-centric storage:

**Traditional Blockchain (Account-Based):**

```solidity
// Ethereum style - global mapping
mapping(address => uint256) public balances;
mapping(uint256 => TokenData) public tokens;
```

**Sui Object-Centric:**

```move
// Everything is an object with unique ID
public struct NFT has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String,
}
```

**Key Benefits:**

- **No Global State Conflicts**: Objects can be processed in parallel
- **Clear Ownership**: Each object has a specific owner
- **Type Safety**: Objects are strongly typed
- **Efficient Access**: Direct object access without global state lookups

### Shared Objects vs Owned Objects

Understanding object ownership is crucial for Sui development:

```move
// Shared object - anyone can access (requires consensus)
transfer::share_object(collection);

// Owned object - only owner can access (no consensus needed)
transfer::transfer(nft, recipient);

// Immutable object - nobody can modify (frozen forever)
transfer::freeze_object(metadata);
```

**When to Use Each:**

- **Shared**: Collections, marketplaces, multi-user systems
- **Owned**: Individual NFTs, tokens, user profiles
- **Immutable**: Metadata, configuration, constants

### Dynamic Fields: Unlimited Storage

Dynamic fields allow storing unlimited data without knowing field names at compile time:

```move
use sui::dynamic_field as df;

// Store any type with any key
public struct NFT has key, store {
    id: UID,
    name: String,
    description: String,
}

// Add dynamic field to store extra metadata
df::add(&mut nft.id, b"color", string::utf8(b"blue"));
df::add(&mut nft.id, b"rarity", 85u64);

// Access dynamic field
let color: &String = df::borrow(&nft.id, b"color");

// Modify dynamic field
let rarity_mut: &mut u64 = df::borrow_mut(&mut nft.id, b"rarity");

// Remove dynamic field
let color: String = df::remove(&mut nft.id, b"color");

// Check if field exists
let has_color: bool = df::exists_(&nft.id, b"color");
```

**Use Cases:**

- NFT attributes that vary by collection
- User profiles with different data fields
- Game items with varying properties
- Metadata that can be updated over time

### Clock Object: Time-Based Logic

Sui provides a singleton Clock object for time-based operations:

```move
use sui::clock::{Self, Clock};

public struct TimedCollection has key {
    id: UID,
    name: String,
    mint_start_time: u64,
    mint_end_time: u64,
    total_minted: u64,
    max_supply: u64,
}

public fun is_mint_active(
    collection: &TimedCollection,
    clock: &Clock
): bool {
    let current_time = clock::timestamp_ms(clock);
    current_time >= collection.mint_start_time &&
    current_time <= collection.mint_end_time &&
    collection.total_minted < collection.max_supply
}

public entry fun mint_nft(
    collection: &mut TimedCollection,
    name: vector<u8>,
    description: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(is_mint_active(collection, clock), 0);

    // Mint NFT logic here
    collection.total_minted = collection.total_minted + 1;
}
```

**Clock Object Properties:**

- Singleton object with ID `0x6`
- Read-only access to current timestamp
- Consensus-based time (not local machine time)
- Millisecond precision

**Common Time-Based Patterns:**

1. **Timed Minting**: Limited time mint windows
2. **Auctions**: Timed bidding periods
3. **Staking**: Lock periods and cooldowns
4. **Gaming**: Time-based mechanics

### Module Initializers: One-Time Setup

The `init` function runs exactly once when a module is published:

```move
// Automatic init function
fun init(ctx: &mut TxContext) {
    // Create admin capability
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, tx_context::sender(ctx));

    // Create shared collection
    let collection = Collection {
        id: object::new(ctx),
        name: string::utf8(b"My NFT Collection"),
        total_supply: 0,
        max_supply: 1000,
    };
    transfer::share_object(collection);
}

// One-Time Witness pattern for unique types
public struct MY_NFT has drop {}

fun init(witness: MY_NFT, ctx: &mut TxContext) {
    // Create unique display template
    let publisher = package::claim(witness, ctx);
    // ... setup display template
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}
```

### Entry Functions vs Public Functions

Understanding function visibility:

```move
// Entry function - can be called directly from transactions/CLI
public entry fun mint_nft(
    collection: &mut Collection,
    name: vector<u8>,
    description: vector<u8>,
    ctx: &mut TxContext
) {
    // Implementation
}

// Public function - can be called by other modules and returns values
public fun get_nft_info(nft: &NFT): (String, String, address) {
    (nft.name, nft.description, nft.creator)
}

// Internal function - only within this module
fun validate_nft_data(name: &vector<u8>): bool {
    vector::length(name) > 0
}
```

### Gas Optimization Techniques

**1. Efficient Data Structures:**

```move
// Instead of multiple separate fields
public struct BadNFT has key {
    id: UID,
    trait1: String,
    trait2: String,
    trait3: String,
    // ... many fields
}

// Use collections for similar data
public struct GoodNFT has key {
    id: UID,
    name: String,
    traits: VecMap<String, String>, // More flexible and gas-efficient
}
```

**2. Minimize Object Creation:**

```move
// Expensive - creates many objects
public entry fun bad_batch_mint(count: u64, ctx: &mut TxContext) {
    let mut i = 0;
    while (i < count) {
        let nft = create_nft(ctx);
        transfer::transfer(nft, tx_context::sender(ctx));
        i = i + 1;
    };
}

// Better - batch operations
public entry fun good_batch_mint(
    names: vector<vector<u8>>,
    ctx: &mut TxContext
) {
    let nfts = create_multiple_nfts(names, ctx);
    transfer_multiple_nfts(nfts, tx_context::sender(ctx));
}
```

## ✅ Exercise 1: Simple NFT Collection with Advanced Features (90 minutes)

### Step 1: Create Simple Advanced NFT Project

```bash
sui move new simple_nft_collection
cd simple_nft_collection
```

### Step 2: Configure Move.toml

```toml
[package]
name = "simple_nft_collection"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
simple_nft_collection = "0x0"
```

### Step 3: Create Simple NFT Contract

Create `sources/simple_art_nft.move`:

```move
module simple_nft_collection::simple_art_nft {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};
    use sui::dynamic_field as df;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::display;
    use sui::package;
    use std::string::{Self, String, utf8};

    // === Error Codes ===
    const ENotAuthorized: u64 = 1;
    const EMaxSupplyReached: u64 = 2;
    const EInsufficientPayment: u64 = 3;
    const EMintNotActive: u64 = 4;

    // === One-Time Witness ===
    public struct SIMPLE_ART_NFT has drop {}

    // === Core Structs ===

    /// Simple NFT with essential metadata
    public struct SimpleNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        creator: address,
        attributes: VecMap<String, String>,
    }

    /// Collection with time-based minting
    public struct Collection has key {
        id: UID,
        name: String,
        description: String,
        creator: address,
        total_supply: u64,
        max_supply: u64,
        mint_price: u64,
        mint_start_time: u64,
        mint_end_time: u64,
        is_active: bool,
    }

    /// Admin capability
    public struct AdminCap has key, store {
        id: UID,
        collection_id: ID,
    }

    // === Events ===

    public struct NFTMinted has copy, drop {
        nft_id: ID,
        name: String,
        recipient: address,
        collection_id: ID,
        edition_number: u64,
    }

    public struct CollectionCreated has copy, drop {
        collection_id: ID,
        name: String,
        creator: address,
        max_supply: u64,
    }

    // === Init Function ===

    fun init(witness: SIMPLE_ART_NFT, ctx: &mut TxContext) {
        // Create display template for wallets and marketplaces
        let keys = vector[
            utf8(b"name"),
            utf8(b"description"),
            utf8(b"image_url"),
            utf8(b"creator"),
            utf8(b"project_url"),
        ];

        let values = vector[
            utf8(b"{name}"),
            utf8(b"{description}"),
            utf8(b"{image_url}"),
            utf8(b"{creator}"),
            utf8(b"https://myproject.com"),
        ];

        let publisher = package::claim(witness, ctx);
        let mut display = display::new_with_fields<SimpleNFT>(&publisher, keys, values, ctx);
        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    // === Collection Management ===

    /// Create a new NFT collection
    public fun create_collection(
        name: vector<u8>,
        description: vector<u8>,
        max_supply: u64,
        mint_price: u64,
        mint_duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        let current_time = clock::timestamp_ms(clock);

        let collection = Collection {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            creator: tx_context::sender(ctx),
            total_supply: 0,
            max_supply,
            mint_price,
            mint_start_time: current_time,
            mint_end_time: current_time + mint_duration_ms,
            is_active: false,
        };

        let collection_id = object::uid_to_inner(&collection.id);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
            collection_id,
        };

        event::emit(CollectionCreated {
            collection_id,
            name: collection.name,
            creator: collection.creator,
            max_supply,
        });

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(collection);

        collection_id
    }

    /// Activate minting for the collection
    public fun activate_minting(
        collection: &mut Collection,
        admin_cap: &AdminCap,
        _ctx: &TxContext
    ) {
        assert!(admin_cap.collection_id == object::uid_to_inner(&collection.id), ENotAuthorized);
        collection.is_active = true;
    }

    // === NFT Minting ===

    /// Public mint function with time and payment checks
    public entry fun mint_nft(
        collection: &mut Collection,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check if minting is active
        assert!(collection.is_active, EMintNotActive);
        assert!(is_mint_active(collection, clock), EMintNotActive);

        // Check payment
        assert!(coin::value(&payment) >= collection.mint_price, EInsufficientPayment);

        // Check supply
        assert!(collection.total_supply < collection.max_supply, EMaxSupplyReached);

        // Transfer payment to creator
        transfer::public_transfer(payment, collection.creator);

        // Mint NFT
        let mut nft = SimpleNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            creator: tx_context::sender(ctx),
            attributes: vec_map::empty(),
        };

        let nft_id = object::uid_to_inner(&nft.id);
        collection.total_supply = collection.total_supply + 1;

        // Add collection reference as dynamic field
        df::add(&mut nft.id, b"collection_id", object::uid_to_inner(&collection.id));
        df::add(&mut nft.id, b"edition_number", collection.total_supply);

        event::emit(NFTMinted {
            nft_id,
            name: nft.name,
            recipient: tx_context::sender(ctx),
            collection_id: object::uid_to_inner(&collection.id),
            edition_number: collection.total_supply,
        });

        transfer::transfer(nft, tx_context::sender(ctx));
    }

    /// Admin mint function (free for creator)
    public fun admin_mint(
        collection: &mut Collection,
        admin_cap: &AdminCap,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(admin_cap.collection_id == object::uid_to_inner(&collection.id), ENotAuthorized);
        assert!(collection.total_supply < collection.max_supply, EMaxSupplyReached);

        let mut nft = SimpleNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            creator: collection.creator,
            attributes: vec_map::empty(),
        };

        let nft_id = object::uid_to_inner(&nft.id);
        collection.total_supply = collection.total_supply + 1;

        df::add(&mut nft.id, b"collection_id", object::uid_to_inner(&collection.id));
        df::add(&mut nft.id, b"edition_number", collection.total_supply);

        event::emit(NFTMinted {
            nft_id,
            name: nft.name,
            recipient,
            collection_id: object::uid_to_inner(&collection.id),
            edition_number: collection.total_supply,
        });

        transfer::transfer(nft, recipient);
    }

    // === NFT Utilities ===

    /// Add attribute to NFT (only creator can do this)
    public fun add_attribute(
        nft: &mut SimpleNFT,
        key: vector<u8>,
        value: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.creator, ENotAuthorized);
        vec_map::insert(&mut nft.attributes, string::utf8(key), string::utf8(value));
    }

    /// Add dynamic field to NFT
    public fun add_dynamic_field<T: store>(
        nft: &mut SimpleNFT,
        key: vector<u8>,
        value: T,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.creator, ENotAuthorized);
        df::add(&mut nft.id, key, value);
    }

    /// Get dynamic field from NFT
    public fun get_dynamic_field<T: store>(
        nft: &SimpleNFT,
        key: vector<u8>
    ): &T {
        df::borrow(&nft.id, key)
    }

    // === View Functions ===

    /// Check if minting is currently active
    public fun is_mint_active(collection: &Collection, clock: &Clock): bool {
        if (!collection.is_active) return false;

        let current_time = clock::timestamp_ms(clock);
        current_time >= collection.mint_start_time &&
        current_time <= collection.mint_end_time &&
        collection.total_supply < collection.max_supply
    }

    /// Get NFT information
    public fun get_nft_info(nft: &SimpleNFT): (String, String, String, address) {
        (nft.name, nft.description, nft.image_url, nft.creator)
    }

    /// Get collection information
    public fun get_collection_info(collection: &Collection): (String, String, address, u64, u64, u64, bool, u64, u64) {
        (
            collection.name,
            collection.description,
            collection.creator,
            collection.total_supply,
            collection.max_supply,
            collection.mint_price,
            collection.is_active,
            collection.mint_start_time,
            collection.mint_end_time
        )
    }

    /// Get NFT attributes
    public fun get_nft_attributes(nft: &SimpleNFT): &VecMap<String, String> {
        &nft.attributes
    }

    /// Get time remaining for mint
    public fun get_time_remaining(collection: &Collection, clock: &Clock): u64 {
        let current_time = clock::timestamp_ms(clock);
        if (current_time >= collection.mint_end_time) {
            0
        } else {
            collection.mint_end_time - current_time
        }
    }

    // === Test Functions ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SIMPLE_ART_NFT {}, ctx);
    }
}
```

### Step 4: Create Test Suite

Create `tests/simple_nft_test.move`:

```move
#[test_only]
module simple_nft_collection::simple_nft_test {
    use simple_nft_collection::simple_art_nft::{Self, Collection, AdminCap, SimpleNFT};
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    const ADMIN: address = @0xAD;
    const USER: address = @0xAB;

    #[test]
    fun test_complete_nft_flow() {
        let mut scenario = test_scenario::begin(ADMIN);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        clock::set_for_testing(&mut clock, 1000000);

        // Initialize
        {
            simple_art_nft::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Create collection
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            simple_art_nft::create_collection(
                b"Simple Art Collection",
                b"A collection of simple art NFTs",
                100, // max supply
                1000000000, // 1 SUI mint price
                7 * 24 * 60 * 60 * 1000, // 7 days duration
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        // Activate minting
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut collection = test_scenario::take_shared<Collection>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            simple_art_nft::activate_minting(&mut collection, &admin_cap, test_scenario::ctx(&mut scenario));

            // Verify minting is active
            assert!(simple_art_nft::is_mint_active(&collection, &clock), 0);

            test_scenario::return_shared(collection);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // User mints NFT
        test_scenario::next_tx(&mut scenario, USER);
        {
            let mut collection = test_scenario::take_shared<Collection>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1000000000, test_scenario::ctx(&mut scenario));

            simple_art_nft::mint_nft(
                &mut collection,
                b"My First NFT",
                b"This is my first NFT",
                b"https://example.com/nft1.png",
                payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(collection);
        };

        // Verify NFT creation
        test_scenario::next_tx(&mut scenario, USER);
        {
            let nft = test_scenario::take_from_sender<SimpleNFT>(&scenario);
            let (name, description, image_url, creator) = simple_art_nft::get_nft_info(&nft);

            assert!(name == std::string::utf8(b"My First NFT"), 0);
            assert!(creator == USER, 1);

            // Check dynamic fields
            let edition: &u64 = simple_art_nft::get_dynamic_field(&nft, b"edition_number");
            assert!(*edition == 1, 2);

            test_scenario::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_time_based_minting() {
        let mut scenario = test_scenario::begin(ADMIN);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        let start_time = 1000000;
        let duration = 24 * 60 * 60 * 1000; // 1 day

        clock::set_for_testing(&mut clock, start_time);

        // Setup
        {
            simple_art_nft::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            simple_art_nft::create_collection(
                b"Time Limited",
                b"24 hour mint window",
                10,
                0, // Free mint
                duration,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut collection = test_scenario::take_shared<Collection>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            simple_art_nft::activate_minting(&mut collection, &admin_cap, test_scenario::ctx(&mut scenario));
            assert!(simple_art_nft::is_mint_active(&collection, &clock), 0);

            test_scenario::return_shared(collection);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Fast forward past end time
        clock::set_for_testing(&mut clock, start_time + duration + 1000);

        test_scenario::next_tx(&mut scenario, USER);
        {
            let collection = test_scenario::take_shared<Collection>(&scenario);
            assert!(!simple_art_nft::is_mint_active(&collection, &clock), 0);
            test_scenario::return_shared(collection);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_nft_attributes() {
        let mut scenario = test_scenario::begin(ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // Setup and mint NFT
        {
            simple_art_nft::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            simple_art_nft::create_collection(
                b"Attribute Test",
                b"Testing attributes",
                10,
                0,
                365 * 24 * 60 * 60 * 1000,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut collection = test_scenario::take_shared<Collection>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            simple_art_nft::activate_minting(&mut collection, &admin_cap, test_scenario::ctx(&mut scenario));

            // Admin mint NFT to self
            simple_art_nft::admin_mint(
                &mut collection,
                &admin_cap,
                b"Attribute NFT",
                b"NFT for testing attributes",
                b"https://example.com/attr.png",
                ADMIN,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(collection);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Add attributes
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut nft = test_scenario::take_from_sender<SimpleNFT>(&scenario);

            simple_art_nft::add_attribute(&mut nft, b"Color", b"Blue", test_scenario::ctx(&mut scenario));
            simple_art_nft::add_attribute(&mut nft, b"Rarity", b"Rare", test_scenario::ctx(&mut scenario));
            simple_art_nft::add_dynamic_field(&mut nft, b"special_number", 42u64, test_scenario::ctx(&mut scenario));

            let attributes = simple_art_nft::get_nft_attributes(&nft);
            assert!(sui::vec_map::size(attributes) == 2, 0);

            let special_number: &u64 = simple_art_nft::get_dynamic_field(&nft, b"special_number");
            assert!(*special_number == 42, 1);

            test_scenario::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
```

### Step 5: Build and Test

```bash
# Build the project
sui move build

# Run all tests
sui move test

# Test specific function
sui move test test_complete_nft_flow
```

### Step 6: Deploy to Testnet

```bash
# Deploy the contract
sui client publish --gas-budget 50000000

# Note the important IDs:
# - Package ID
# - Collection ID (from create_collection transaction)
# - Admin Cap ID
```

### Step 7: CLI Interactions

```bash
# Create collection
sui client call \
  --package <PACKAGE_ID> \
  --module simple_art_nft \
  --function create_collection \
  --args "\"My Art Collection\"" "\"Simple NFT collection\"" 100 1000000000 604800000 <CLOCK_ID> \
  --gas-budget 15000000

# Activate minting
sui client call \
  --package <PACKAGE_ID> \
  --module simple_art_nft \
  --function activate_minting \
  --args <COLLECTION_ID> <ADMIN_CAP_ID> \
  --gas-budget 5000000

# Mint NFT (user pays)
sui client call \
  --package <PACKAGE_ID> \
  --module simple_art_nft \
  --function mint_nft \
  --args <COLLECTION_ID> "\"My NFT\"" "\"Beautiful art piece\"" "\"https://example.com/art.png\"" <SUI_COIN_ID> <CLOCK_ID> \
  --gas-budget 15000000
```

---

# 🌐 Module 4: Building a Simple dApp Frontend (1:30 PM - 4:30 PM)

## 🎯 Learning Objectives

By the end of this module, you will:

- Build a clean React frontend for NFT minting
- Handle wallet connections and transactions
- Display NFT collections and user galleries
- Implement proper error handling and user feedback

## 🧠 Key Topics

### TypeScript SDK Integration

```typescript
import { SuiClient, SuiClientProvider } from "@mysten/sui.js/client";
import {
  WalletProvider,
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/wallet-adapter-react";
import { TransactionBlock } from "@mysten/sui.js/transactions";

// Simple client setup
const suiClient = new SuiClient({
  url: "https://fullnode.testnet.sui.io:443",
});
```

### Basic Wallet Integration

```typescript
// Simple wallet connection hook
function useWallet() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  return {
    account,
    isConnected: !!account,
    signAndExecuteTransactionBlock,
  };
}
```

### Simple Transaction Building

```typescript
// Build mint transaction
function createMintTransaction(
  packageId: string,
  collectionId: string,
  name: string,
  description: string,
  imageUrl: string,
  paymentCoinId: string
): TransactionBlock {
  const txb = new TransactionBlock();

  txb.moveCall({
    target: `${packageId}::simple_art_nft::mint_nft`,
    arguments: [
      txb.object(collectionId),
      txb.pure(name),
      txb.pure(description),
      txb.pure(imageUrl),
      txb.object(paymentCoinId),
      txb.object("0x6"), // Clock
    ],
  });

  return txb;
}
```

## ✅ Exercise 2: Simple NFT Minting dApp (150 minutes)

### Step 1: Create React Project

```bash
# Create React app
bun create @mysten/dapp --template react-client-dapp
√ What is the name of your dApp? (this will be used as the directory name) · simple-nft-dapp

bun add tailwindcss @tailwindcss/vite react-hot-toast pinata
bun add -D @types/node
```

replace `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

replace `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["vite.config.mts"]
}
```

replace `vite.config.mts`

```mts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```
add `src/index.css`
```css
@import "tailwindcss";
```

add shadcn
```bash
bunx shadcn@latest add card button badge input select dialog
? You need to create a components.json file to add components. Proceed? » (Y/n) Y
```

### Step 2: Setup Constants

Replace `networkConfig.ts`

```ts
import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        // TODO: Update with your deployed contract address
        simpleArtNFT: "0x0",
        collectionId: "0x0",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        // replacce with your deployed contract address
        simpleArtNFT:
          "0x2f29e18b0894ca8bdad6cb069751d647590e221baf3a630a6760be7b4f6c697c",
        // replacce with your collection id
        collectionId:
          "0x6d22771bec18c7f73c1ace52867bb259fef00d00a413f31c45e3f4c1b4148e5c",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // TODO: Update with your deployed contract address
        simpleArtNFT: "0x0",
        collectionId: "0x0",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
```

Replace `main.tsx`

```ts
import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <Toaster />
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

Create Pinata Service on `src/services/pinata.ts`

```ts
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});
```

Setup `.env` you can get the key from https://docs.pinata.cloud/quickstart

```ts
VITE_PINATA_API_KEY = "";
VITE_PINATA_API_SECRET = "";
VITE_PINATA_JWT = "";
VITE_PINATA_GATEWAY = "";
```

### Step 3: Create Sui Hooks

create `src/hooks/use-create-mint-transaction.ts`

```ts
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { pinata } from "@/service/pinata";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { formatSUI } from "@/lib/utils";

export type CreateMintTransactionDto = {
  name: string;
  description: string;
  imageFile: File | null;
  collectionId: string;
};

export function useCreateMintTransaction() {
  const account = useCurrentAccount();
  const simpleArtNFT = useNetworkVariable("simpleArtNFT");
  const suiClient = useSuiClient();
  const txQuery = useSignAndExecuteTransaction();
  const coinQuery = useSuiClientQuery(
    "getCoins",
    {
      owner: account?.address!,
      coinType: "0x2::sui::SUI",
    },
    { enabled: account !== null }
  );

  const query = useMutation({
    onError: (error) => {
      toast.error((error as Error).message, { id: "mint-nft" });
    },
    mutationKey: ["createMintTransaction", coinQuery.data?.data, account],
    mutationFn: async ([dto, requiredAmount, onSucces]: [
      dto: CreateMintTransactionDto,
      requiredAmount: number,
      onSucces: () => unknown
    ]) => {
      if (!account) return;
      if (!dto.imageFile) return;

      const suitableCoin = coinQuery.data?.data.find(
        (x) => +x.balance > requiredAmount
      );
      if (!suitableCoin) {
        throw new Error(
          `Insufficient SUI balance. Need ${formatSUI(requiredAmount)} SUI`
        );
      }

      toast.loading("Uploading Image...", { id: "mint-nft" });
      const response = await pinata.upload.public.file(dto.imageFile);
      const link = `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${
        response.cid
      }`;

      const tx = new Transaction();

      const [mintCoin] = tx.splitCoins(tx.gas, [requiredAmount]);

      tx.moveCall({
        target: `${simpleArtNFT}::simple_art_nft::mint_nft`,
        arguments: [
          tx.object(dto.collectionId),
          tx.pure("string", dto.name),
          tx.pure("string", dto.description),
          tx.pure("string", link),
          mintCoin,
          tx.object("0x6"),
        ],
      });

      toast.loading("Sending Transaction...", { id: "mint-nft" });
      const { digest } = await txQuery.mutateAsync({ transaction: tx });
      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
        },
      });
      onSucces();
      console.log(effects?.created?.[0].reference.objectId);
      toast.success("Mint Success", { id: "mint-nft" });
    },
  });

  return query;
}
```

### Step 4: Create Main App Component

Update `src/App.tsx`:

```ts
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider } from "@mysten/sui.js/client";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-wallet-standard";
import NFTMintingApp from "./components/NFTMintingApp";
import "./index.css";

const suiClient = new SuiClient({
  url: "https://fullnode.testnet.sui.io:443",
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider client={suiClient}>
        <WalletStandardAdapterProvider>
          <WalletProvider>
            <NFTMintingApp />
          </WalletProvider>
        </WalletStandardAdapterProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
```

create `src/hooks/use-get-collection-info.ts`

```ts
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useMemo } from "react";

export type CollectionInfo = {
  name: string;
  description: string;
  creator: string;
  totalSupply: number;
  maxSupply: number;
  mintPrice: number;
  isActive: boolean;
  mintStartTime: number;
  mintEndTime: number;
};

export function useGetCollectionInfo(collectionId: string) {
  const { data, ...rest } = useSuiClientQuery("getObject", {
    id: collectionId,
    options: { showContent: true, showOwner: true },
  });

  const parsed = useMemo(() => {
    if (data?.data?.content?.dataType != "moveObject") return null;
    const fields = data.data.content.fields;

    return {
      name: Reflect.get(fields, "name"),
      description: Reflect.get(fields, "description"),
      creator: Reflect.get(fields, "creator"),
      totalSupply: parseInt(Reflect.get(fields, "total_supply")),
      maxSupply: parseInt(Reflect.get(fields, "max_supply")),
      mintPrice: parseInt(Reflect.get(fields, "mint_price")),
      isActive: Reflect.get(fields, "is_active"),
      mintStartTime: parseInt(Reflect.get(fields, "mint_start_time")),
      mintEndTime: parseInt(Reflect.get(fields, "mint_end_time")),
    } as CollectionInfo;
  }, [data?.data]);

  return [parsed, rest] as const;
}
```

create `src/hooks/use-get-user-nft.ts`

```ts
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { useNetworkVariable } from "../networkConfig";

export function useGetUserNFT() {
  const account = useCurrentAccount();
  const simpleArtNFT = useNetworkVariable("simpleArtNFT");
  const { data, ...rest } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        StructType: `${simpleArtNFT}::simple_art_nft::SimpleNFT`,
      },
      options: { showContent: true, showOwner: true },
    },
    { enabled: account !== null }
  );

  const parsed = useMemo(() => {
    return data?.data;
  }, [data?.data]);

  return [parsed, rest] as const;
}
```

### Step 5: Create Main NFT App Component

Create `src/components/mint-section.tsx`:

```tsx
import {
  CreateMintTransactionDto,
  useCreateMintTransaction,
} from "@/hooks/use-create-mint-transaction";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CollectionInfo } from "@/hooks/use-get-collection-info";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { formatSUI } from "@/lib/utils";

function MintForm({
  collectionId,
  mintPrice,
}: {
  collectionId: string;
  mintPrice: number;
}) {
  const { isPending: isLoading, mutate } = useCreateMintTransaction();
  const [formData, setFormData] = useState<CreateMintTransactionDto>({
    name: "",
    description: "",
    imageFile: null as never,
    collectionId: collectionId,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateMintTransactionDto, string>>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateMintTransactionDto, string>> =
      {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.imageFile) {
      newErrors.imageFile = "Image file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "File size must be less than 10MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.imageFile) {
        setErrors((prev) => ({ ...prev, imageFile: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    mutate([
      formData,
      mintPrice,
      () => {
        // Reset form on success
        setFormData({
          name: "",
          description: "",
          imageFile: null,
          collectionId: collectionId,
        });
        setImagePreview(null);
      },
    ]);
  };

  const handleInputChange = (
    field: keyof CreateMintTransactionDto,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#bac2de] mb-2"
          >
            NFT Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Cosmic Cat Supreme"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-[#313244] border-[#45475a] text-[#cdd6f4] placeholder:text-[#6c7086] ${
              errors.name ? "border-[#f38ba8]" : "focus:border-[#cba6f7]"
            }`}
          />
          {errors.name && (
            <p className="text-[#f38ba8] text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[#bac2de] mb-2"
          >
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Describe your unique cat's personality and traits..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 bg-[#313244] border rounded-md text-[#cdd6f4] placeholder:text-[#6c7086] resize-none focus:outline-none focus:ring-2 focus:ring-[#cba6f7]/50 ${
              errors.description
                ? "border-[#f38ba8]"
                : "border-[#45475a] focus:border-[#cba6f7]"
            }`}
          />
          {errors.description && (
            <p className="text-[#f38ba8] text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="bg-[#45475a]/30 rounded-lg p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#a6adc8]">Total Cost</span>
            <span className="text-xl font-bold text-[#f9e2af]">
              {formatSUI(mintPrice)} SUI
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6c7086]">+ Gas fees</span>
            <span className="text-[#94e2d5]">~0.005 SUI</span>
          </div>
        </div>

        <Button
          id="mint-button"
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] hover:from-[#b4a0e8] hover:to-[#f27a9a] text-[#11111b] font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#11111b]/30 border-t-[#11111b] rounded-full animate-spin"></div>
              Minting...
            </div>
          ) : (
            `Mint NFT for ${formatSUI(mintPrice)} SUI`
          )}
        </Button>
      </div>

      <div>
        <label
          htmlFor="imageFile"
          className="block text-sm font-medium text-[#bac2de] mb-2"
        >
          NFT Image *
        </label>
        <div className="space-y-3 aspect-[9/16] flex max-h-96">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border border-[#45475a]"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, imageFile: null }));
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-[#f38ba8] hover:bg-[#f27a9a] text-[#11111b] rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                errors.imageFile
                  ? "border-[#f38ba8]"
                  : "border-[#45475a] hover:border-[#cba6f7]"
              }`}
            >
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-[#45475a] rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <p className="text-[#cdd6f4] font-medium">
                    {formData.imageFile
                      ? formData.imageFile.name
                      : "Click to upload image"}
                  </p>
                  <p className="text-[#6c7086] text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {errors.imageFile && (
          <p className="text-[#f38ba8] text-sm mt-1">{errors.imageFile}</p>
        )}
      </div>
    </form>
  );
}

export function MintSection({
  collectionInfo,
  id,
}: {
  collectionInfo: CollectionInfo;
  id: string;
}) {
  return (
    <Dialog modal>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] hover:from-[#b4a0e8] hover:to-[#f27a9a] text-[#11111b] font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Mint
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e1e2e] min-w-max p-0">
        {collectionInfo.isActive && (
          <div className="bg-gradient-to-r from-[#cba6f7]/10 to-[#f38ba8]/10 border border-[#cba6f7]/20 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-[#cba6f7] mb-2">
                  Mint Your NFT
                </h3>
                <p className="text-[#bac2de] mb-4">
                  Create your unique NFT with custom traits and personality
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#a6adc8]">Minting Progress</span>
                    <span className="text-[#cba6f7]">
                      {collectionInfo.totalSupply.toLocaleString()}/
                      {collectionInfo.maxSupply.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#45475a] rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (collectionInfo.totalSupply /
                            collectionInfo.maxSupply) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[#6c7086] text-sm mt-1">
                    {(
                      ((collectionInfo.maxSupply - collectionInfo.totalSupply) /
                        collectionInfo.maxSupply) *
                      100
                    ).toFixed(1)}
                    % remaining
                  </p>
                </div>
                <div className="bg-[#313244] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#a6adc8]">Mint Price</span>
                    <span className="text-2xl font-bold text-[#f9e2af]">
                      {formatSUI(collectionInfo.mintPrice)} SUI
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6c7086]">Gas Fee (estimated)</span>
                    <span className="text-[#94e2d5]">~0.005 SUI</span>
                  </div>
                </div>
              </div>

              <MintForm
                collectionId={id}
                mintPrice={collectionInfo.mintPrice}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

Create `src/components/nft-grid.tsx`

```tsx
import { useGetUserNFT } from "@/hooks/use-get-user-nft";
import { Card, CardContent } from "./ui/card";
import { Eye, Heart } from "lucide-react";

export function NFTGrid() {
  const [data] = useGetUserNFT();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data &&
          data.map((nft, index) => {
            const content = nft.data?.content;
            // @ts-expect-error there is
            const fields = content?.fields;
            return (
              <Card
                key={nft.data?.objectId || index}
                className="bg-[#313244] border-[#45475a] hover:border-[#cba6f7] transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={fields?.image_url || "/placeholder.png"}
                      alt={fields?.name || "NFT"}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#cdd6f4] mb-2">
                      {fields?.name || "Unnamed NFT"}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#f38ba8]">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">
                          {Math.random().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {data?.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-[#6c7086] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#bac2de] mb-2">
            No NFTs found
          </h3>
          <p className="text-[#a6adc8]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </>
  );
}
```

Add some utils function in `lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeRemaining(endTime: number): string {
  const now = Date.now();
  const remaining = endTime - now;

  if (remaining <= 0) return "Ended";

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Less than 1h remaining";
}

export function formatSUI(amount: number): string {
  return (amount / 1_000_000_000).toFixed(2);
}
```

replace `src/App.tsx`

```tsx
import { ConnectButton } from "@mysten/dapp-kit";
import { useGetCollectionInfo } from "./hooks/use-get-collection-info";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Eye } from "lucide-react";
import { useNetworkVariable } from "./networkConfig";
import { MintSection } from "./components/mint-section";
import { NFTGrid } from "./components/nft-grid";
import { formatSUI } from "./lib/utils";

export function App() {
  const collectionID = useNetworkVariable("collectionId");
  const [collectionInfo] = useGetCollectionInfo(collectionID);

  if (!collectionInfo) return <div>NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4]">
      <div className="bg-[#181825] border-b border-[#313244]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#cba6f7] to-[#f38ba8] flex justify-center">
              <span className="text-2xl font-bold text-[#11111b]"></span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] bg-clip-text text-transparent">
                  {collectionInfo.name}
                </h1>
                {collectionInfo.isActive && (
                  <Badge className="bg-[#a6e3a1] text-[#11111b] animate-pulse">
                    Live Mint
                  </Badge>
                )}
              </div>
              <p className="text-[#bac2de] mb-2">
                Created by{" "}
                <span className="text-[#89b4fa] font-semibold">
                  {collectionInfo.creator}
                </span>
              </p>
              <p className="text-[#bac2de] mb-4 max-w-2xl">
                {collectionInfo.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#a6e3a1]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Floor</div>
                    <div className="font-semibold">1.2 SUI</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-[#89b4fa]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Owners</div>
                    <div className="font-semibold">3,247</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-[#f9e2af]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Volume</div>
                    <div className="font-semibold">1,234 SUI</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <Eye className="w-4 h-4 text-[#fab387]" />
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Supply</div>
                    <div className="font-semibold">
                      {collectionInfo.totalSupply.toLocaleString()}/
                      {collectionInfo.maxSupply.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <span className="w-4 h-4 text-[#f38ba8]">💎</span>
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Mint Price</div>
                    <div className="font-semibold">
                      {formatSUI(collectionInfo.mintPrice)} SUI
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#313244] px-3 py-2 rounded-lg">
                  <span className="w-4 h-4 text-[#94e2d5]">⏰</span>
                  <div className="text-sm">
                    <div className="text-[#6c7086]">Status</div>
                    <div className="font-semibold text-[#a6e3a1]">
                      {collectionInfo.isActive ? "Minting" : "Sold Out"}
                    </div>
                  </div>
                </div>
              </div>
              <MintSection id={collectionID} collectionInfo={collectionInfo} />
            </div>
            <div className="self-end">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto px-4 py-6">
        <NFTGrid />
      </div>
    </div>
  );
}

export default App;
```

### Step 6: Run the dApp

```bash
bun run dev
```

## 🎯 Workshop Wrap-up & Next Steps (30 minutes)

### What You've Accomplished

**Day 1 + Day 2 Complete Learning:**

- ✅ Sui blockchain fundamentals and object-centric model
- ✅ Move language from basics to advanced features
- ✅ Smart contracts with dynamic fields and time-based logic
- ✅ Professional React dApp development
- ✅ Wallet integration and transaction handling
- ✅ Testing and deployment workflows

### Key Features Implemented

**Smart Contract:**

- Time-based minting with start/end times
- Dynamic fields for extensible metadata
- Admin controls and public minting
- Event emission for off-chain tracking
- Gas-optimized data structures

**Frontend dApp:**

- Clean wallet connection interface
- Real-time collection information display
- NFT minting form with validation
- User NFT gallery with refresh
- Transaction status feedback
- Responsive design

### Real-World Applications

Your skills now enable building:

- **NFT Projects**: Collections with time drops, utility features
- **Gaming dApps**: Items, achievements, leaderboards
- **DeFi Tools**: Yield farming, staking platforms
- **Social Platforms**: Profile systems, reputation tokens
- **Marketplace**: Trading platforms with royalties

### Next Learning Steps

**Week 1-2: Practice & Polish**

- Add more features to your NFT dApp (marketplace, trading)
- Experiment with different dynamic field use cases
- Implement batch minting functionality
- Add more sophisticated time-based mechanics

**Month 1: Advanced Patterns**

- Build a simple DEX or AMM
- Create governance token systems
- Implement cross-contract interactions
- Explore formal verification with Move Prover

**Month 2-3: Production Ready**

- Deploy to Sui Mainnet
- Implement proper error handling and monitoring
- Add analytics and user tracking
- Build community and user base

### Career Readiness

**You're now ready for:**

- Junior Blockchain Developer roles
- Contributing to open-source Sui projects
- Building your own DeFi/NFT projects
- Participating in hackathons and competitions

### Resources for Continued Learning

- [Sui Documentation](https://docs.sui.io)
- [Move Language Book](https://move-book.com)
- [Sui GitHub](https://github.com/MystenLabs/sui)
- [Sui Discord Community](https://discord.gg/sui)
- [Sui Developer Portal](https://docs.sui.io/guides/developer)

## 🎉 Congratulations!

You've successfully completed a comprehensive 2-day journey from Sui beginner to capable blockchain developer. You now have the knowledge and practical experience to build real-world dApps on Sui blockchain.

**Remember:** The best way to solidify your learning is to keep building. Start with small projects, gradually increase complexity, and don't hesitate to experiment with new ideas.

**Keep Building! Keep Learning! 🚀**

---

**Workshop Complete**  
_From Zero to Sui Developer in 2 Days_  
_Ready to Build on the Future of Blockchain_ ✨
