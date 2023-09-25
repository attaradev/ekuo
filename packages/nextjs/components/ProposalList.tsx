import { useEffect, useState } from "react";
import { Address } from "./scaffold-eth";
import { useWalletClient } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Proposal } from "~~/types/proposal";

export const ProposalList = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { data } = useScaffoldContractRead({
    contractName: "EkuoDAO",
    functionName: "getLatestProposals",
  });

  useEffect(() => {
    if (data) {
      setProposals(
        data.map(
          proposal =>
            ({
              id: proposal.id,
              title: proposal.title,
              description: proposal.description,
              proposer: proposal.proposer,
              deadline: proposal.deadline,
              executed: proposal.executed,
              target: proposal.target,
              value: proposal.value,
              supporters: [...proposal.supporters],
            } as Proposal),
        ),
      );
    } else {
      setProposals([]);
    }
  }, [data]);

  return (
    <div className="p-8">
      <h2 className="p-4 text-3xl font-bold">Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals</p>
      ) : (
        <div className="w-full join join-vertical">
          {proposals.map(proposal => (
            <ProposalListItem
              key={proposal.id.toString()}
              id={proposal.id}
              title={proposal.title}
              description={proposal.description}
              proposer={proposal.proposer}
              deadline={proposal.deadline}
              executed={proposal.executed}
              value={proposal.value}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProposalListItem = ({
  id,
  title,
  description,
  proposer,
  deadline,
  executed,
  value,
}: {
  id: bigint;
  title: string;
  description: string;
  proposer: string;
  deadline: bigint;
  executed: boolean;
  value: bigint;
}) => {
  const { data: walletClient } = useWalletClient();
  const { writeAsync: vote } = useScaffoldContractWrite({
    contractName: "EkuoDAO",
    functionName: "vote",
    args: [id, true],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });
  const { writeAsync: execute } = useScaffoldContractWrite({
    contractName: "EkuoDAO",
    functionName: "executeProposal",
    args: [id],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const isProposer = walletClient?.account.address === proposer;

  return (
    <div className="collapse collapse-plus bg-base-200">
      <input type="radio" name="my-accordion-3" defaultChecked />
      <div className="text-xl font-medium collapse-title">{title}</div>
      <div className="collapse-content">
        <div className="flex flex-col">
          <h3>Description:</h3>
          <p>{description}</p>
        </div>
        <div className="flex flex-col mb-5">
          Proposer: <Address address={proposer} />
        </div>
        <div className="flex flex-col">{`Amount: ${(Number(value) / 1e18).toFixed(4)} MATIC`}</div>
        <div className="flex flex-col">
          {`Deadline for voting: ${new Date(Date.now() + Number(deadline)).toUTCString()}`}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-3 py-4">
            {!isProposer && !executed && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  vote();
                }}
              >
                Vote
              </button>
            )}
            {!executed && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  execute();
                }}
              >
                Execute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
