import { useEffect, useState } from "react";
import { useScaffoldContractRead } from "../scaffold-eth";

export const useShares = (address?: string) => {
  const [shares, setShares] = useState(0n);
  const { data } = useScaffoldContractRead({
    contractName: "EkuoDAO",
    functionName: "getShares",
    args: [address],
  });

  useEffect(() => {
    if (data) {
      setShares(data);
    } else {
      setShares(0n);
    }
  }, [data]);
  return Number(shares) / 1e18;
};
