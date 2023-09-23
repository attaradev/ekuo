import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex flex-col items-center flex-grow pt-10">
        <div className="px-5">
          <h1 className="mb-8 text-center">
            <span className="block mb-2 text-2xl">Welcome to</span>
            <span className="block text-4xl font-bold">Ekuo-DAO</span>
          </h1>
        </div>
      </div>
    </>
  );
};

export default Home;
