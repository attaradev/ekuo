import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);

  return (
    <div className="min-h-0 px-1 py-5 mb-11 lg:mb-0">
      <div>
        <div className="fixed bottom-0 left-0 z-10 flex items-center justify-between w-full p-4 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div className="gap-0 font-normal cursor-auto btn btn-primary btn-sm">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            )}
            {getTargetNetwork().id === hardhat.id && <Faucet />}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
        <ul className="w-full menu menu-horizontal">
          <div className="flex items-center justify-center w-full gap-2 text-sm">
            <div>
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block w-4 h-4" /> by{" "}
                <a href="https://attara.dev/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Mike Attara
                </a>
              </p>
            </div>
            <span>·</span>
            <div className="text-center">
              <a
                href="https://linkedin.com/in/attara"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Connect
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
