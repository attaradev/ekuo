export type Proposal = {
  id: bigint;
  proposer: string;
  title: string;
  description: string;
  target: string;
  value: bigint;
  executed: boolean;
  deadline: bigint;
  readonly supporters: string[];
};
