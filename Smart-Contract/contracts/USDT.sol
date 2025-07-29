// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title USDT Token Contract for Morph Holesky Testnet
 * @dev ERC20 token implementation with additional features like pause, burn, and minting
 */
contract USDT is ERC20, ERC20Burnable, Ownable, Pausable {
    uint8 private _decimals;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**6; // 1 billion USDT with 6 decimals
    
    // Events
    event Mint(address indexed to, uint256 amount);
    event BurnFrom(address indexed from, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _decimals = decimals_;
        
        // Mint initial supply to the owner
        if (initialSupply > 0) {
            require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
            _mint(initialOwner, initialSupply);
            emit Mint(initialOwner, initialSupply);
        }
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * Override the default 18 decimals to match USDT's 6 decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint new tokens - only owner can mint
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(to, amount);
        emit Mint(to, amount);
    }
    
    /**
     * @dev Batch mint to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Batch mint would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            _mint(recipients[i], amounts[i]);
            emit Mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Burn tokens from a specific address (owner only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public override onlyOwner {
        _spendAllowance(from, _msgSender(), amount);
        _burn(from, amount);
        emit BurnFrom(from, amount);
    }
    
    /**
     * @dev Pause all token transfers - emergency function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add pause functionality
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Airdrop tokens to multiple addresses
     * @param recipients Array of addresses to airdrop to
     * @param amount Amount of tokens to airdrop to each address
     */
    function airdrop(address[] calldata recipients, uint256 amount) external onlyOwner {
        require(recipients.length > 0, "Empty recipients array");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 totalAmount = recipients.length * amount;
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Airdrop would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot airdrop to zero address");
            _mint(recipients[i], amount);
            emit Mint(recipients[i], amount);
        }
    }
    
    /**
     * @dev Get contract information
     */
    function getContractInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        uint256 maxSupply,
        address contractOwner,
        bool isPaused
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY,
            owner(),
            paused()
        );
    }
    
    /**
     * @dev Emergency function to recover accidentally sent ERC20 tokens
     * @param token Address of the token to recover
     * @param amount Amount of tokens to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot recover own token");
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev Emergency function to recover accidentally sent ETH
     */
    function recoverETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to recover");
        payable(owner()).transfer(balance);
    }
}