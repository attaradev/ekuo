import { useScaffoldContract } from "../scaffold-eth";
import { useWalletClient } from "wagmi";

export const useEkuoDAO = () => {
  const { data: walletClient } = useWalletClient();
  const { data: ekuo } = useScaffoldContract({
    contractName: "EkuoDAO",
    walletClient,
  });
  return { ekuo, address: walletClient?.account.address };
};
