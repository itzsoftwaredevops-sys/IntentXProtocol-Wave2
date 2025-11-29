// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IMockDEX
 * @notice Interface for Mock DEX contract
 * @dev Simulates DEX swap operations for BlockDAG
 */
interface IMockDEX {
    /// @notice Emitted when a swap is executed
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    /// @notice Emitted when liquidity is added
    event LiquidityAdded(address indexed token, uint256 amount);

    /// @notice Simulate a token swap
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @return outputAmount Output amount after fee (98% of input)
    function mockSwap(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external returns (uint256);

    /// @notice Get swap quote (amount out for amount in)
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amount Input amount
    /// @return quoteAmount Quoted output amount (98% of input)
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external view returns (uint256);

    /// @notice Get swap fee percentage
    /// @return feePercentage Fee as percentage (200 = 2%)
    function getFeePercentage() external view returns (uint256);

    /// @notice Get total swaps executed
    /// @return count Total number of swaps
    function getSwapCount() external view returns (uint256);
}
