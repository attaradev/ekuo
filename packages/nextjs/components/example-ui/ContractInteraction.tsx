import { useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const ContractInteraction = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className="relative flex pb-10 bg-base-300">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
          <div className="z-0 flex gap-5 shadow-lg bg-base-200 bg-opacity-80 p-7 rounded-2xl">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                In this page you can see how some of our <strong>hooks & components</strong> work, and how you can bring
                them to life with your own design! Have fun and try it out!
              </div>
              <div className="mt-2">
                Check out{" "}
                <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem]">
                  packages / nextjs/pages / example-ui.tsx
                </code>{" "}
                and its underlying components.
              </div>
            </div>
          </div>
          <button
            className="z-0 w-6 h-6 min-h-0 btn btn-circle btn-ghost bg-base-200 bg-opacity-80 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col py-8 mt-6 border-2 shadow-lg px-7 bg-base-200 opacity-80 rounded-2xl border-primary">
          <span className="text-4xl text-black sm:text-6xl">Set a Greeting_</span>

          <div className="flex flex-col items-start gap-2 mt-8 sm:flex-row sm:items-center sm:gap-5">
            <input
              type="text"
              placeholder="Write your greeting here"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
            />
            <div className="flex flex-shrink-0 p-1 border rounded-full border-primary">
              <div className="flex p-1 border-2 rounded-full border-primary">
                <button className="flex items-center w-24 gap-1 font-normal tracking-widest capitalize transition-all rounded-full btn btn-primary font-white hover:gap-2"></button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-4">
            <span className="text-sm leading-tight">Price:</span>
            <div className="badge badge-warning">0.01 ETH + Gas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
