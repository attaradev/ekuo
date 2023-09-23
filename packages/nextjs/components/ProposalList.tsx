interface Proposal {
  id: bigint;
  title: string;
  description: string;
  proposer: string;
  deadline: bigint;
  executed: boolean;
  target: string;
  value: bigint;
}

export const ProposalList = ({ proposals }: { proposals: Proposal[] }) => {
  return (
    <div>
      {proposals.map(proposal => (
        <ProposalListItem key={proposal.id.toString()} proposal={proposal} />
      ))}
    </div>
  );
};

const ProposalListItem = ({ proposal }: { proposal: Proposal }) => {
  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="radio" name="my-accordion-2" checked />
      <div className="text-xl font-medium collapse-title">{proposal.title}</div>
      <div className="collapse-content">
        <div className="card w-96 bg-primary text-primary-content">
          <div className="card-body">
            <p>{proposal.description}</p>
            <p>Proposer: {proposal.proposer}</p>
            <p>Deadline: {Date.parse(proposal.deadline.valueOf().toString())}</p>
            <div className="justify-end card-actions">
              <button className="btn">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
