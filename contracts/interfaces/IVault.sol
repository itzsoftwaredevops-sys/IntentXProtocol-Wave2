// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IVault
 * @notice Interface for Vault contract
 * @dev Simulates yield vault with share-based deposits
 */
interface IVault {
    /// @notice Emitted when deposit occurs
    event Deposited(
        address indexed user,
        uint256 depositAmount,
        uint256 sharesMinted
    );

    /// @notice Emitted when withdrawal occurs
    event Withdrawn(
        address indexed user,
        uint256 withdrawAmount,
        uint256 sharesBurned
    );

    /// @notice Emitted when yield is accrued
    event YieldAccrued(uint256 amount, uint256 newTotalDeposits);

    /// @notice Deposit tokens into vault and receive shares
    /// @param amount Token amount to deposit
    /// @return shares Shares minted
    function deposit(uint256 amount) external returns (uint256);

    /// @notice Withdraw tokens by burning shares
    /// @param shares Shares to burn
    /// @return amount Token amount withdrawn
    function withdraw(uint256 shares) external returns (uint256);

    /// @notice Get shares for user
    /// @param user User address
    /// @return shares User share balance
    function getUserShares(address user) external view returns (uint256);

    /// @notice Get share value in tokens
    /// @param user User address
    /// @return value Total value of user shares in tokens
    function getShareValue(address user) external view returns (uint256);

    /// @notice Get total vault deposits
    /// @return total Total deposits in vault
    function getTotalDeposits() external view returns (uint256);

    /// @notice Get total vault shares
    /// @return total Total shares issued
    function getTotalShares() external view returns (uint256);

    /// @notice Get current APR
    /// @return apr Annual percentage rate (basis points, 500 = 5%)
    function getAPR() external view returns (uint256);

    /// @notice Accrue yield to vault
    function accrueYield() external;
}
