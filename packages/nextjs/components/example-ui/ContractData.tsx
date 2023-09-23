import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

const MARQUEE_PERIOD_IN_SEC = 5;

export const ContractData = () => {
  const { address } = useAccount();
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  useScaffoldEventSubscriber({
    contractName: "EkuoDAO",
    eventName: "ProposalSubmitted",
    listener: logs => {
      logs.map(log => {
        const { id, title, proposer, description, deadline } = log.args;
        console.log("📡 ProposalSubmitted event", id, title, description, deadline, proposer);
      });
    },
  });

  const {
    data: myGreetingChangeEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "EkuoDAO",
    eventName: "Vote",
    fromBlock: process.env.NEXT_PUBLIC_DEPLOY_BLOCK ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) : 0n,
    filters: { voter: address },
    blockData: true,
  });

  console.log("Events:", isLoadingEvents, errorReadingEvents, myGreetingChangeEvents);

  const { data: yourContract } = useScaffoldContract({ contractName: "EkuoDAO" });
  console.log("yourContract: ", yourContract);

  useEffect(() => {
    if (transitionEnabled && containerRef.current && greetingRef.current) {
      setMarqueeSpeed(
        Math.max(greetingRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
      );
    }
  }, [transitionEnabled, containerRef, greetingRef]);

  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div
        className={`flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full ${
          transitionEnabled ? "animate-pulse" : ""
        }`}
      >
        <div className="flex justify-between w-full">
          <button
            className="btn btn-circle btn-ghost relative bg-center bg-[url('/assets/switch-button-on.png')] bg-no-repeat"
            onClick={() => {
              setTransitionEnabled(!transitionEnabled);
            }}
          >
            <div
              className={`absolute inset-0 bg-center bg-no-repeat bg-[url('/assets/switch-button-off.png')] transition-opacity ${
                transitionEnabled ? "opacity-0" : "opacity-100"
              }`}
            />
          </button>
          <div className="flex border bg-secondary border-primary rounded-xl">
            <div className="flex items-end p-2 py-1 border-r border-primary">Total count</div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">{"0"}</div>
          </div>
        </div>

        <div className="mt-3 border border-primary bg-neutral rounded-3xl text-secondary  overflow-hidden text-[116px] whitespace-nowrap w-full uppercase tracking-tighter font-bai-jamjuree leading-tight">
          <div className="relative overflow-x-hidden" ref={containerRef}>
            {/* for speed calculating purposes */}
            <div className="absolute -left-[9999rem]" ref={greetingRef}>
              <div className="px-4">{"0"}</div>
            </div>
            {new Array(3).fill("").map((_, i) => {
              const isLineRightDirection = i % 2 ? isRightDirection : !isRightDirection;
              return (
                <Marquee
                  key={i}
                  direction={isLineRightDirection ? "right" : "left"}
                  gradient={false}
                  speed={marqueeSpeed}
                  className={i % 2 ? "-my-10" : ""}
                >
                  <div className="px-4">{" "}</div>
                </Marquee>
              );
            })}
          </div>
        </div>

        <div className="flex items-end justify-between mt-3">
          <button
            className={`btn btn-circle btn-ghost border border-primary hover:border-primary w-12 h-12 p-1 bg-neutral flex items-center ${
              isRightDirection ? "justify-start" : "justify-end"
            }`}
            onClick={() => {
              if (transitionEnabled) {
                setIsRightDirection(!isRightDirection);
              }
            }}
          >
            <div className="w-2 h-2 border rounded-full border-primary bg-secondary" />
          </button>
          <div className="w-44 p-0.5 flex items-center bg-neutral border border-primary rounded-full">
            <div
              className="h-1.5 border border-primary rounded-full bg-secondary animate-grow"
              style={{ animationPlayState: "paused" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
