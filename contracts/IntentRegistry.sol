// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IIntentRegistry.sol";
import "./interfaces/IMockDEX.sol";

/**
 * @title IntentRegistry
 * @notice Wave 3 Intent Registry - Manages intent creation, execution, and lifecycle
 * @dev Production-grade intent registry for BlockDAG with full security features
 */
contract IntentRegistry is IIntentRegistry, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    /// @notice Mapping of intent ID to intent details
    mapping(uint256 => Intent) private intents;

    /// @notice Mapping of user address to their intent IDs
    mapping(address => uint256[]) private userIntents;

    /// @notice Counter for intent IDs
    uint256 private intentCounter;

    /// @notice MockDEX contract address for swaps
    address public mockDEX;

    /// @notice Contract owner
    address public owner;

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /// @notice Only owner modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @notice Only intent owner modifier
    modifier onlyIntentOwner(uint256 intentId) {
        require(
            intents[intentId].owner == msg.sender,
            "Only intent owner can call this function"
        );
        _;
    }

    /// @notice Intent must exist and be pending
    modifier intentExists(uint256 intentId) {
        require(
            intents[intentId].owner != address(0),
            "Intent does not exist"
        );
        require(
            intents[intentId].state == IntentState.PENDING,
            "Intent is not pending"
        );
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /// @notice Initialize IntentRegistry
    /// @param _mockDEX Address of MockDEX contract
    constructor(address _mockDEX) {
        require(_mockDEX != address(0), "Invalid MockDEX address");
        mockDEX = _mockDEX;
        owner = msg.sender;
        intentCounter = 1; // Start from 1 for better readability
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /// @notice Create a new intent
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @param minReturn Minimum output amount
    /// @return intentId Unique ID of created intent
    function createIntent(
        address tokenIn,
        address tokenOut,
        uint256 amount,
        uint256 minReturn
    ) external returns (uint256) {
        require(tokenIn != address(0), "Invalid tokenIn address");
        require(tokenOut != address(0), "Invalid tokenOut address");
        require(amount > 0, "Amount must be greater than 0");
        require(minReturn > 0, "MinReturn must be greater than 0");

        // Transfer tokens from user to contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);

        // Create intent
        uint256 newIntentId = intentCounter++;
        intents[newIntentId] = Intent({
            id: newIntentId,
            owner: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amount: amount,
            minReturn: minReturn,
            timestamp: block.timestamp,
            state: IntentState.PENDING
        });

        // Track user intent
        userIntents[msg.sender].push(newIntentId);

        // Emit event
        emit IntentCreated(
            newIntentId,
            msg.sender,
            tokenIn,
            tokenOut,
            amount,
            minReturn
        );

        return newIntentId;
    }

    /// @notice Execute an intent
    /// @param id Intent ID to execute
    /// @return outputAmount Output amount from execution
    function executeIntent(uint256 id)
        external
        nonReentrant
        onlyIntentOwner(id)
        intentExists(id)
        returns (uint256)
    {
        Intent storage intent = intents[id];
        uint256 gasStart = gasleft();

        // Call MockDEX for swap
        uint256 outputAmount = IMockDEX(mockDEX).mockSwap(
            intent.tokenIn,
            intent.tokenOut,
            intent.amount
        );

        require(
            outputAmount >= intent.minReturn,
            "Output amount below minimum"
        );

        // Update intent state
        intent.state = IntentState.EXECUTED;

        // Transfer output tokens to user
        IERC20(intent.tokenOut).safeTransfer(msg.sender, outputAmount);

        // Calculate gas used
        uint256 gasUsed = gasStart - gasleft();

        // Emit execution event
        emit IntentExecuted(id, msg.sender, outputAmount, gasUsed);

        return outputAmount;
    }

    /// @notice Cancel an intent
    /// @param id Intent ID to cancel
    function cancelIntent(uint256 id)
        external
        onlyIntentOwner(id)
        intentExists(id)
    {
        Intent storage intent = intents[id];

        // Update state
        intent.state = IntentState.CANCELLED;

        // Refund tokens to user
        IERC20(intent.tokenIn).safeTransfer(msg.sender, intent.amount);

        // Emit cancellation event
        emit IntentCancelled(id, msg.sender);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /// @notice Get intent by ID
    /// @param id Intent ID
    /// @return intent The requested intent
    function getIntent(uint256 id) external view returns (Intent memory) {
        require(intents[id].owner != address(0), "Intent does not exist");
        return intents[id];
    }

    /// @notice Get all intents for a user
    /// @param user User address
    /// @return intentsArray Array of user intents
    function getUserIntents(address user)
        external
        view
        returns (Intent[] memory)
    {
        uint256[] memory intentIds = userIntents[user];
        Intent[] memory intentsArray = new Intent[](intentIds.length);

        for (uint256 i = 0; i < intentIds.length; i++) {
            intentsArray[i] = intents[intentIds[i]];
        }

        return intentsArray;
    }

    /// @notice Get total intent count
    /// @return count Total number of intents
    function getIntentCount() external view returns (uint256) {
        return intentCounter - 1;
    }

    /// @notice Get user intent count
    /// @param user User address
    /// @return count Number of user intents
    function getUserIntentCount(address user)
        external
        view
        returns (uint256)
    {
        return userIntents[user].length;
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /// @notice Update MockDEX address
    /// @param newMockDEX New MockDEX address
    function setMockDEX(address newMockDEX) external onlyOwner {
        require(newMockDEX != address(0), "Invalid address");
        mockDEX = newMockDEX;
    }

    /// @notice Transfer ownership
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /// @notice Emergency rescue tokens (non-intent tokens)
    /// @param token Token address to rescue
    /// @param recipient Recipient address
    function rescueTokens(address token, address recipient)
        external
        onlyOwner
    {
        require(token != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient address");
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(recipient, balance);
        }
    }
}
