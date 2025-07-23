// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TipProtocol is ReentrancyGuard, Ownable, Pausable {
    // Events
    event TipSent(
        address indexed tipper,
        address indexed creator,
        address indexed token,
        uint256 amount,
        string message,
        string creatorTwitterHandle
    );

    event CreatorRegistered(
        address indexed creator,
        string twitterHandle,
        uint256 timestamp
    );

    event TipperRegistered(
        address indexed tipper,
        string twitterHandle,
        uint256 timestamp
    );

    event UserRegistered(
        address indexed user,
        string twitterHandle,
        bool asCreator,
        bool asTipper,
        uint256 timestamp
    );

    event BalanceDeposited(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    event BalanceWithdrawn(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    event OperatorAuthorized(
        address indexed user,
        address indexed operator,
        uint256 dailyLimit
    );
    
    event OperatorRevoked(address indexed user, address indexed operator);

    // Structs
    struct Creator {
        string twitterHandle;
        bool isRegistered;
        uint256 totalTipsReceived;
        uint256 tipCount;
        uint256 registeredAt;
    }

    struct TipperProfile {
        string twitterHandle;
        bool isRegistered;
        uint256 totalTipped;
        uint256 tipsSent;
        uint256 registeredAt;
        bool isActive;
    }

    // Unified User Profile - can be both creator and tipper
    struct UserProfile {
        string twitterHandle;
        bool isCreator;
        bool isTipper;
        uint256 totalTipsReceived;
        uint256 tipCountReceived;
        uint256 totalTipped;
        uint256 tipsSent;
        uint256 registeredAt;
        bool isActive;
    }

    // State variables - Legacy mappings for backward compatibility
    mapping(address => Creator) public creators;
    mapping(string => address) public twitterToAddress; // twitter handle => creator address
    mapping(address => TipperProfile) public tippers;
    mapping(string => address) public twitterToTipper; // twitter handle => tipper address
    mapping(address => string) public tipperToTwitter; // reverse mapping

    // NEW: Unified user system
    mapping(address => UserProfile) public users;
    mapping(string => address) public twitterToUser; // twitter handle => user address

    // Balance and token management
    mapping(address => mapping(address => uint256)) public balances; // user => token => balance
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    // Platform fee management
    uint256 public platformFeeRate = 200; // 2% in basis points
    mapping(address => uint256) public collectedFees; // token => amount

    // Wallet abstraction - authorized operators
    mapping(address => mapping(address => bool)) public authorizedOperators; // user => operator => authorized
    mapping(address => uint256) public spendingLimits; // user => daily limit in USD equivalent
    mapping(address => uint256) public dailySpent; // user => amount spent today
    mapping(address => uint256) public lastSpendingReset; // user => timestamp

    // Constants
    uint256 public constant MAX_PLATFORM_FEE = 500; // 5% max
    uint256 public constant DAILY_SPENDING_LIMIT = 1000e18; // $1000 default limit

    constructor() Ownable(msg.sender) {
        // Add ETH as default supported token (address(0) represents ETH)
        supportedTokens[address(0)] = true;
        tokenList.push(address(0));
    }

    // Modifiers
    modifier onlyRegisteredCreator() {
        require(
            users[msg.sender].isCreator || creators[msg.sender].isRegistered, 
            "Not a registered creator"
        );
        _;
    }

    modifier onlyRegisteredTipper() {
        require(
            users[msg.sender].isTipper || tippers[msg.sender].isRegistered, 
            "Not a registered tipper"
        );
        _;
    }

    modifier validTwitterHandle(string memory handle) {
        require(
            bytes(handle).length > 0 && bytes(handle).length <= 50,
            "Invalid twitter handle"
        );
        _;
    }

    // ========== UNIFIED REGISTRATION SYSTEM ==========

    /**
     * @dev Register as both creator and tipper with one function
     */
    function registerUser(
        string memory twitterHandle,
        bool asCreator,
        bool asTipper
    ) external validTwitterHandle(twitterHandle) {
        require(asCreator || asTipper, "Must register as creator or tipper");
        require(!users[msg.sender].isActive, "User already registered");
        require(
            twitterToUser[twitterHandle] == address(0) &&
            twitterToAddress[twitterHandle] == address(0) &&
            twitterToTipper[twitterHandle] == address(0),
            "Twitter handle already taken"
        );

        users[msg.sender] = UserProfile({
            twitterHandle: twitterHandle,
            isCreator: asCreator,
            isTipper: asTipper,
            totalTipsReceived: 0,
            tipCountReceived: 0,
            totalTipped: 0,
            tipsSent: 0,
            registeredAt: block.timestamp,
            isActive: true
        });

        twitterToUser[twitterHandle] = msg.sender;

        // Also populate legacy mappings for backward compatibility
        if (asCreator) {
            creators[msg.sender] = Creator({
                twitterHandle: twitterHandle,
                isRegistered: true,
                totalTipsReceived: 0,
                tipCount: 0,
                registeredAt: block.timestamp
            });
            twitterToAddress[twitterHandle] = msg.sender;
        }

        if (asTipper) {
            tippers[msg.sender] = TipperProfile({
                twitterHandle: twitterHandle,
                isRegistered: true,
                totalTipped: 0,
                tipsSent: 0,
                registeredAt: block.timestamp,
                isActive: true
            });
            twitterToTipper[twitterHandle] = msg.sender;
            tipperToTwitter[msg.sender] = twitterHandle;
        }

        emit UserRegistered(msg.sender, twitterHandle, asCreator, asTipper, block.timestamp);
    }

    /**
     * @dev Register as creator only (backward compatibility)
     */
    function registerCreator(
        string memory twitterHandle
    ) external validTwitterHandle(twitterHandle) {
        require(!users[msg.sender].isActive, "User already registered");
        require(!creators[msg.sender].isRegistered, "Already registered as creator");
        require(
            twitterToAddress[twitterHandle] == address(0) && 
            twitterToUser[twitterHandle] == address(0) &&
            twitterToTipper[twitterHandle] == address(0),
            "Twitter handle already taken"
        );

        // Register in both old and new systems for backward compatibility
        creators[msg.sender] = Creator({
            twitterHandle: twitterHandle,
            isRegistered: true,
            totalTipsReceived: 0,
            tipCount: 0,
            registeredAt: block.timestamp
        });
        twitterToAddress[twitterHandle] = msg.sender;

        users[msg.sender] = UserProfile({
            twitterHandle: twitterHandle,
            isCreator: true,
            isTipper: false,
            totalTipsReceived: 0,
            tipCountReceived: 0,
            totalTipped: 0,
            tipsSent: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        twitterToUser[twitterHandle] = msg.sender;

        emit CreatorRegistered(msg.sender, twitterHandle, block.timestamp);
    }

    /**
     * @dev Register as tipper only
     */
    function registerTipper(string memory twitterHandle) external validTwitterHandle(twitterHandle) {
        require(!users[msg.sender].isActive, "User already registered");
        require(tippers[msg.sender].registeredAt == 0, "Already registered as tipper");
        require(
            twitterToTipper[twitterHandle] == address(0) && 
            twitterToUser[twitterHandle] == address(0) &&
            twitterToAddress[twitterHandle] == address(0),
            "Twitter handle already taken"
        );

        // Register in both old and new systems for backward compatibility
        tippers[msg.sender] = TipperProfile({
            twitterHandle: twitterHandle,
            isRegistered: true,
            totalTipped: 0,
            tipsSent: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        twitterToTipper[twitterHandle] = msg.sender;
        tipperToTwitter[msg.sender] = twitterHandle;

        users[msg.sender] = UserProfile({
            twitterHandle: twitterHandle,
            isCreator: false,
            isTipper: true,
            totalTipsReceived: 0,
            tipCountReceived: 0,
            totalTipped: 0,
            tipsSent: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        twitterToUser[twitterHandle] = msg.sender;

        emit TipperRegistered(msg.sender, twitterHandle, block.timestamp);
    }

    /**
     * @dev Add creator role to existing tipper
     */
    function becomeCreator() external {
        require(users[msg.sender].isActive, "Must be registered first");
        require(users[msg.sender].isTipper, "Must be registered tipper first");
        require(!users[msg.sender].isCreator, "Already a creator");
        
        users[msg.sender].isCreator = true;
        
        // Also update legacy creator mapping
        creators[msg.sender] = Creator({
            twitterHandle: users[msg.sender].twitterHandle,
            isRegistered: true,
            totalTipsReceived: users[msg.sender].totalTipsReceived,
            tipCount: users[msg.sender].tipCountReceived,
            registeredAt: block.timestamp
        });
        twitterToAddress[users[msg.sender].twitterHandle] = msg.sender;

        emit CreatorRegistered(msg.sender, users[msg.sender].twitterHandle, block.timestamp);
    }

    /**
     * @dev Add tipper role to existing creator
     */
    function becomeTipper() external {
        require(users[msg.sender].isActive, "Must be registered first");
        require(users[msg.sender].isCreator, "Must be registered creator first");
        require(!users[msg.sender].isTipper, "Already a tipper");
        
        users[msg.sender].isTipper = true;
        
        // Also update legacy tipper mapping
        tippers[msg.sender] = TipperProfile({
            twitterHandle: users[msg.sender].twitterHandle,
            isRegistered: true,
            totalTipped: users[msg.sender].totalTipped,
            tipsSent: users[msg.sender].tipsSent,
            registeredAt: block.timestamp,
            isActive: true
        });
        twitterToTipper[users[msg.sender].twitterHandle] = msg.sender;
        tipperToTwitter[msg.sender] = users[msg.sender].twitterHandle;

        emit TipperRegistered(msg.sender, users[msg.sender].twitterHandle, block.timestamp);
    }

    // ========== TIPPING FUNCTIONS ==========

    /**
     * @dev Tip a creator - now anyone can tip, but registered tippers get benefits
     */
    function tipCreator(
        string memory creatorTwitterHandle,
        address token,
        uint256 amount,
        string memory message
    ) external nonReentrant whenNotPaused {
        _processTip(msg.sender, creatorTwitterHandle, token, amount, message);
    }

    /**
     * @dev Tip on behalf of user (for gasless transactions)
     */
    function tipCreatorFor(
        address tipper,
        string memory creatorTwitterHandle,
        address token,
        uint256 amount,
        string memory message
    ) external nonReentrant whenNotPaused {
        require(
            authorizedOperators[tipper][msg.sender],
            "Not authorized operator"
        );
        _checkSpendingLimit(tipper, amount);
        _processTip(tipper, creatorTwitterHandle, token, amount, message);
    }

    /**
     * @dev Internal tip processing logic - updated to handle unified system
     */
    function _processTip(
        address tipper,
        string memory creatorTwitterHandle,
        address token,
        uint256 amount,
        string memory message
    ) internal {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");

        // Find creator in unified system first, then legacy
        address creatorAddress = twitterToUser[creatorTwitterHandle];
        if (creatorAddress != address(0)) {
            require(users[creatorAddress].isCreator, "User is not a creator");
        } else {
            // Fall back to legacy creator system
            creatorAddress = twitterToAddress[creatorTwitterHandle];
            require(creatorAddress != address(0), "Creator not found");
        }
        
        require(creatorAddress != tipper, "Cannot tip yourself");
        require(balances[tipper][token] >= amount, "Insufficient balance");

        // Calculate fees - registered tippers might get fee discounts
        uint256 platformFee = _calculatePlatformFee(tipper, amount);
        uint256 creatorAmount = amount - platformFee;

        // Update balances
        balances[tipper][token] -= amount;
        balances[creatorAddress][token] += creatorAmount;
        collectedFees[token] += platformFee;

        // Update creator stats in both systems
        if (users[creatorAddress].isCreator) {
            users[creatorAddress].totalTipsReceived += creatorAmount;
            users[creatorAddress].tipCountReceived++;
        }
        if (creators[creatorAddress].isRegistered) {
            creators[creatorAddress].totalTipsReceived += creatorAmount;
            creators[creatorAddress].tipCount++;
        }

        // Update tipper stats in both systems
        if (users[tipper].isTipper) {
            users[tipper].totalTipped += amount;
            users[tipper].tipsSent++;
        }
        if (tippers[tipper].isRegistered) {
            tippers[tipper].totalTipped += amount;
            tippers[tipper].tipsSent++;
            tippers[tipper].isActive = true;
        } else {
            // Create basic tipper profile for unregistered users in legacy system
            tippers[tipper].totalTipped += amount;
            tippers[tipper].tipsSent++;
            tippers[tipper].isActive = true;
        }

        emit TipSent(
            tipper,
            creatorAddress,
            token,
            creatorAmount,
            message,
            creatorTwitterHandle
        );
    }

    /**
     * @dev Calculate platform fee - registered tippers get discounts
     */
    function _calculatePlatformFee(address tipper, uint256 amount) internal view returns (uint256) {
        uint256 feeRate = platformFeeRate;
        
        // Give discount to registered tippers
        if (users[tipper].isTipper || tippers[tipper].isRegistered) {
            feeRate = (feeRate * 80) / 100; // 20% discount for registered tippers
        }
        
        return (amount * feeRate) / 10000;
    }

    // ========== BALANCE MANAGEMENT ==========

    /**
     * @dev Deposit tokens to balance
     */
    function depositToken(
        address token,
        uint256 amount
    ) external payable nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");

        if (token == address(0)) {
            // ETH deposit
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            // ERC20 deposit
            require(msg.value == 0, "No ETH should be sent for ERC20");
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        balances[msg.sender][token] += amount;

        emit BalanceDeposited(msg.sender, token, amount);
    }

    /**
     * @dev Deposit ETH to balance
     */
    function depositETH() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");

        balances[msg.sender][address(0)] += msg.value;

        emit BalanceDeposited(msg.sender, address(0), msg.value);
    }

    /**
     * @dev Withdraw tokens from balance
     */
    function withdrawToken(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        balances[msg.sender][token] -= amount;

        if (token == address(0)) {
            // ETH withdrawal
            payable(msg.sender).transfer(amount);
        } else {
            // ERC20 withdrawal
            IERC20(token).transfer(msg.sender, amount);
        }

        emit BalanceWithdrawn(msg.sender, token, amount);
    }

    // ========== WALLET ABSTRACTION ==========

    /**
     * @dev Authorize an operator for gasless transactions
     */
    function authorizeOperator(address operator, uint256 dailyLimit) external {
        authorizedOperators[msg.sender][operator] = true;
        spendingLimits[msg.sender] = dailyLimit > 0
            ? dailyLimit
            : DAILY_SPENDING_LIMIT;
        emit OperatorAuthorized(msg.sender, operator, dailyLimit);
    }

    /**
     * @dev Revoke operator authorization
     */
    function revokeOperator(address operator) external {
        authorizedOperators[msg.sender][operator] = false;
        emit OperatorRevoked(msg.sender, operator);
    }

    /**
     * @dev Check and update spending limits
     */
    function _checkSpendingLimit(address user, uint256 amount) internal {
        if (block.timestamp > lastSpendingReset[user] + 1 days) {
            dailySpent[user] = 0;
            lastSpendingReset[user] = block.timestamp;
        }

        require(
            dailySpent[user] + amount <= spendingLimits[user],
            "Daily spending limit exceeded"
        );
        dailySpent[user] += amount;
    }

    /**
     * @dev User authorizes bot as operator with default settings
     */
    function authorizeBot(address botOperator) external {
        authorizedOperators[msg.sender][botOperator] = true;
        spendingLimits[msg.sender] = DAILY_SPENDING_LIMIT;
        emit OperatorAuthorized(msg.sender, botOperator, DAILY_SPENDING_LIMIT);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        tokenList.push(token);
    }

    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        supportedTokens[token] = false;

        // Remove from tokenList array
        for (uint i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
    }

    /**
     * @dev Set platform fee rate
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_PLATFORM_FEE, "Fee rate too high");
        platformFeeRate = newRate;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees(address token) external onlyOwner {
        uint256 amount = collectedFees[token];
        require(amount > 0, "No fees to withdraw");

        collectedFees[token] = 0;

        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get unified user profile
     */
    function getUserProfile(address user) external view returns (
        string memory twitterHandle,
        bool isCreator,
        bool isTipper,
        uint256 totalTipsReceived,
        uint256 tipCountReceived,
        uint256 totalTipped,
        uint256 tipsSent,
        uint256 registeredAt
    ) {
        UserProfile memory profile = users[user];
        return (
            profile.twitterHandle,
            profile.isCreator,
            profile.isTipper,
            profile.totalTipsReceived,
            profile.tipCountReceived,
            profile.totalTipped,
            profile.tipsSent,
            profile.registeredAt
        );
    }

    /**
     * @dev Check if user can receive tips
     */
    function canReceiveTips(address user) external view returns (bool) {
        return users[user].isCreator || creators[user].isRegistered;
    }

    /**
     * @dev Check if user gets tipper benefits (fee discounts, etc.)
     */
    function hasRegisteredTipperBenefits(address user) external view returns (bool) {
        return users[user].isTipper || tippers[user].isRegistered;
    }

    /**
     * @dev Get user balance for a token
     */
    function getBalance(
        address user,
        address token
    ) external view returns (uint256) {
        return balances[user][token];
    }

    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @dev Get creator info by Twitter handle (backward compatibility)
     */
    function getCreatorByTwitter(
        string memory twitterHandle
    ) external view returns (address creatorAddress, Creator memory creator) {
        // Check unified system first
        creatorAddress = twitterToUser[twitterHandle];
        if (creatorAddress != address(0) && users[creatorAddress].isCreator) {
            // Convert unified profile to Creator struct for backward compatibility
            UserProfile memory profile = users[creatorAddress];
            creator = Creator({
                twitterHandle: profile.twitterHandle,
                isRegistered: true,
                totalTipsReceived: profile.totalTipsReceived,
                tipCount: profile.tipCountReceived,
                registeredAt: profile.registeredAt
            });
        } else {
            // Fall back to legacy system
            creatorAddress = twitterToAddress[twitterHandle];
            creator = creators[creatorAddress];
        }
    }

    /**
     * @dev Get creator stats (backward compatibility)
     */
    function getCreatorStats(
        address creator
    )
        external
        view
        returns (
            string memory twitterHandle,
            uint256 totalTipsReceived,
            uint256 tipCount,
            uint256 registeredAt
        )
    {
        if (users[creator].isCreator) {
            UserProfile memory profile = users[creator];
            return (
                profile.twitterHandle,
                profile.totalTipsReceived,
                profile.tipCountReceived,
                profile.registeredAt
            );
        } else {
            Creator memory c = creators[creator];
            return (
                c.twitterHandle,
                c.totalTipsReceived,
                c.tipCount,
                c.registeredAt
            );
        }
    }

    /**
     * @dev Get tipper stats
     */
    function getTipperStats(
        address tipper
    )
        external
        view
        returns (
            uint256 totalTipped,
            uint256 tipsSent,
            uint256 dailySpentAmount,
            uint256 dailyLimit
        )
    {
        if (users[tipper].isTipper) {
            UserProfile memory profile = users[tipper];
            return (
                profile.totalTipped,
                profile.tipsSent,
                dailySpent[tipper],
                spendingLimits[tipper]
            );
        } else {
            TipperProfile memory t = tippers[tipper];
            return (
                t.totalTipped,
                t.tipsSent,
                dailySpent[tipper],
                spendingLimits[tipper]
            );
        }
    }

    /**
     * @dev Get platform fee rate for a specific user (shows discount if applicable)
     */
    function getPlatformFeeRate(address user) external view returns (uint256) {
        if (users[user].isTipper || tippers[user].isRegistered) {
            return (platformFeeRate * 80) / 100; // 20% discount
        }
        return platformFeeRate;
    }

    /**
     * @dev Check if address is registered in any capacity
     */
    function isRegisteredUser(address user) external view returns (bool) {
        return users[user].isActive || creators[user].isRegistered || tippers[user].isRegistered;
    }
}