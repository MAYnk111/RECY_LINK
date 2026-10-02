"""
RECY-LINK Smart Contract (Solidity — for reference/deployment)
Deploy to Polygon testnet or mainnet.
This is provided as documentation — the Python backend mocks this in prototype mode.
"""

SOLIDITY_CONTRACT = '''
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * RECY-LINK Material Event Registry
 * Records tamper-evident material events on Polygon blockchain.
 * DOES NOT store personal data (names, addresses, photos).
 * ONLY stores: material ID, event type, actor ID, timestamp.
 */
contract RecyLinkRegistry {
    
    // Event types
    uint8 constant MATERIAL_CREATED = 1;
    uint8 constant COLLECTION_REQUESTED = 2;
    uint8 constant COLLECTED = 3;
    uint8 constant SORTED = 4;
    uint8 constant TRANSFERRED = 5;
    uint8 constant RECEIVED = 6;
    uint8 constant PROCESSED = 7;
    
    struct MaterialEvent {
        bytes32 passportId;     // Hashed passport ID
        uint8 eventType;        // From constants above
        bytes32 actorId;        // Hashed actor ID (no PII)
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // All events (append-only)
    MaterialEvent[] public events;
    
    // Events per passport
    mapping(bytes32 => uint256[]) public passportEvents;
    
    // Contract owner
    address public owner;
    
    // Authorized operators (RECY-LINK backend wallets)
    mapping(address => bool) public operators;
    
    event MaterialEventRecorded(
        bytes32 indexed passportId,
        uint8 indexed eventType,
        bytes32 actorId,
        uint256 timestamp,
        uint256 eventIndex
    );
    
    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
    }
    
    function addOperator(address operator) external {
        require(msg.sender == owner, "Only owner");
        operators[operator] = true;
    }
    
    /**
     * Record a material event.
     * passportIdHash: keccak256 of passport ID string (e.g., "MP-10482")
     * actorIdHash: keccak256 of actor ID string (e.g., "C-0217")
     * No PII is stored on-chain.
     */
    function recordEvent(
        bytes32 passportIdHash,
        uint8 eventType,
        bytes32 actorIdHash
    ) external onlyOperator returns (uint256 eventIndex) {
        require(eventType >= 1 && eventType <= 7, "Invalid event type");
        
        MaterialEvent memory newEvent = MaterialEvent({
            passportId: passportIdHash,
            eventType: eventType,
            actorId: actorIdHash,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        events.push(newEvent);
        eventIndex = events.length - 1;
        passportEvents[passportIdHash].push(eventIndex);
        
        emit MaterialEventRecorded(
            passportIdHash,
            eventType,
            actorIdHash,
            block.timestamp,
            eventIndex
        );
        
        return eventIndex;
    }
    
    /**
     * Get all event indices for a passport.
     */
    function getPassportEvents(bytes32 passportIdHash)
        external view returns (uint256[] memory)
    {
        return passportEvents[passportIdHash];
    }
    
    /**
     * Get a specific event by index.
     */
    function getEvent(uint256 index)
        external view returns (MaterialEvent memory)
    {
        require(index < events.length, "Index out of bounds");
        return events[index];
    }
    
    /**
     * Total number of events recorded.
     */
    function totalEvents() external view returns (uint256) {
        return events.length;
    }
}
'''

# Python Web3 integration (for production use)
WEB3_INTEGRATION = '''
# requirements: pip install web3
from web3 import Web3
import json
import hashlib

class RecyLinkBlockchain:
    def __init__(self, rpc_url: str, contract_address: str, abi: list, private_key: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract = self.w3.eth.contract(address=contract_address, abi=abi)
        self.account = self.w3.eth.account.from_key(private_key)
    
    def _hash_id(self, id_str: str) -> bytes:
        """Hash an ID to bytes32 for privacy."""
        return bytes.fromhex(hashlib.keccak_256(id_str.encode()).hexdigest())
    
    def record_event(self, passport_id: str, event_type: int, actor_id: str) -> str:
        """Record a material event on Polygon."""
        passport_hash = self._hash_id(passport_id)
        actor_hash = self._hash_id(actor_id)
        
        tx = self.contract.functions.recordEvent(
            passport_hash,
            event_type,
            actor_hash
        ).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
            "gas": 200000,
            "gasPrice": self.w3.eth.gas_price,
        })
        
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt.transactionHash.hex()
    
    def get_passport_events(self, passport_id: str) -> list:
        """Retrieve all events for a passport."""
        passport_hash = self._hash_id(passport_id)
        indices = self.contract.functions.getPassportEvents(passport_hash).call()
        return [self.contract.functions.getEvent(i).call() for i in indices]
'''

if __name__ == "__main__":
    print("RecyLink Smart Contract + Web3 Integration")
    print("=" * 50)
    print("Solidity contract ready for deployment to Polygon")
    print("Replace mock_record_blockchain_event() in main.py with RecyLinkBlockchain.record_event()")
