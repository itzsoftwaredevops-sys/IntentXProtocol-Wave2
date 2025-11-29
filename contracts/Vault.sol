// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IVault.sol";

/**
 * @title Vault
 * @notice Simple yield vault with share-based accounting
 * @dev Simulates 5-10% APR yield distribution
 */
contract Vault is IVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    /// @notice Deposit token address
    IERC20 public immutable depositToken;

    /// @notice Total deposits in vault
    uint256 public totalDeposits;

    /// @notice Total shares issued
    uint256 public totalShares;

    /// @notice User share balances
    mapping(address => uint256) public userShares;

    /// @notice Current APR in basis points (500 = 5%)
    uint256 public apr = 750; // 7.5% default

    /// @notice Last yield accrual timestamp
    uint256 public lastYieldAccrual;

    /// @notice Owner address
    address public owner;

    /// @notice Minimum APR (5% = 500)
    uint256 private constant MIN_APR = 500;

    /// @notice Maximum APR (10% = 1000)
    uint256 private constant MAX_APR = 1000;

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

    /// @notice Initialize Vault
    /// @param _depositToken Address of token to deposit
    constructor(address _depositToken) {
        require(_depositToken != address(0), "Invalid deposit token address");
        depositToken = IERC20(_depositToken);
        owner = msg.sender;
        lastYieldAccrual = block.timestamp;
        totalDeposits = 0;
        totalShares = 0;
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /// @notice Deposit tokens into vault and receive shares
    /// @param amount Token amount to deposit
    /// @return shares Shares minted
    function deposit(uint256 amount)
        external
        nonReentrant
        returns (uint256)
    {
        require(amount > 0, "Deposit amount must be greater than 0");

        // Accrue yield before calculating shares
        accrueYield();

        // Calculate shares
        uint256 shares;
        if (totalShares == 0) {
            // First deposit: 1:1 ratio
            shares = amount;
        } else {
            // Calculate shares based on current vault value
            shares = (amount * totalShares) / totalDeposits;
        }

        require(shares > 0, "Deposit too small");

        // Update state
        totalDeposits += amount;
        totalShares += shares;
        userShares[msg.sender] += shares;

        // Transfer tokens from user to vault
        depositToken.safeTransferFrom(msg.sender, address(this), amount);

        // Emit event
        emit Deposited(msg.sender, amount, shares);

        return shares;
    }

    /// @notice Withdraw tokens by burning shares
    /// @param shares Shares to burn
    /// @return amount Token amount withdrawn
    function withdraw(uint256 shares)
        external
        nonReentrant
        returns (uint256)
    {
        require(shares > 0, "Withdrawal shares must be greater than 0");
        require(
            userShares[msg.sender] >= shares,
            "Insufficient shares to withdraw"
        );

        // Accrue yield before calculating withdrawal
        accrueYield();

        // Calculate withdrawal amount
        uint256 amount = (shares * totalDeposits) / totalShares;
        require(amount > 0, "Withdrawal amount is zero");

        // Update state
        totalDeposits -= amount;
        totalShares -= shares;
        userShares[msg.sender] -= shares;

        // Transfer tokens to user
        depositToken.safeTransfer(msg.sender, amount);

        // Emit event
        emit Withdrawn(msg.sender, amount, shares);

        return amount;
    }

    /// @notice Accrue yield to vault
    /// @dev Simulates continuous yield accrual
    function accrueYield() public {
        if (totalDeposits == 0) {
            lastYieldAccrual = block.timestamp;
            return;
        }

        // Calculate time elapsed in seconds
        uint256 timeElapsed = block.timestamp - lastYieldAccrual;

        if (timeElapsed == 0) {
            return;
        }

        // Calculate yield: APR * totalDeposits * timeElapsed / (365 days * 10000)
        uint256 yearInSeconds = 365 days;
        uint256 yieldAmount = (totalDeposits * apr * timeElapsed) /
            (yearInSeconds * 10000);

        if (yieldAmount > 0) {
            totalDeposits += yieldAmount;
            emit YieldAccrued(yieldAmount, totalDeposits);
        }

        lastYieldAccrual = block.timestamp;
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /// @notice Get shares for user
    /// @param user User address
    /// @return shares User share balance
    function getUserShares(address user) external view returns (uint256) {
        return userShares[user];
    }

    /// @notice Get share value in tokens
    /// @param user User address
    /// @return value Total value of user shares in tokens
    function getShareValue(address user) external view returns (uint256) {
        if (totalShares == 0) {
            return 0;
        }

        return (userShares[user] * totalDeposits) / totalShares;
    }

    /// @notice Get total vault deposits
    /// @return total Total deposits in vault
    function getTotalDeposits() external view returns (uint256) {
        return totalDeposits;
    }

    /// @notice Get total vault shares
    /// @return total Total shares issued
    function getTotalShares() external view returns (uint256) {
        return totalShares;
    }

    /// @notice Get current APR
    /// @return currentAPR Annual percentage rate in basis points (500 = 5%)
    function getAPR() external view returns (uint256) {
        return apr;
    }

    /// @notice Get vault token address
    /// @return token Deposit token address
    function getDepositToken() external view returns (address) {
        return address(depositToken);
    }

    /// @notice Get vault balance
    /// @return balance Total balance of deposit token
    function getVaultBalance() external view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /// @notice Update APR (must be between 5% and 10%)
    /// @param newAPR New APR in basis points (500 = 5%)
    function setAPR(uint256 newAPR) external onlyOwner {
        require(newAPR >= MIN_APR && newAPR <= MAX_APR, "APR out of range");
        apr = newAPR;
    }

    /// @notice Transfer ownership
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /// @notice Emergency rescue tokens
    /// @param token Token address to rescue
    /// @param recipient Recipient address
    function rescueTokens(address token, address recipient)
        external
        onlyOwner
    {
        require(token != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient address");
        require(token != address(depositToken), "Cannot rescue deposit token");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(recipient, balance);
    }
}
