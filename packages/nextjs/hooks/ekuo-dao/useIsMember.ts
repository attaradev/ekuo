import { useEffect, useState } from "react";
import { useEkuoDAO } from "./useEkuoDAO";

export const useIsMember = () => {
  const { ekuo, address } = useEkuoDAO();
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!ekuo || !address) {
      setIsMember(false);
    } else ekuo.read.isMember([address]).then(setIsMember);
  }, [ekuo, address]);
  return isMember;
};
