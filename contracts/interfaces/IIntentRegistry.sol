// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IIntentRegistry
 * @notice Interface for Intent Registry contract
 * @dev Defines all external functions for intent management
 */
interface IIntentRegistry {
    /// @notice Intent state enumeration
    /// @dev 0 = Pending, 1 = Executed, 2 = Cancelled
    enum IntentState {
        PENDING,
        EXECUTED,
        CANCELLED
    }

    /// @notice Intent struct
    /// @param id Unique intent identifier
    /// @param owner Address of intent creator
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @param minReturn Minimum output amount
    /// @param timestamp Creation timestamp
    /// @param state Current intent state
    struct Intent {
        uint256 id;
        address owner;
        address tokenIn;
        address tokenOut;
        uint256 amount;
        uint256 minReturn;
        uint256 timestamp;
        IntentState state;
    }

    /// @notice Emitted when intent is created
    event IntentCreated(
        uint256 indexed intentId,
        address indexed owner,
        address tokenIn,
        address tokenOut,
        uint256 amount,
        uint256 minReturn
    );

    /// @notice Emitted when intent is executed
    event IntentExecuted(
        uint256 indexed intentId,
        address indexed owner,
        uint256 outputAmount,
        uint256 gasUsed
    );

    /// @notice Emitted when intent is cancelled
    event IntentCancelled(uint256 indexed intentId, address indexed owner);

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
    ) external returns (uint256);

    /// @notice Execute an intent
    /// @param id Intent ID to execute
    /// @return outputAmount Output amount from execution
    function executeIntent(uint256 id) external returns (uint256);

    /// @notice Cancel an intent
    /// @param id Intent ID to cancel
    function cancelIntent(uint256 id) external;

    /// @notice Get intent by ID
    /// @param id Intent ID
    /// @return intent The requested intent
    function getIntent(uint256 id) external view returns (Intent memory);

    /// @notice Get all intents for a user
    /// @param user User address
    /// @return intents Array of user intents
    function getUserIntents(address user)
        external
        view
        returns (Intent[] memory);

    /// @notice Get total intent count
    /// @return count Total number of intents
    function getIntentCount() external view returns (uint256);
}
