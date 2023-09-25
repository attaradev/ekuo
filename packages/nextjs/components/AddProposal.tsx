import { useState } from "react";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const AddProposal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("");

  const { writeAsync: submitProposal } = useScaffoldContractWrite({
    contractName: "EkuoDAO",
    functionName: "submitProposal",
    args: [title, description, target, BigInt(Number(value) * 10 ** 18)],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <div className="p-8">
      <h2 className="p-4 text-3xl font-bold">Add Proposal</h2>
      <div className="flex-col gap-5 card w-96">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full max-w-xs input input-bordered"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full max-w-xs textarea textarea-bordered textarea-md"
        />
        <input
          type="text"
          placeholder="Target"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="w-full max-w-xs input input-bordered"
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full max-w-xs input input-bordered"
        />
        <button
          type="submit"
          className="w-full max-w-xs btn btn-primary"
          onClick={async e => {
            e.preventDefault();
            await submitProposal();
            setTitle("");
            setDescription("");
            setTarget("");
            setValue("");
          }}
        >
          Submit proposal
        </button>
      </div>
    </div>
  );
};
