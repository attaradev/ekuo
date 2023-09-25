import { useEffect, useState } from "react";
import { useEkuoDAO } from "./useEkuoDAO";
import { Proposal } from "~~/types/proposal";

export const useLatestProposals = () => {
  const { ekuo } = useEkuoDAO();
  const [latestProposals, setLatestProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!ekuo) {
      setLatestProposals([]);
    } else
      ekuo.read.getLatestProposals().then(
        (
          proposals: readonly {
            id: bigint;
            title: string;
            description: string;
            proposer: string;
            deadline: bigint;
            executed: boolean;
            supporters: readonly string[];
            target: string;
            value: bigint;
          }[],
        ) => setLatestProposals(proposals.map(proposal => ({ ...proposal, supporters: [...proposal.supporters] }))),
      );
  }, [ekuo]);

  return latestProposals;
};
