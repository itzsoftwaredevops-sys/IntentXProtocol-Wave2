// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMockDEX.sol";

/**
 * @title MockDEX
 * @notice Mock DEX for simulating swaps on BlockDAG
 * @dev Implements simple AMM formula with 2% fee
 */
contract MockDEX is IMockDEX, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    /// @notice Fee percentage (200 = 2%, out of 10000)
    uint256 public constant FEE_PERCENTAGE = 200; // 2%

    /// @notice Counter for total swaps
    uint256 private swapCount;

    /// @notice Owner address
    address public owner;

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /// @notice Only owner modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /// @notice Initialize MockDEX
    constructor() {
        owner = msg.sender;
        swapCount = 0;
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /// @notice Simulate a token swap
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @return outputAmount Output amount after fee (98% of input)
    function mockSwap(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external nonReentrant returns (uint256) {
        require(tokenIn != address(0), "Invalid tokenIn address");
        require(tokenOut != address(0), "Invalid tokenOut address");
        require(amount > 0, "Amount must be greater than 0");

        // Calculate output amount with 2% fee
        uint256 fee = (amount * FEE_PERCENTAGE) / 10000;
        uint256 outputAmount = amount - fee;

        // Transfer input tokens from user to contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);

        // Transfer output tokens to user
        IERC20(tokenOut).safeTransfer(msg.sender, outputAmount);

        // Increment swap counter
        swapCount++;

        // Emit event
        emit SwapExecuted(tokenIn, tokenOut, amount, outputAmount, fee);

        return outputAmount;
    }

    /// @notice Get swap quote (amount out for amount in)
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @return quoteAmount Quoted output amount (98% of input)
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external pure returns (uint256) {
        require(tokenIn != address(0), "Invalid tokenIn address");
        require(tokenOut != address(0), "Invalid tokenOut address");
        require(amount > 0, "Amount must be greater than 0");

        // Calculate quote with 2% fee
        uint256 fee = (amount * FEE_PERCENTAGE) / 10000;
        return amount - fee;
    }

    /// @notice Get swap fee percentage
    /// @return feePercentage Fee as basis points (200 = 2%)
    function getFeePercentage() external pure returns (uint256) {
        return FEE_PERCENTAGE;
    }

    /// @notice Get total swaps executed
    /// @return count Total number of swaps
    function getSwapCount() external view returns (uint256) {
        return swapCount;
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /// @notice Transfer ownership
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /// @notice Rescue tokens sent to contract
    /// @param token Token address to rescue
    /// @param recipient Recipient address
    function rescueTokens(address token, address recipient)
        external
        onlyOwner
    {
        require(token != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient address");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(recipient, balance);
    }
}
