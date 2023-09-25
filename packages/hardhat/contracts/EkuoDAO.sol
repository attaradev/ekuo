//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./EkuoToken.sol";

/**
 * A DAO smart contract for fostering prosperity in the Ekuo ecosystem
 * It also allows members to submit, vote on, and execute proposals
 * @title EkuoDAO
 * @dev This contract owns the EkuoToken contract
 * @author Mike Attara
 */
contract EkuoDAO {
	// Struct
	struct Proposal {
		uint256 id;
		string title;
		string description;
		address proposer;
		uint256 deadline;
		bool executed;
		address[] supporters;
		address target;
		uint256 value;
	}

	// Events
	event ProposalSubmitted(
		uint256 indexed id,
		string title,
		string description,
		uint256 indexed value,
		address indexed proposer,
		uint256 deadline
	);
	event ProposalExecuted(uint256 indexed id, address indexed executor);
	event Vote(
		uint256 indexed id,
		address indexed voter,
		bool indexed approved
	);

	// Constants
	uint256 private constant QUORUM = 50;
	uint256 private constant VOTING_PERIOD = 7 days;
	uint256 private constant MINIMUM_PROPOSAL_VALUE = 0.01 ether;
	uint256 private constant MAXIMUM_PROPOSAL_VALUE = 10 ether;
	// State variables
	address public immutable tokenAddress;
	uint256 public proposalCount;
	mapping(uint256 => Proposal) public proposals;
	mapping(address => mapping(uint256 => bool)) private hasVoted;

	// Modifiers
	modifier onlyMember() {
		require(isMember(msg.sender), "Not member");
		_;
	}

	/**
	 * Constructor function
	 * @dev Initializes the EkuoToken contract
	 * @dev Transfers 5 of them to the deployer
	 */
	constructor() {
		// Initialize EKUO tokens contract
		tokenAddress = address(new EkuoToken());
		// Transfer 5 EKUO tokens to the deployer
		EkuoToken(tokenAddress).transfer(msg.sender, 5 ether);
	}

	/**
	 * Function that allows a member to vote on a proposal
	 * @param id ID of the proposal
	 * @param approved true if the member approves the proposal, false otherwise
	 * @dev The member must not be the proposer
	 * @dev The proposal must not have expired
	 * @dev The member must not have voted before
	 * @dev Emits Vote event
	 */
	function vote(uint256 id, bool approved) external onlyMember {
		Proposal memory proposal = proposals[id];
		require(proposal.proposer != address(0), "Invalid proposal ID");
		require(proposal.proposer != msg.sender, "Proposer cannot vote");
		require(proposal.deadline > block.timestamp, "Proposal expired");
		require(!hasVoted[msg.sender][id], "Already voted");
		hasVoted[msg.sender][id] = true;
		if (approved) {
			proposals[id].supporters.push(msg.sender);
		}
		emit Vote(id, msg.sender, approved);
	}

	/**
	 * Function that allows a member to submit a proposal
	 * @param title Title of the proposal
	 * @param description Description of the proposal
	 * @param target Address of the account to which the ETH will be sent
	 * @param value Amount of ETH to be sent to the contract
	 * @dev The value must be greater than or equal to 1 ETH
	 * @dev The value must be less than or equal to 1000 ETH
	 * @dev Emits ProposalSubmitted event
	 */
	function submitProposal(
		string calldata title,
		string calldata description,
		address target,
		uint256 value
	) external onlyMember {
		require(target != address(0), "Invalid recipient");
		require(value >= MINIMUM_PROPOSAL_VALUE, "Amount too low");
		require(value <= MAXIMUM_PROPOSAL_VALUE, "Amount too high");
		proposalCount++;
		proposals[proposalCount] = Proposal(
			proposalCount,
			title,
			description,
			msg.sender,
			block.timestamp + VOTING_PERIOD,
			false,
			new address[](0),
			target,
			value
		);
		emit ProposalSubmitted(
			proposalCount,
			title,
			description,
			value,
			msg.sender,
			block.timestamp + VOTING_PERIOD
		);
	}

	/**
	 * Function that allows a member to execute a proposal
	 * @param id ID of the proposal
	 * @dev The proposal must not have been executed before
	 * @dev The proposal must have passed quorum
	 * @dev Emits ProposalExecuted event
	 */
	function executeProposal(uint256 id) external onlyMember {
		Proposal memory proposal = proposals[id];
		require(proposal.proposer != address(0), "Invalid proposal ID");
		require(!proposal.executed, "Proposal already executed");
		uint256 totalVotes = EkuoToken(tokenAddress).totalSupply() -
			EkuoToken(tokenAddress).balanceOf(address(this));
		uint256 votes = EkuoToken(tokenAddress).balanceOf(proposal.proposer);
		for (uint256 i = 0; i < proposal.supporters.length; i++) {
			votes += EkuoToken(tokenAddress).balanceOf(proposal.supporters[i]);
		}
		require((votes * 100) / totalVotes >= QUORUM, "Quorum not reached");
		proposal.executed = true;
		(bool success, ) = proposal.target.call{ value: proposal.value }("");
		require(success, "Failed to execute proposal");
		emit ProposalExecuted(id, msg.sender);
	}

	/**
	 * Function that allows the caller to get a paginated list of proposals
	 * @param start The id of the first proposal
	 * @param limit The maximum number of proposals to return
	 * @param asc true if the proposals should be returned in ascending order, false otherwise
	 * @return _proposals A list of proposals
	 */
	function getPaginatedProposals(
		uint256 start,
		uint256 limit,
		bool asc
	) public view returns (Proposal[] memory _proposals) {
		require(start > 0, "Invalid start");
		require(limit > 0, "Invalid limit");
		require(start <= proposalCount, "Start exceeds proposal count");
		_proposals = new Proposal[](limit);
		uint256 index = 0;
		if (asc) {
			for (uint256 i = start; i <= proposalCount; i++) {
				_proposals[index] = proposals[i];
				index++;
				if (index == limit) {
					break;
				}
			}
		} else {
			for (uint256 i = proposalCount; i >= start; i--) {
				_proposals[index] = proposals[i];
				index++;
				if (index == limit) {
					break;
				}
			}
		}
		return _proposals;
	}

	/**
	 * Function that allows the caller to get a list of the last 10 proposals in descending order
	 * @return _proposals A list of the latest proposals
	 */
	function getLatestProposals()
		external
		view
		returns (Proposal[] memory _proposals)
	{
		if (proposalCount == 0) {
			return new Proposal[](0);
		}
		if (proposalCount <= 10) {
			return getPaginatedProposals(1, proposalCount, false);
		}
	}

	/**
	 * Function to check if an address is a member
	 * @param member Address of the member
	 * @return true if the address is a member, false otherwise
	 * @dev A member is an address that holds more than 0.0000000000000001 EKUO tokens
	 */
	function isMember(address member) public view returns (bool) {
		uint256 shares = getShares(member);
		return shares > 100;
	}

	/**
	 * Function to get the shares of a member
	 * @param member Address of the member
	 * @return shares The number of shares of the member
	 * @dev A member's shares is the number of EKUO tokens they hold
	 */
	function getShares(address member) public view returns (uint256 shares) {
		return EkuoToken(tokenAddress).balanceOf(member);
	}

	/**
	 * Function that allows the contract to receive ETH
	 * @dev This function is required for the contract to receive ETH
	 * @dev The contract will transfer the same amount of EKUO tokens to the sender
	 */
	receive() external payable {
		require(msg.value > 0, "No ETH sent");
		uint256 balance = EkuoToken(tokenAddress).balanceOf(address(this));
		require(balance >= msg.value, "Not enough EKUO tokens");
		EkuoToken(tokenAddress).transfer(msg.sender, msg.value);
	}
}
