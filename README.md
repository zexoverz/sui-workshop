# Sui Blockchain Workshop day 1 (26 july 2025)

## Workshop Overview
**Duration**: 1 Day (6 hours)  
**Target Audience**: Developers new to Sui blockchain  
**Prerequisites**: Basic programming knowledge, familiarity with command line  
**Network**: Sui Testnet (more stable than devnet, closer to production)

---

# 📦 Module 1: Introduction to Sui (10:00 AM - 12:00 PM)

## 🎯 Learning Objectives
By the end of this module, you will:
- Understand Sui's unique object-centric model
- Set up your development environment
- Create and deploy your first smart contract
- Interact with contracts using Sui CLI

## 🧠 Core Concepts

### What is Sui?
Sui is a next-generation Layer 1 blockchain that revolutionizes how we think about blockchain architecture:

- **Object-Centric Model**: Unlike Ethereum's account-based model, Sui treats everything as objects with unique IDs
- **Move Language**: Uses Move, a resource-oriented programming language designed for safe asset management
- **Parallel Execution**: Can process transactions in parallel when they don't conflict
- **Low Latency**: Achieves sub-second finality for simple transactions

### Key Differences from Other Blockchains

| Feature | Ethereum | Sui |
|---------|----------|-----|
| Data Model | Account-based | Object-centric |
| Language | Solidity | Move |
| Execution | Sequential | Parallel (when possible) |
| State | Global state tree | Object ownership |

## ⚙️ Environment Setup (30 minutes)

### Step 1: Install Sui CLI

**For macOS:**
```bash
brew install sui
```

**For Windows:**
```bash
winget install sui
```

**For Linux:**
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

### Step 2: Verify Installation
```bash
sui --version
```
You should see output like: `sui 1.x.x`

<img width="1214" height="228" alt="image" src="https://github.com/user-attachments/assets/7f86ecde-df42-40d1-a634-1c0d3908ec7e" />


### Step 3: Initialize Sui Client
```bash
# Initialize client configuration
sui client

# Check available environments
sui client envs

sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443

# Switch to testnet (if not already default)
sui client switch --env testnet

# Create a new address
sui client new-address ed25519

# Check your addresses
sui client addresses
```

reference : 
- https://docs.sui.io/guides/developer/getting-started/local-network
- https://docs.sui.io/guides/developer/getting-started/get-address

### Step 3.1: Using Existing Sui Wallet Address (Optional)

If you already have a Sui wallet (like Slush) with an existing address, you have several options:

**Option A: Import using keytool (correct method)**
```bash
# Import your existing wallet using the keytool
sui keytool import [YOUR_PRIVATE_KEY] ed25519

# The key will be added to your keystore
# Check your addresses to see the imported one
sui client addresses

# Switch to use the imported address if needed
sui client switch --address [YOUR_WALLET_ADDRESS]
```

**Option B: Use wallet for viewing, CLI for deployment (recommended)**
This is the safer approach for learning:
1. Keep your existing wallet (Slush) for viewing and receiving tokens
2. Use CLI-generated address for deployment and admin functions
3. Send tokens between addresses as needed

**Option C: Connect wallet to dApps later**
1. Deploy everything using CLI addresses
2. Use your Slush wallet to interact with deployed contracts via dApp frontends
3. This separates development (CLI) from user experience (wallet)

**Getting your wallet address from Slush:**
1. Open Slush wallet browser extension
2. Make sure you're on Testnet network
3. Copy your wallet address (starts with `0x...`)
4. Save this address - we'll use it later for receiving tokens

**Security Note**: Only import private keys for development/learning purposes. For production, keep private keys secure in your wallet.

### Step 4: Set Up Wallet

1. Install Sui Wallet browser extension or use slush Wallet
2. Create a new wallet
3. Save your seed phrase securely
4. Switch to Testnet network (not Devnet!)
5. Import your CLI address or connect existing wallet

### Step 5: Get Test Tokens

https://faucet.sui.io/

## 💡 Understanding Sui Objects

### Object Structure
Every object in Sui has:
- **Unique ID**: A globally unique identifier
- **Version**: Increments with each mutation
- **Owner**: Can be an address, shared, or immutable
- **Type**: Defined by the Move struct

### Object Ownership Types
1. **Owned**: Belongs to a specific address
2. **Shared**: Can be accessed by anyone
3. **Immutable**: Cannot be modified

## ✅ Exercise 1: Your First Counter Contract (45 minutes)

### Step 1: Create New Project
```bash
# Create a new Move project
sui move new counter_project
cd counter_project
```

### Step 2: Understand Project Structure
```
counter_project/
├── Move.toml          # Project configuration
├── sources/           # Move source files
└── tests/            # Test files
```

### Step 3: Configure Move.toml
Edit `Move.toml`:
```toml
[package]
name = "counter_project"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
counter_project = "0x0"
```

### Step 4: Write the Counter Contract
Create `sources/counter.move`:

```move
module counter_project::counter {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Counter object that can be incremented
    public struct Counter has key, store {
        id: UID,
        value: u64,
    }

    /// Initialize function - runs once when module is published
    fun init(ctx: &mut TxContext) {
        let counter = create_counter(ctx);
        // Share the counter so anyone can use it
        transfer::share_object(counter);
    }

    /// Create a new counter with value 0
    fun create_counter(ctx: &mut TxContext): Counter {
        Counter {
            id: object::new(ctx),
            value: 0,
        }
    }

    /// Get the current counter value
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }

    /// Increment the counter by 1
    public fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }

    /// Reset counter to 0
    public fun reset(counter: &mut Counter) {
        counter.value = 0;
    }

    /// Test-only function to create counter for unit tests
    #[test_only]
    public fun create_counter_for_testing(ctx: &mut TxContext): Counter {
        create_counter(ctx)
    }
}
```

### Step 5: Understanding the Code

**Key Components Explained:**

1. **Module Declaration**: `module counter_project::counter` - defines the namespace
2. **Struct with Abilities**: 
   - `key`: Object can be stored in global storage
   - `store`: Object can be stored inside other objects
3. **init Function**: Special function that runs once when module is published
4. **Object Creation**: `object::new(ctx)` creates a unique ID
5. **Transfer Functions**: 
   - `transfer::share_object()` - makes object globally accessible
   - `transfer::transfer()` - transfers ownership to specific address

### Step 6: Build the Contract
```bash
# Build the project
sui move build
```
If successful, you'll see: `Build Successful`

### Step 7: Write Unit Tests
Create `tests/counter_test.move`:

```move
#[test_only]
module counter_project::counter_test {
    use counter_project::counter::{Self};
    use sui::test_scenario;

    #[test]
    fun test_counter_increment() {
        let admin = @0xABBA;
        
        let mut scenario = test_scenario::begin(admin);
        {
            // Create counter for testing
            let ctx = test_scenario::ctx(&mut scenario);
            let mut counter = counter::create_counter_for_testing(ctx);
            
            // Test initial value
            assert!(counter::get_value(&counter) == 0, 0);
            
            // Test increment
            counter::increment(&mut counter);
            assert!(counter::get_value(&counter) == 1, 1);
            
            // Test multiple increments
            counter::increment(&mut counter);
            counter::increment(&mut counter);
            assert!(counter::get_value(&counter) == 3, 2);
            
            // Test reset
            counter::reset(&mut counter);
            assert!(counter::get_value(&counter) == 0, 3);
            
            // Clean up
            sui::test_utils::destroy(counter);
        };
        test_scenario::end(scenario);
    }
}
```

### Step 8: Run Tests
```bash
sui move test
```

### Step 9: Deploy to Testnet
```bash
# Deploy the contract to testnet
sui client publish --gas-budget 20000000

# Save the package ID from the output
# Note: Testnet deployments are more permanent than devnet
```

<img width="2240" height="1406" alt="image" src="https://github.com/user-attachments/assets/abc707e4-301d-4f26-ad85-31d288075e55" />


### Step 10: Interact with Deployed Contract

After deployment, note the:
- **Package ID**: Your deployed module identifier
- **Shared Object ID**: The counter object that was created

```bash
# Call increment function (on testnet)
sui client call \
  --package <PACKAGE_ID> \
  --module counter \
  --function increment \
  --args <SHARED_OBJECT_ID> \

# Check the result on Sui Explorer
# Visit: https://suiscan.xyz/testnet
```

<img width="1996" height="1370" alt="image" src="https://github.com/user-attachments/assets/fbc2a9bc-7f35-4df8-b53c-f773b2d1ef42" />


## 🔍 Exploring Sui Explorer (15 minutes)

### Using Sui Explorer
1. Go to https://suiscan.xyz/testnet (Note: testnet, not devnet)
2. Search for your transaction hash
3. Explore:
   - Transaction details
   - Object changes
   - Gas usage
   - Events emitted

### Understanding Transaction Structure
- **Transaction Digest**: Unique transaction identifier
- **Gas Used**: Computational cost
- **Objects Created/Modified**: State changes
- **Events**: Custom events emitted by your contract

<img width="3242" height="1944" alt="image" src="https://github.com/user-attachments/assets/bf924f77-a806-4d12-8f36-4190ffe63309" />


---

# 🛠️ Module 2: Advanced Move Programming (1:00 PM - 4:00 PM)

## 🎯 Learning Objectives
By the end of this module, you will:
- Master Move language fundamentals
- Implement secure ownership patterns
- Build a complete token system
- Apply best practices for gas optimization

## 🧠 Move Language Deep Dive

### Data Types in Move

**Primitive Types:**
```move
// Boolean
let flag: bool = true;

// Integers
let small_num: u8 = 255;      // 0 to 255
let big_num: u64 = 1000000;   // 0 to 18,446,744,073,709,551,615

// Address
let addr: address = @0x1;
```

**Collections:**
```move
// Vector (dynamic array)
let mut numbers: vector<u64> = vector::empty();
vector::push_back(&mut numbers, 42);

// Getting vector length
let len = vector::length(&numbers);
```

### Ownership and Capabilities

**Capabilities Pattern:**
Capabilities are objects that grant permission to perform certain actions.

```move
/// Admin capability - only holder can perform admin actions
public struct AdminCap has key, store {
    id: UID,
}
```

### One-Time Witness Pattern
Ensures a type can only be created once:

```move
/// One-Time Witness for creating coin
public struct MYTOKEN has drop {}

fun init(witness: MYTOKEN, ctx: &mut TxContext) {
    // Can only be called once during publish
    let (treasury, metadata) = coin::create_currency(
        witness,
        8, // decimals
        b"MTK", // symbol
        b"MyToken", // name
        b"A sample token", // description
        option::none(), // icon URL
        ctx
    );
    
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, tx_context::sender(ctx));
}
```

## ✅ Exercise 2: Building a Token System (90 minutes)

### Step 1: Create Token Project
```bash
sui move new token_system
cd token_system
```

### Step 2: Configure Move.toml
```toml
[package]
name = "token_system"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
token_system = "0x0"
```

### Step 3: Create the Token Contract
Create `sources/my_token.move`:

```move
module token_system::my_token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::object::UID;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::option;

    /// One-Time Witness for the token
    public struct MY_TOKEN has drop {}

    /// Admin capability for minting tokens
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Vault for storing tokens with access control
    public struct TokenVault has key {
        id: UID,
        balance: Balance<MY_TOKEN>,
        admin: address,
    }

    /// Event emitted when tokens are minted
    public struct TokenMinted has copy, drop {
        amount: u64,
        recipient: address,
    }

    /// Event emitted when tokens are burned
    public struct TokenBurned has copy, drop {
        amount: u64,
    }

    /// Initialize the token system
    fun init(witness: MY_TOKEN, ctx: &mut TxContext) {
        // Create the currency
        let (treasury, metadata) = coin::create_currency(
            witness,
            8, // 8 decimals
            b"MTK",
            b"MyToken",
            b"A sample token for learning Sui",
            option::none(),
            ctx
        );

        // Freeze the metadata so it can't be changed
        transfer::public_freeze_object(metadata);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        // Create a vault for storing tokens
        let vault = TokenVault {
            id: object::new(ctx),
            balance: balance::zero(),
            admin: tx_context::sender(ctx),
        };

        // Transfer treasury and admin cap to deployer
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(vault);
    }

    /// Mint new tokens (requires AdminCap)
    public fun mint(
        _: &AdminCap,
        treasury: &mut TreasuryCap<MY_TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let minted_coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(minted_coin, recipient);
        
        event::emit(TokenMinted {
            amount,
            recipient,
        });
    }

    /// Burn tokens
    public fun burn(
        treasury: &mut TreasuryCap<MY_TOKEN>,
        coin: Coin<MY_TOKEN>
    ) {
        let amount = coin::value(&coin);
        coin::burn(treasury, coin);
        
        event::emit(TokenBurned {
            amount,
        });
    }

    /// Deposit tokens into vault
    public fun deposit_to_vault(
        vault: &mut TokenVault,
        coin: Coin<MY_TOKEN>
    ) {
        let deposit_balance = coin::into_balance(coin);
        balance::join(&mut vault.balance, deposit_balance);
    }

    /// Withdraw tokens from vault (only admin)
    public fun withdraw_from_vault(
        vault: &mut TokenVault,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<MY_TOKEN> {
        assert!(tx_context::sender(ctx) == vault.admin, 0);
        let withdrawn_balance = balance::split(&mut vault.balance, amount);
        coin::from_balance(withdrawn_balance, ctx)
    }

    /// Get vault balance
    public fun vault_balance(vault: &TokenVault): u64 {
        balance::value(&vault.balance)
    }

    /// Transfer admin rights
    public fun transfer_admin(
        vault: &mut TokenVault,
        new_admin: address,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == vault.admin, 0);
        vault.admin = new_admin;
    }

    /// Check if address is admin
    public fun is_admin(vault: &TokenVault, addr: address): bool {
        vault.admin == addr
    }

    // === Test Functions ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(MY_TOKEN {}, ctx);
    }
}
```

### Step 4: Understanding Advanced Concepts

**Key Learning Points:**

1. **One-Time Witness**: `MY_TOKEN` struct ensures currency can only be created once
2. **Capability Pattern**: `AdminCap` controls who can mint tokens
3. **Balance vs Coin**: 
   - `Balance<T>`: Raw token amount
   - `Coin<T>`: Transferable token object
4. **Events**: Allow off-chain systems to track on-chain activities
5. **Access Control**: Using `assert!` to check permissions

### Step 5: Build and Test
```bash
# Build the project
sui move build

# Run tests
sui move test
```

### Step 6: Create Test File
Create `tests/token_test.move`:

```move
#[test_only]
module token_system::token_test {
    use token_system::my_token::{Self, AdminCap, TokenVault, MY_TOKEN};
    use sui::coin::{Self, TreasuryCap};
    use sui::test_scenario::{Self, Scenario};
    
    #[test]
    fun test_token_minting() {
        let admin = @0xAD31;
        let user = @0xABBA;
        
        let mut scenario = test_scenario::begin(admin);
        
        // Initialize the token system
        {
            my_token::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Admin mints tokens
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut treasury = test_scenario::take_from_sender<TreasuryCap<MY_TOKEN>>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            // Mint 1000 tokens to user
            my_token::mint(
                &admin_cap,
                &mut treasury,
                1000000000, // 1000 tokens with 8 decimals
                user,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, treasury);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        // User receives tokens
        test_scenario::next_tx(&mut scenario, user);
        {
            let coin = test_scenario::take_from_sender<sui::coin::Coin<MY_TOKEN>>(&scenario);
            assert!(coin::value(&coin) == 1000000000, 0);
            test_scenario::return_to_sender(&scenario, coin);
        };
        
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_vault_operations() {
        let admin = @0xAD31;
        let mut scenario = test_scenario::begin(admin);
        
        // Initialize
        {
            my_token::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Test vault operations
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut vault = test_scenario::take_shared<TokenVault>(&scenario);
            let mut treasury = test_scenario::take_from_sender<TreasuryCap<MY_TOKEN>>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            // Mint tokens to admin
            my_token::mint(
                &admin_cap,
                &mut treasury,
                500000000,
                admin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, treasury);
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(vault);
        };
        
        // Deposit to vault
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut vault = test_scenario::take_shared<TokenVault>(&scenario);
            let coin = test_scenario::take_from_sender<sui::coin::Coin<MY_TOKEN>>(&scenario);
            
            my_token::deposit_to_vault(&mut vault, coin);
            assert!(my_token::vault_balance(&vault) == 500000000, 0);
            
            test_scenario::return_shared(vault);
        };
        
        test_scenario::end(scenario);
    }
}
```

### Step 7: Deploy and Interact

```bash
# Deploy to testnet
sui client publish --gas-budget 30000000

# Note the Package ID, Treasury Cap ID, Admin Cap ID, and Vault ID
# Testnet objects persist longer than devnet
```

### Step 8: Mint Tokens via CLI

```bash
# Mint 100 tokens to yourself
sui client call \
  --package <PACKAGE_ID> \
  --module my_token \
  --function mint \
  --args <ADMIN_CAP_ID> <TREASURY_CAP_ID> 10000000000 <YOUR_ADDRESS> 
```

## ⚡ Gas Optimization Best Practices (30 minutes)

### Understanding Gas in Sui

**Gas Components:**
1. **Computation**: CPU cycles used
2. **Storage**: Data stored on-chain
3. **Package Size**: Code deployment cost

### Optimization Techniques

1. **Minimize Object Creation**
   ```move
   // Instead of creating many small objects
   public struct BadDesign has key {
       id: UID,
       value1: u64,
   }
   
   // Group related data
   public struct GoodDesign has key {
       id: UID,
       values: vector<u64>,
   }
   ```

2. **Use References When Possible**
   ```move
   // Pass by reference to avoid copying
   public fun process_data(data: &vector<u64>): u64 {
       // Process without copying the vector
       vector::length(data)
   }
   ```

3. **Batch Operations**
   ```move
   // Instead of multiple individual calls
   public fun batch_mint(
       cap: &AdminCap,
       treasury: &mut TreasuryCap<MY_TOKEN>,
       recipients: vector<address>,
       amounts: vector<u64>,
       ctx: &mut TxContext
   ) {
       let len = vector::length(&recipients);
       let mut i = 0;
       while (i < len) {
           let recipient = *vector::borrow(&recipients, i);
           let amount = *vector::borrow(&amounts, i);
           mint(cap, treasury, amount, recipient, ctx);
           i = i + 1;
       };
   }
   ```

## 🎯 Workshop Wrap-up (15 minutes)

### Key Takeaways

1. **Sui's Object Model**: Everything is an object with unique ID and ownership
2. **Move Language**: Resource-oriented programming with strong safety guarantees
3. **Capabilities**: Secure access control pattern
4. **Testing**: Comprehensive unit testing with test scenarios
5. **Gas Efficiency**: Consider computational and storage costs

### Next Steps

**Immediate Actions:**
- Practice building more complex contracts
- Explore Sui's standard library
- Join Sui developer community

**Learning Resources:**
- [Sui Documentation](https://docs.sui.io)
- [Move Book](https://move-book.com)
- [Sui GitHub](https://github.com/MystenLabs/sui)
- [Sui Discord](https://discord.gg/sui) - Use #testnet-faucet for additional tokens
- [Sui Testnet Explorer](https://suiscan.xyz/testnet)

**Project Ideas:**
1. Build a simple marketplace
2. Create a voting system
3. Implement a staking mechanism
4. Design a game with NFTs

### Common Pitfalls to Avoid

1. **Forgetting Object Ownership**: Always consider who owns what
2. **Gas Inefficiency**: Don't create unnecessary objects
3. **Security Issues**: Always validate inputs and check permissions
4. **Testing Gaps**: Write comprehensive tests for all scenarios

### Questions & Discussion

Time for open Q&A and discussion about:
- Specific implementation challenges
- Real-world use cases
- Integration with existing systems
- Advanced patterns and techniques

---

**Congratulations!** You've completed the Sui Blockchain Workshop. You now have the foundation to build sophisticated dApps on Sui using Move language.
