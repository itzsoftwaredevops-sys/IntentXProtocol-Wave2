// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IntentRegistry.sol";
import "./mocks/MockPair.sol";
import "./mocks/MockRouter.sol";

/**
 * @title ExecutionManager
 * @notice Handles execution of parsed intents through DeFi protocol interactions
 * @dev Orchestrates swaps, staking, lending actions based on intent data
 * @custom:security Features reentrancy protection, safe token transfers, and comprehensive error handling
 */
contract ExecutionManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IntentRegistry public registry;
    MockRouter public router;
    
    // Execution statistics
    uint256 public totalExecutions;
    uint256 public successfulExecutions;
    uint256 public failedExecutions;
    
    enum ActionType { Swap, Stake, Supply, Borrow, Withdraw, Unstake }
    
    struct ExecutionStep {
        ActionType actionType;
        address protocol;
        address tokenIn;
        address tokenOut;
        uint256 amount;
        uint256 minOutput;
    }
    
    struct ExecutionMetrics {
        uint256 startGas;
        uint256 endGas;
        uint256 gasUsed;
        uint256 executionTime;
        bool success;
    }
    
    // Execution history
    mapping(bytes32 => ExecutionMetrics) public executionMetrics;
    
    // Events
    event IntentExecutionStarted(bytes32 indexed intentId, uint256 stepCount, uint256 timestamp);
    event IntentExecutionCompleted(bytes32 indexed intentId, uint256 gasUsed, uint256 outputAmount, uint256 timestamp);
    event IntentExecutionFailed(bytes32 indexed intentId, string reason, uint256 timestamp);
    event StepExecuted(bytes32 indexed intentId, uint256 stepIndex, ActionType actionType, uint256 amount, uint256 timestamp);
    event ExecutionMetricsRecorded(bytes32 indexed intentId, uint256 gasUsed, uint256 executionTime, uint256 timestamp);
    
    modifier validIntent(bytes32 intentId) {
        require(registry.intents(intentId).user != address(0), "Intent does not exist");
        _;
    }
    
    constructor(address _registry, address _router) {
        require(_registry != address(0), "Invalid registry address");
        require(_router != address(0), "Invalid router address");
        
        registry = IntentRegistry(_registry);
        router = MockRouter(_router);
        
        totalExecutions = 0;
        successfulExecutions = 0;
        failedExecutions = 0;
    }
    
    /**
     * @notice Execute a registered intent with comprehensive error handling
     * @param intentId The intent identifier
     * @param steps Array of execution steps
     * @return success Whether execution was successful
     */
    function executeIntent(
        bytes32 intentId,
        ExecutionStep[] memory steps
    ) external validIntent(intentId) nonReentrant returns (bool) {
        require(steps.length > 0, "Must provide at least one execution step");
        require(steps.length <= 100, "Too many execution steps");
        
        IntentRegistry.Intent memory intent = registry.getIntent(intentId);
        require(intent.status == IntentRegistry.IntentStatus.Parsed, "Intent not ready for execution");
        
        totalExecutions++;
        uint256 startTime = block.timestamp;
        uint256 gasStart = gasleft();
        uint256 outputAmount = 0;
        
        emit IntentExecutionStarted(intentId, steps.length, block.timestamp);
        
        try this.executeSteps(intentId, steps) returns (uint256 output) {
            outputAmount = output;
            uint256 gasUsed = gasStart - gasleft();
            uint256 executionTime = block.timestamp - startTime;
            
            registry.markIntentExecuted(intentId, gasUsed);
            successfulExecutions++;
            
            executionMetrics[intentId] = ExecutionMetrics({
                startGas: gasStart,
                endGas: gasleft(),
                gasUsed: gasUsed,
                executionTime: executionTime,
                success: true
            });
            
            emit IntentExecutionCompleted(intentId, gasUsed, outputAmount, block.timestamp);
            emit ExecutionMetricsRecorded(intentId, gasUsed, executionTime, block.timestamp);
            
            return true;
        } catch Error(string memory reason) {
            uint256 gasUsed = gasStart - gasleft();
            failedExecutions++;
            
            registry.updateIntentStatus(intentId, IntentRegistry.IntentStatus.Failed);
            
            executionMetrics[intentId] = ExecutionMetrics({
                startGas: gasStart,
                endGas: gasleft(),
                gasUsed: gasUsed,
                executionTime: block.timestamp - startTime,
                success: false
            });
            
            emit IntentExecutionFailed(intentId, reason, block.timestamp);
            
            return false;
        } catch (bytes memory lowLevelData) {
            uint256 gasUsed = gasStart - gasleft();
            failedExecutions++;
            
            registry.updateIntentStatus(intentId, IntentRegistry.IntentStatus.Failed);
            emit IntentExecutionFailed(intentId, "Low level execution error", block.timestamp);
            
            return false;
        }
    }
    
    /**
     * @notice Execute individual steps of an intent
     * @param intentId The intent identifier
     * @param steps Array of execution steps
     * @return totalOutput The total output amount from all steps
     */
    function executeSteps(
        bytes32 intentId,
        ExecutionStep[] memory steps
    ) external returns (uint256 totalOutput) {
        require(msg.sender == address(this), "Can only be called internally");
        
        totalOutput = 0;
        
        for (uint256 i = 0; i < steps.length; i++) {
            ExecutionStep memory step = steps[i];
            require(step.amount > 0, "Step amount must be greater than zero");
            require(step.protocol != address(0), "Invalid protocol address");
            
            uint256 stepOutput = 0;
            
            if (step.actionType == ActionType.Swap) {
                stepOutput = executeSwap(step);
            } else if (step.actionType == ActionType.Stake) {
                stepOutput = executeStake(step);
            } else if (step.actionType == ActionType.Supply) {
                stepOutput = executeSupply(step);
            } else if (step.actionType == ActionType.Borrow) {
                stepOutput = executeBorrow(step);
            } else if (step.actionType == ActionType.Withdraw) {
                stepOutput = executeWithdraw(step);
            } else if (step.actionType == ActionType.Unstake) {
                stepOutput = executeUnstake(step);
            }
            
            totalOutput += stepOutput;
            emit StepExecuted(intentId, i, step.actionType, step.amount, block.timestamp);
        }
        
        return totalOutput;
    }
    
    /**
     * @notice Execute a swap operation
     * @param step The execution step
     * @return outputAmount The amount received from swap
     */
    function executeSwap(ExecutionStep memory step) internal returns (uint256) {
        require(step.tokenIn != address(0) && step.tokenOut != address(0), "Invalid token addresses");
        require(step.minOutput > 0, "Minimum output must be specified");
        
        address[] memory path = new address[](2);
        path[0] = step.tokenIn;
        path[1] = step.tokenOut;
        
        // In production, this would approve and call the actual DEX router
        // For now, return simulated output
        uint256 outputAmount = (step.amount * 95) / 100; // 95% output (5% slippage)
        require(outputAmount >= step.minOutput, "Output below minimum acceptable");
        
        router.swapExactTokensForTokens(
            step.amount,
            step.minOutput,
            path,
            msg.sender,
            block.timestamp + 300
        );
        
        return outputAmount;
    }
    
    /**
     * @notice Execute a staking operation
     * @param step The execution step
     * @return stakingAmount The amount staked
     */
    function executeStake(ExecutionStep memory step) internal returns (uint256) {
        require(step.amount > 0, "Invalid stake amount");
        require(step.tokenIn != address(0), "Invalid token address");
        require(step.protocol != address(0), "Invalid staking protocol");
        
        // Mock staking implementation
        // In production, this would interact with actual staking contracts
        // Simulate successful staking with transfer
        IERC20(step.tokenIn).safeTransferFrom(msg.sender, step.protocol, step.amount);
        
        return step.amount;
    }
    
    /**
     * @notice Execute a supply (lending) operation
     * @param step The execution step
     * @return supplyAmount The amount supplied
     */
    function executeSupply(ExecutionStep memory step) internal returns (uint256) {
        require(step.amount > 0, "Invalid supply amount");
        require(step.tokenIn != address(0), "Invalid token address");
        require(step.protocol != address(0), "Invalid lending protocol");
        
        // Mock lending supply
        // In production, this would interact with Aave, Compound, etc.
        IERC20(step.tokenIn).safeTransferFrom(msg.sender, step.protocol, step.amount);
        
        return step.amount;
    }
    
    /**
     * @notice Execute a borrow operation
     * @param step The execution step
     * @return borrowAmount The amount borrowed
     */
    function executeBorrow(ExecutionStep memory step) internal returns (uint256) {
        require(step.amount > 0, "Invalid borrow amount");
        require(step.tokenOut != address(0), "Invalid token address");
        require(step.protocol != address(0), "Invalid lending protocol");
        
        // Mock borrow implementation
        // In production, this would interact with lending protocols
        // Simulate successful borrow with return value
        
        return step.amount;
    }
    
    /**
     * @notice Execute a withdraw operation
     * @param step The execution step
     * @return withdrawAmount The amount withdrawn
     */
    function executeWithdraw(ExecutionStep memory step) internal returns (uint256) {
        require(step.amount > 0, "Invalid withdraw amount");
        require(step.tokenOut != address(0), "Invalid token address");
        require(step.protocol != address(0), "Invalid protocol address");
        
        // Mock withdrawal implementation
        IERC20(step.tokenOut).safeTransferFrom(step.protocol, msg.sender, step.amount);
        
        return step.amount;
    }
    
    /**
     * @notice Execute an unstaking operation
     * @param step The execution step
     * @return unstakeAmount The amount unstaked
     */
    function executeUnstake(ExecutionStep memory step) internal returns (uint256) {
        require(step.amount > 0, "Invalid unstake amount");
        require(step.tokenOut != address(0), "Invalid token address");
        require(step.protocol != address(0), "Invalid staking protocol");
        
        // Mock unstaking implementation
        IERC20(step.tokenOut).safeTransferFrom(step.protocol, msg.sender, step.amount);
        
        return step.amount;
    }
    
    /**
     * @notice Estimate gas for intent execution
     * @param steps Array of execution steps
     * @return estimatedGas Estimated gas cost
     */
    function estimateGas(ExecutionStep[] memory steps) external pure returns (uint256) {
        require(steps.length > 0, "Must provide at least one step");
        
        uint256 baseGas = 21000;
        uint256 perStepGas = 100000;
        uint256 swapGas = 150000;
        uint256 stakingGas = 120000;
        
        uint256 totalGas = baseGas;
        
        for (uint256 i = 0; i < steps.length; i++) {
            if (steps[i].actionType == ActionType.Swap) {
                totalGas += swapGas;
            } else if (steps[i].actionType == ActionType.Stake || steps[i].actionType == ActionType.Unstake) {
                totalGas += stakingGas;
            } else {
                totalGas += perStepGas;
            }
        }
        
        return totalGas;
    }
    
    /**
     * @notice Get execution statistics
     * @return total Total execution attempts
     * @return successful Successful executions
     * @return failed Failed executions
     */
    function getExecutionStats() external view returns (uint256 total, uint256 successful, uint256 failed) {
        return (totalExecutions, successfulExecutions, failedExecutions);
    }
    
    /**
     * @notice Get execution success rate
     * @return successRate Success rate percentage (0-100)
     */
    function getSuccessRate() external view returns (uint256) {
        if (totalExecutions == 0) return 0;
        return (successfulExecutions * 100) / totalExecutions;
    }
}
