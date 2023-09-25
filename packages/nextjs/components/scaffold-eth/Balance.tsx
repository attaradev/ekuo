import { useShares } from "~~/hooks/ekuo-dao";

type TBalanceProps = {
  address?: string;
  className?: string;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const Balance = ({ address, className = "" }: TBalanceProps) => {
  const shares = useShares(address);

  return (
    <div className={`${className} flex items-center justify-center w-full`}>
      <span>{shares.toFixed(4)}</span>
      <span className="text-[0.8em] font-bold ml-1">EKUO</span>
    </div>
  );
};
