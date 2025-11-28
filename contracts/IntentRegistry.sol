// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IntentRegistry
 * @notice Core registry for user intents in the IntentX protocol
 * @dev Stores intent metadata, tracks status, and enables intent discovery
 * @custom:security Features reentrancy protection and comprehensive event logging
 */
contract IntentRegistry is ReentrancyGuard {
    enum IntentStatus { Pending, Parsed, Executing, Completed, Failed, Cancelled }
    
    struct Intent {
        address user;
        bytes32 intentHash;
        string naturalLanguage;
        bytes parsedData;
        IntentStatus status;
        uint256 createdAt;
        uint256 executedAt;
        uint256 gasEstimate;
        uint256 executionCount;
        bytes32 executionHash;
    }
    
    // Intent storage
    mapping(bytes32 => Intent) public intents;
    mapping(address => bytes32[]) public userIntents;
    mapping(address => uint256) public userIntentCount;
    bytes32[] public allIntentIds;
    
    // Access control
    address public owner;
    mapping(address => bool) public executors;
    
    // Events
    event IntentRegistered(bytes32 indexed intentId, address indexed user, string naturalLanguage, uint256 timestamp);
    event IntentStatusUpdated(bytes32 indexed intentId, IntentStatus oldStatus, IntentStatus newStatus, uint256 timestamp);
    event IntentExecuted(bytes32 indexed intentId, address indexed executor, uint256 gasUsed, uint256 timestamp);
    event ExecutorAdded(address indexed executor, uint256 timestamp);
    event ExecutorRemoved(address indexed executor, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyExecutor() {
        require(executors[msg.sender] || msg.sender == owner, "Only authorized executors can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        executors[msg.sender] = true;
    }
    
    /**
     * @notice Register a new user intent
     * @param naturalLanguage The natural language description of the intent
     * @param parsedData The parsed data structure (encoded)
     * @param gasEstimate Estimated gas cost for execution
     * @return intentId The unique identifier for the intent
     */
    function registerIntent(
        string memory naturalLanguage,
        bytes memory parsedData,
        uint256 gasEstimate
    ) external nonReentrant returns (bytes32) {
        require(bytes(naturalLanguage).length > 0, "Intent description cannot be empty");
        require(gasEstimate > 0, "Gas estimate must be greater than zero");
        require(gasEstimate <= 10000000, "Gas estimate exceeds maximum limit");
        
        bytes32 intentId = keccak256(
            abi.encodePacked(msg.sender, naturalLanguage, block.timestamp, allIntentIds.length)
        );
        
        require(intents[intentId].user == address(0), "Intent already exists");
        
        intents[intentId] = Intent({
            user: msg.sender,
            intentHash: intentId,
            naturalLanguage: naturalLanguage,
            parsedData: parsedData,
            status: IntentStatus.Parsed,
            createdAt: block.timestamp,
            executedAt: 0,
            gasEstimate: gasEstimate,
            executionCount: 0,
            executionHash: bytes32(0)
        });
        
        userIntents[msg.sender].push(intentId);
        userIntentCount[msg.sender]++;
        allIntentIds.push(intentId);
        
        emit IntentRegistered(intentId, msg.sender, naturalLanguage, block.timestamp);
        
        return intentId;
    }
    
    /**
     * @notice Update the status of an intent
     * @param intentId The intent identifier
     * @param newStatus The new status
     */
    function updateIntentStatus(bytes32 intentId, IntentStatus newStatus) external onlyExecutor nonReentrant {
        Intent storage intent = intents[intentId];
        require(intent.user != address(0), "Intent does not exist");
        
        IntentStatus oldStatus = intent.status;
        intent.status = newStatus;
        
        if (newStatus == IntentStatus.Completed || newStatus == IntentStatus.Failed) {
            intent.executedAt = block.timestamp;
        }
        
        emit IntentStatusUpdated(intentId, oldStatus, newStatus, block.timestamp);
    }
    
    /**
     * @notice Mark intent as executed
     * @param intentId The intent identifier
     * @param gasUsed Gas used for execution
     */
    function markIntentExecuted(bytes32 intentId, uint256 gasUsed) external onlyExecutor nonReentrant {
        Intent storage intent = intents[intentId];
        require(intent.user != address(0), "Intent does not exist");
        require(intent.status != IntentStatus.Completed, "Intent already completed");
        
        IntentStatus oldStatus = intent.status;
        intent.status = IntentStatus.Completed;
        intent.executedAt = block.timestamp;
        intent.executionCount++;
        intent.executionHash = keccak256(abi.encodePacked(intentId, gasUsed, block.timestamp));
        
        emit IntentExecuted(intentId, msg.sender, gasUsed, block.timestamp);
        emit IntentStatusUpdated(intentId, oldStatus, IntentStatus.Completed, block.timestamp);
    }
    
    /**
     * @notice Cancel an intent
     * @param intentId The intent identifier
     */
    function cancelIntent(bytes32 intentId) external nonReentrant {
        Intent storage intent = intents[intentId];
        require(intent.user != address(0), "Intent does not exist");
        require(msg.sender == intent.user, "Only intent creator can cancel");
        require(intent.status != IntentStatus.Completed, "Cannot cancel completed intent");
        
        IntentStatus oldStatus = intent.status;
        intent.status = IntentStatus.Cancelled;
        
        emit IntentStatusUpdated(intentId, oldStatus, IntentStatus.Cancelled, block.timestamp);
    }
    
    /**
     * @notice Add an authorized executor
     * @param executor The executor address
     */
    function addExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor address");
        require(!executors[executor], "Address is already an executor");
        
        executors[executor] = true;
        emit ExecutorAdded(executor, block.timestamp);
    }
    
    /**
     * @notice Remove an authorized executor
     * @param executor The executor address
     */
    function removeExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor address");
        require(executors[executor], "Address is not an executor");
        require(executor != owner, "Cannot remove owner as executor");
        
        executors[executor] = false;
        emit ExecutorRemoved(executor, block.timestamp);
    }
    
    /**
     * @notice Get all intents for a user
     * @param user The user address
     * @return Array of intent IDs
     */
    function getUserIntents(address user) external view returns (bytes32[] memory) {
        return userIntents[user];
    }
    
    /**
     * @notice Get user intent count
     * @param user The user address
     * @return The count of intents
     */
    function getUserIntentCount(address user) external view returns (uint256) {
        return userIntentCount[user];
    }
    
    /**
     * @notice Get total number of intents
     * @return The count of all intents
     */
    function getIntentCount() external view returns (uint256) {
        return allIntentIds.length;
    }
    
    /**
     * @notice Get intent details
     * @param intentId The intent identifier
     * @return The intent struct
     */
    function getIntent(bytes32 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }
    
    /**
     * @notice Get intent status
     * @param intentId The intent identifier
     * @return The current status
     */
    function getIntentStatus(bytes32 intentId) external view returns (IntentStatus) {
        return intents[intentId].status;
    }
}
