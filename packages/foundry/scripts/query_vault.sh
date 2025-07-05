#!/bin/bash

# Query Vault Smart Contract Data
# This script uses Foundry's cast to call all getter functions of the Vault contract

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RPC_URL="http://127.0.0.1:8545"
VAULT_FACTORY_ADDRESS="0x8ce361602b935680e8dec218b820ff5056beb7af"
ERC20_MOCK_ADDRESS="0xb19b36b1456e65e3a6d514d3f715f204bd59f431"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_divider() {
    echo -e "${BLUE}================================================${NC}"
}

# Function to check if local blockchain is running
check_blockchain() {
    print_info "Checking if local blockchain is running..."
    
    if ! curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        $RPC_URL > /dev/null 2>&1; then
        print_error "Local blockchain is not running!"
        print_info "Please start the local blockchain with: yarn chain"
        exit 1
    fi
    
    print_success "Local blockchain is running"
}

# Function to create a test vault if none exists
create_test_vault() {
    print_info "Creating a test vault for demonstration..."
    
    # Convert "Test Vault" to bytes32
    VAULT_NAME="0x546573742056617572740000000000000000000000000000000000000000000000"
    BENEFICIARY="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"  # Default anvil account
    TARGET_AMOUNT="1000000000000000000000"  # 1000 ETH in wei
    
    VAULT_ADDRESS=$(cast call $VAULT_FACTORY_ADDRESS \
        "createVault(bytes32,address,address,uint256)" \
        $VAULT_NAME \
        $BENEFICIARY \
        $ERC20_MOCK_ADDRESS \
        $TARGET_AMOUNT \
        --rpc-url $RPC_URL \
        --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | \
        grep -o '0x[a-fA-F0-9]\{40\}')
    
    if [ -z "$VAULT_ADDRESS" ]; then
        print_error "Failed to create test vault"
        exit 1
    fi
    
    print_success "Test vault created at address: $VAULT_ADDRESS"
    echo $VAULT_ADDRESS
}

# Function to get vault address from user input or create one
get_vault_address() {
    if [ -z "$1" ]; then
        print_info "No vault address provided. Getting first vault from factory..."
        
        # Get vault count
        VAULT_COUNT=$(cast call $VAULT_FACTORY_ADDRESS \
            "getVaultCount()" \
            --rpc-url $RPC_URL)
        
        VAULT_COUNT_DEC=$(printf "%d" $VAULT_COUNT)
        
        if [ "$VAULT_COUNT_DEC" -eq 0 ]; then
            print_warning "No vaults exist. Creating a test vault..."
            create_test_vault
        else
            print_info "Found $VAULT_COUNT_DEC vault(s). Using the first one..."
            cast call $VAULT_FACTORY_ADDRESS \
                "getVaultAddressByIndex(uint256)" \
                0 \
                --rpc-url $RPC_URL
        fi
    else
        echo $1
    fi
}

# Function to query all vault getter functions
query_vault_data() {
    local vault_address=$1
    
    print_divider
    print_info "Querying Vault contract at address: $vault_address"
    print_divider
    
    # getName() - returns bytes32
    print_info "Calling getName()..."
    NAME_HEX=$(cast call $vault_address "getName()" --rpc-url $RPC_URL)
    # Convert bytes32 to string (remove 0x and trailing zeros, then hex to ascii)
    NAME_ASCII=$(echo $NAME_HEX | sed 's/0x//' | sed 's/00*$//' | xxd -r -p 2>/dev/null || echo "Unable to decode")
    echo -e "  ${GREEN}Name (hex):${NC} $NAME_HEX"
    echo -e "  ${GREEN}Name (ascii):${NC} $NAME_ASCII"
    echo
    
    # getOwner() - returns address
    print_info "Calling getOwner()..."
    OWNER=$(cast call $vault_address "getOwner()" --rpc-url $RPC_URL)
    echo -e "  ${GREEN}Owner:${NC} $OWNER"
    echo
    
    # getBeneficiary() - returns address
    print_info "Calling getBeneficiary()..."
    BENEFICIARY=$(cast call $vault_address "getBeneficiary()" --rpc-url $RPC_URL)
    echo -e "  ${GREEN}Beneficiary:${NC} $BENEFICIARY"
    echo
    
    # getStablecoin() - returns address
    print_info "Calling getStablecoin()..."
    STABLECOIN=$(cast call $vault_address "getStablecoin()" --rpc-url $RPC_URL)
    echo -e "  ${GREEN}Stablecoin Address:${NC} $STABLECOIN"
    echo
    
    # getTargetAmount() - returns uint256
    print_info "Calling getTargetAmount()..."
    TARGET_AMOUNT_HEX=$(cast call $vault_address "getTargetAmount()" --rpc-url $RPC_URL)
    TARGET_AMOUNT_DEC=$(printf "%d" $TARGET_AMOUNT_HEX)
    TARGET_AMOUNT_ETH=$(cast --to-unit $TARGET_AMOUNT_HEX ether)
    echo -e "  ${GREEN}Target Amount (wei):${NC} $TARGET_AMOUNT_DEC"
    echo -e "  ${GREEN}Target Amount (ETH):${NC} $TARGET_AMOUNT_ETH"
    echo
    
    # getBalanceOfVault() - returns uint256
    print_info "Calling getBalanceOfVault()..."
    BALANCE_HEX=$(cast call $vault_address "getBalanceOfVault()" --rpc-url $RPC_URL)
    BALANCE_DEC=$(printf "%d" $BALANCE_HEX)
    BALANCE_ETH=$(cast --to-unit $BALANCE_HEX ether)
    echo -e "  ${GREEN}Current Balance (wei):${NC} $BALANCE_DEC"
    echo -e "  ${GREEN}Current Balance (ETH):${NC} $BALANCE_ETH"
    echo
    
    print_divider
    print_success "Vault data retrieval completed!"
    print_divider
}

# Function to display usage
usage() {
    echo "Usage: $0 [VAULT_ADDRESS]"
    echo ""
    echo "Query all getter functions of a Vault smart contract"
    echo ""
    echo "Arguments:"
    echo "  VAULT_ADDRESS    (optional) Address of the vault to query"
    echo "                   If not provided, will use the first vault from VaultFactory"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Query first vault from factory"
    echo "  $0 0x1234...                        # Query specific vault address"
    echo ""
    echo "Prerequisites:"
    echo "  - Local blockchain running (yarn chain)"
    echo "  - VaultFactory and ERC20Mock contracts deployed"
}

# Main execution
main() {
    print_divider
    print_info "Vault Smart Contract Query Tool"
    print_divider
    
    # Check for help flag
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        usage
        exit 0
    fi
    
    # Check if blockchain is running
    check_blockchain
    
    # Get vault address
    VAULT_ADDRESS=$(get_vault_address "$1")
    
    # Validate vault address format
    if [[ ! $VAULT_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        print_error "Invalid vault address format: $VAULT_ADDRESS"
        exit 1
    fi
    
    # Query vault data
    query_vault_data $VAULT_ADDRESS
}

# Run main function with all arguments
main "$@"