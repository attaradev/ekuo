//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * A Token for managing the Ekuo DAO
 * It also allows members to submit and vote on proposals
 * @title EkuoToken
 * @dev Extends ERC20
 * @dev Uses OpenZeppelin's ERC20 contract
 */
contract EkuoToken is ERC20 {
	constructor() ERC20("Ekuo Token", "EKUO") {
		_mint(msg.sender, 100000000 * 10 ** decimals());
	}
}
