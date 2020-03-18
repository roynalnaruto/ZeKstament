pragma solidity 0.5.11;


library AddressArrayUtils {

    function indexOf(address[] memory addresses, address a)
        internal
        pure
        returns (uint, bool)
    {
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }
}
