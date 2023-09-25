import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { AddProposal } from "~~/components/AddProposal";
import { MetaHeader } from "~~/components/MetaHeader";
import { ProposalList } from "~~/components/ProposalList";
import { Address } from "~~/components/scaffold-eth";
import { useEkuoDAO, useIsMember } from "~~/hooks/ekuo-dao";

const Home: NextPage = () => {
  const isMember = useIsMember();
  const { data: walletClient } = useWalletClient();
  const { ekuo } = useEkuoDAO();

  return (
    <>
      <MetaHeader />
      {isMember && walletClient ? (
        <div className="flex">
          <ProposalList />
          <AddProposal />
        </div>
      ) : (
        <div className="p-5">
          <p>You are not a member of EkuoDAO</p>
          <p>Please join the DAO to view proposals</p>
          <div className="flex">
            Send MATIC to the EkuoDAO Smart Contract <Address address={ekuo?.address} /> to join
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
