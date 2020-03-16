pragma solidity 0.5.11;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract MockERC20Mintable is ERC20 {

    /// @dev Public function to mint new tokens
    /// @param _to Address that will receive newly minted tokens
    /// @param _value Amount of tokens to be minted
    /// @return Boolean that indicates if the operation executedg successfully
    function mint(address _to, uint256 _value) public returns (bool) {
        _mint(_to, _value);
        return true;
    }
}
