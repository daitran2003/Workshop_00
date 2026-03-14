// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FLPCrowdSale is Ownable {
    using SafeERC20 for IERC20;

    address payable public wallet;           // Ví nhận ETH và USDT
    uint256 public ethRate;                  // Tỷ lệ quy đổi ETH => token
    uint256 public usdtRate;                 // Tỷ lệ quy đổi USDT => token
    IERC20 public token;                     // Token ICO sẽ phân phối
    IERC20 public usdtToken;                 // Token USDT

    event BuyTokenByETH(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event BuyTokenByUSDT(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount);
    event SetUSDTToken(IERC20 tokenAddress);
    event SetETHRate(uint256 newRate);
    event SetUSDTRate(uint256 newRate);

    constructor(
        uint256 _ethRate,
        uint256 _usdtRate,
        address payable _wallet,
        IERC20 _token,
        address _initialOwner
    ) Ownable(_initialOwner) {
        ethRate = _ethRate;
        usdtRate = _usdtRate;
        wallet = _wallet;
        token = _token;
    }

    function setUSDTToken(IERC20 token_address) external onlyOwner {
        usdtToken = token_address;
        emit SetUSDTToken(token_address);
    }

    function setETHRate(uint256 new_rate) external onlyOwner {
        ethRate = new_rate;
        emit SetETHRate(new_rate);
    }

    function setUSDTRate(uint256 new_rate) external onlyOwner {
        usdtRate = new_rate;
        emit SetUSDTRate(new_rate);
    }

    function buyTokenByETH() external payable {
        uint256 ethAmount = msg.value;
        uint256 amount = getTokenAmountETH(ethAmount);

        require(amount > 0, "Amount is zero");
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");

        wallet.transfer(ethAmount);
        token.safeTransfer(msg.sender, amount);

        emit BuyTokenByETH(msg.sender, ethAmount, amount);
    }

    function buyTokenByUSDT(uint256 usdtAmount) external {
        require(usdtToken.balanceOf(msg.sender) >= usdtAmount, "Insufficient USDT balance");

        uint256 amount = getTokenAmountUSDT(usdtAmount);
        require(amount > 0, "Amount is zero");
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");

        usdtToken.safeTransferFrom(msg.sender, wallet, usdtAmount);
        token.safeTransfer(msg.sender, amount);

        emit BuyTokenByUSDT(msg.sender, usdtAmount, amount);
    }

    function getTokenAmountETH(uint256 ethAmount) public view returns (uint256) {
        return ethAmount * ethRate;
    }

    function getTokenAmountUSDT(uint256 usdtAmount) public view returns (uint256) {
        return usdtAmount * usdtRate;
    }

    function withdrawETH() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawERC20(IERC20 erc20Token) external onlyOwner {
        uint256 balance = erc20Token.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        erc20Token.safeTransfer(msg.sender, balance);
    }
}