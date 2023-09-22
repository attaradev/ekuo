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

	// State variables
	uint256 private constant VOTING_PERIOD = 7 days;
	uint256 private constant MINIMUM_PROPOSAL_VALUE = 100 ether;
	uint256 private constant MAXIMUM_PROPOSAL_VALUE = 1000 ether;
	address public immutable tokenAddress;
	uint256 public quorum;
	Proposal[] public proposals;
	mapping(uint256 => mapping(address => bool)) public voted;

	// Modifiers
	modifier onlyMember() {
		require(
			EkuoToken(tokenAddress).balanceOf(msg.sender) > 100,
			"Not member"
		);
		_;
	}

	/**
	 * Constructor function
	 * @param _quorum Quorum percentage
	 * @dev Initializes the EkuoToken contract
	 * @dev Transfers 10,000 of them to the deployer
	 * @dev Sets the quorum percentage
	 */
	constructor(uint256 _quorum) {
		// Initialize EKUO tokens contract
		tokenAddress = address(new EkuoToken());
		// Transfer 10,000 EKUO tokens to the deployer
		EkuoToken(tokenAddress).transfer(msg.sender, 10000000 * 10 ** 18);
		quorum = _quorum;
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
		Proposal memory proposal = getProposal(id);
		require(proposal.proposer != msg.sender, "Proposer cannot vote");
		require(proposal.deadline > block.timestamp, "Proposal expired");
		require(!voted[id][msg.sender], "Already voted");
		voted[id][msg.sender] = true;
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
		proposals.push(
			Proposal({
				title: title,
				description: description,
				proposer: msg.sender,
				deadline: block.timestamp + VOTING_PERIOD,
				executed: false,
				supporters: new address[](0),
				target: target,
				value: value
			})
		);
		emit ProposalSubmitted(
			proposals.length,
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
		Proposal memory proposal = getProposal(id);
		require(!proposal.executed, "Proposal already executed");
		uint256 totalVotes = EkuoToken(tokenAddress).totalSupply();
		uint256 votes = EkuoToken(tokenAddress).balanceOf(proposal.proposer);
		for (uint256 i = 0; i < proposal.supporters.length; i++) {
			votes += EkuoToken(tokenAddress).balanceOf(proposal.supporters[i]);
		}
		require((votes * 100) / totalVotes >= quorum, "Quorum not reached");
		proposal.executed = true;
		(bool success, ) = proposal.target.call{ value: proposal.value }("");
		require(success, "Failed to execute proposal");
		emit ProposalExecuted(id, msg.sender);
	}

	/**
	 * Function that returns the number of proposals
	 * @return Number of proposals
	 */
	function proposalCount() external view returns (uint256) {
		return proposals.length;
	}

	/**
	 * Function that returns a proposal
	 * @param id ID of the proposal
	 * @return Proposal struct
	 * @dev It is not meant to be used by external callers
	 */
	function getProposal(uint256 id) internal view returns (Proposal memory) {
		require(id > 0 && id < proposals.length, "Invalid proposal ID");
		return proposals[id - 1];
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
