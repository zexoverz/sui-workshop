
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
import { SuiClient, SuiClientProvider } from '@mysten/sui.js/client';
import { WalletProvider, useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/wallet-adapter-react';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Simple client setup
const suiClient = new SuiClient({
  url: 'https://fullnode.testnet.sui.io:443',
});
```

### Basic Wallet Integration

```typescript
// Simple wallet connection hook
function useWallet() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  
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
      txb.object('0x6'), // Clock
    ],
  });
  
  return txb;
}
```

## ✅ Exercise 2: Simple NFT Minting dApp (150 minutes)

### Step 1: Create React Project

```bash
# Create React app
npx create-react-app simple-nft-dapp --template typescript
cd simple-nft-dapp

# Install dependencies
npm install @mysten/sui.js @mysten/wallet-adapter-react @mysten/wallet-adapter-wallet-standard @tanstack/react-query
npm install lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Setup Constants

Create `src/constants.ts`:

```typescript
export const CONTRACT_CONSTANTS = {
  PACKAGE_ID: '0x_YOUR_PACKAGE_ID_HERE',
  COLLECTION_ID: '0x_YOUR_COLLECTION_ID_HERE',
  CLOCK_ID: '0x6',
  MODULE_NAME: 'simple_art_nft',
} as const;

export const NETWORK = 'testnet';

export interface NFTData {
  name: string;
  description: string;
  image_url: string;
  creator: string;
}

export interface CollectionData {
  name: string;
  description: string;
  creator: string;
  total_supply: number;
  max_supply: number;
  mint_price: number;
  is_active: boolean;
  mint_start_time: number;
  mint_end_time: number;
}
```

### Step 3: Create Sui Service

Create `src/services/suiService.ts`:

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONTRACT_CONSTANTS, NFTData, CollectionData } from '../constants';

export class SuiService {
  constructor(private client: SuiClient) {}

  async getCollectionInfo(collectionId: string): Promise<CollectionData | null> {
    try {
      const response = await this.client.getObject({
        id: collectionId,
        options: { showContent: true },
      });

      if (response.data?.content && 'fields' in response.data.content) {
        const fields = response.data.content.fields as any;
        return {
          name: fields.name,
          description: fields.description,
          creator: fields.creator,
          total_supply: parseInt(fields.total_supply),
          max_supply: parseInt(fields.max_supply),
          mint_price: parseInt(fields.mint_price),
          is_active: fields.is_active,
          mint_start_time: parseInt(fields.mint_start_time),
          mint_end_time: parseInt(fields.mint_end_time),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching collection:', error);
      return null;
    }
  }

  async getUserNFTs(address: string): Promise<any[]> {
    try {
      const response = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${CONTRACT_CONSTANTS.PACKAGE_ID}::simple_art_nft::SimpleNFT`,
        },
        options: {
          showContent: true,
          showDisplay: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  async getUserCoins(address: string): Promise<any[]> {
    try {
      const response = await this.client.getCoins({
        owner: address,
        coinType: '0x2::sui::SUI',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coins:', error);
      return [];
    }
  }

  createMintTransaction(
    name: string,
    description: string,
    imageUrl: string,
    paymentCoinId: string
  ): TransactionBlock {
    const txb = new TransactionBlock();
    
    txb.moveCall({
      target: `${CONTRACT_CONSTANTS.PACKAGE_ID}::${CONTRACT_CONSTANTS.MODULE_NAME}::mint_nft`,
      arguments: [
        txb.object(CONTRACT_CONSTANTS.COLLECTION_ID),
        txb.pure(name),
        txb.pure(description),
        txb.pure(imageUrl),
        txb.object(paymentCoinId),
        txb.object(CONTRACT_CONSTANTS.CLOCK_ID),
      ],
    });

    return txb;
  }

  formatSUI(amount: number): string {
    return (amount / 1_000_000_000).toFixed(2);
  }

  formatTimeRemaining(endTime: number): string {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Less than 1h remaining';
  }
}
```

### Step 4: Create Main App Component

Update `src/App.tsx`:

```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider } from '@mysten/sui.js/client';
import { WalletProvider } from '@mysten/wallet-adapter-react';
import { WalletStandardAdapterProvider } from '@mysten/wallet-adapter-wallet-standard';
import NFTMintingApp from './components/NFTMintingApp';
import './index.css';

const suiClient = new SuiClient({
  url: 'https://fullnode.testnet.sui.io:443',
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

### Step 5: Create Main NFT App Component

Create `src/components/NFTMintingApp.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/wallet-adapter-react';
import { useSuiClient } from '@mysten/sui.js/client';
import WalletConnection from './WalletConnection';
import CollectionInfo from './CollectionInfo';
import MintingForm from './MintingForm';
import NFTGallery from './NFTGallery';
import { SuiService } from '../services/suiService';
import { CONTRACT_CONSTANTS, CollectionData } from '../constants';

const NFTMintingApp: React.FC = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  
  const [suiService] = useState(() => new SuiService(client));
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [userCoins, setUserCoins] = useState<any[]>([]);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'pending' | null;
    message: string;
    txHash?: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    loadCollectionData();
  }, []);

  useEffect(() => {
    if (account?.address) {
      loadUserData();
    }
  }, [account?.address]);

  const loadCollectionData = async () => {
    try {
      const data = await suiService.getCollectionInfo(CONTRACT_CONSTANTS.COLLECTION_ID);
      setCollectionData(data);
    } catch (error) {
      console.error('Failed to load collection:', error);
    }
  };

  const loadUserData = async () => {
    if (!account?.address) return;
    
    try {
      const [coins, nfts] = await Promise.all([
        suiService.getUserCoins(account.address),
        suiService.getUserNFTs(account.address),
      ]);
      setUserCoins(coins);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleMint = async (name: string, description: string, imageUrl: string) => {
    if (!account?.address || !collectionData) return;

    setLoading(true);
    setTxStatus({ type: 'pending', message: 'Preparing transaction...' });

    try {
      const requiredAmount = collectionData.mint_price;
      const suitableCoin = userCoins.find(coin => parseInt(coin.balance) >= requiredAmount);

      if (!suitableCoin) {
        throw new Error(`Insufficient SUI balance. Need ${suiService.formatSUI(requiredAmount)} SUI`);
      }

      const txb = suiService.createMintTransaction(name, description, imageUrl, suitableCoin.coinObjectId);

      setTxStatus({ type: 'pending', message: 'Waiting for wallet confirmation...' });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      setTxStatus({
        type: 'success',
        message: 'NFT minted successfully!',
        txHash: result.digest,
      });

      await Promise.all([loadUserData(), loadCollectionData()]);

    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Failed to mint NFT',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Simple NFT Minting dApp
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Mint your unique NFTs with time-based features and dynamic metadata
          </p>
          <WalletConnection />
        </header>

        {txStatus.type && (
          <div className={`max-w-md mx-auto mb-6 p-4 rounded-lg ${
            txStatus.type === 'success' ? 'bg-green-100 text-green-800' :
            txStatus.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <p>{txStatus.message}</p>
            {txStatus.txHash && (
              <a
                href={`https://suiscan.xyz/testnet/tx/${txStatus.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                View on Explorer
              </a>
            )}
            <button
              onClick={() => setTxStatus({ type: null, message: '' })}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CollectionInfo 
              collectionData={collectionData} 
              suiService={suiService}
            />
            
            {account && collectionData && (
              <MintingForm
                onMint={handleMint}
                loading={loading}
                userCoins={userCoins}
                mintPrice={collectionData.mint_price}
                suiService={suiService}
              />
            )}
          </div>

          <div>
            {account && (
              <NFTGallery 
                nfts={userNFTs} 
                loading={loading}
                onRefresh={loadUserData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMintingApp;
```

### Step 6: Create Supporting Components

Create `src/components/WalletConnection.tsx`:

```typescript
import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/wallet-adapter-react';
import { Wallet } from 'lucide-react';

const WalletConnection: React.FC = () => {
  const account = useCurrentAccount();

  if (account) {
    return (
      <div className="bg-white rounded-lg shadow p-4 max-w-sm mx-auto">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Connected</p>
            <p className="font-mono text-sm">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-sm mx-auto text-center">
      <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
      <p className="text-gray-600 mb-4">Connect to start minting NFTs</p>
      <ConnectButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg" />
    </div>
  );
};

export default WalletConnection;
```

Create `src/components/CollectionInfo.tsx`:

```typescript
import React from 'react';
import { CollectionData, SuiService } from '../types';
import { Clock, Users, Coins } from 'lucide-react';

interface Props {
  collectionData: CollectionData | null;
  suiService: SuiService;
}

const CollectionInfo: React.FC<Props> = ({ collectionData, suiService }) => {
  if (!collectionData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const progress = (collectionData.total_supply / collectionData.max_supply) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{collectionData.name}</h2>
      <p className="text-gray-600 mb-6">{collectionData.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-2">
            <Users className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Supply</span>
          </div>
          <p className="text-lg font-bold">
            {collectionData.total_supply}/{collectionData.max_supply}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-2">
            <Coins className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Price</span>
          </div>
          <p className="text-lg font-bold">
            {suiService.formatSUI(collectionData.mint_price)} SUI
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center text-sm">
        <Clock className="w-4 h-4 mr-2" />
        <span className={collectionData.is_active ? 'text-green-600' : 'text-red-600'}>
          {collectionData.is_active ? 'Minting Active' : 'Minting Inactive'}
        </span>
      </div>

      {collectionData.is_active && (
        <p className="text-sm text-gray-500 mt-2">
          {suiService.formatTimeRemaining(collectionData.mint_end_time)}
        </p>
      )}
    </div>
  );
};

export default CollectionInfo;
```

Create `src/components/MintingForm.tsx`:

```typescript
import React, { useState } from 'react';
import { SuiService } from '../services/suiService';
import { Palette, Loader2 } from 'lucide-react';

interface Props {
  onMint: (name: string, description: string, imageUrl: string) => Promise<void>;
  loading: boolean;
  userCoins: any[];
  mintPrice: number;
  suiService: SuiService;
}

const MintingForm: React.FC<Props> = ({
  onMint,
  loading,
  userCoins,
  mintPrice,
  suiService,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  const totalBalance = userCoins.reduce((sum, coin) => sum + parseInt(coin.balance), 0);
  const hasEnoughBalance = totalBalance >= mintPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.imageUrl) return;
    
    await onMint(formData.name, formData.description, formData.imageUrl);
    setFormData({ name: '', description: '', imageUrl: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Palette className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold">Mint Your NFT</h2>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between">
          <span>Your Balance:</span>
          <span>{suiService.formatSUI(totalBalance)} SUI</span>
        </div>
        <div className="flex justify-between">
          <span>Mint Price:</span>
          <span>{suiService.formatSUI(mintPrice)} SUI</span>
        </div>
        {!hasEnoughBalance && (
          <p className="text-red-600 text-sm mt-2">Insufficient balance</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Amazing NFT"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe your NFT..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.png"
            required
          />
        </div>

        {formData.imageUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded border"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !hasEnoughBalance}
          className={`w-full py-3 rounded-lg font-medium ${
            loading || !hasEnoughBalance
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Minting...
            </div>
          ) : (
            `Mint NFT for ${suiService.formatSUI(mintPrice)} SUI`
          )}
        </button>
      </form>
    </div>
  );
};

export default MintingForm;
```

Create `src/components/NFTGallery.tsx`:

```typescript
import React from 'react';
import { RefreshCw, Image as ImageIcon } from 'lucide-react';

interface Props {
  nfts: any[];
  loading: boolean;
  onRefresh: () => void;
}

const NFTGallery: React.FC<Props> = ({ nfts, loading, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your NFTs ({nfts.length})</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No NFTs found</p>
          <p className="text-sm text-gray-400">Mint your first NFT!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nfts.map((nft, index) => {
            const content = nft.data?.content;
            const fields = content?.fields;
            
            return (
              <div key={nft.data?.objectId || index} className="border rounded-lg p-4">
                <img
                  src={fields?.image_url || '/placeholder.png'}
                  alt={fields?.name || 'NFT'}
                  className="w-full h-32 object-cover rounded mb-3"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
                <h3 className="font-semibold">{fields?.name || 'Unnamed NFT'}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {fields?.description || 'No description'}
                </p>
                <p className="text-xs text-gray-400">
                  Creator: {fields?.creator?.slice(0, 6)}...{fields?.creator?.slice(-4)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
```

### Step 7: Setup Tailwind CSS

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 8: Run the dApp

```bash
# Start development server
npm start

# Build for production
npm run build
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
*From Zero to Sui Developer in 2 Days*  
*Ready to Build on the Future of Blockchain* ✨
