import { useState } from "react";
import Mesh from "@martifylabs/mesh";
import { Button, Card, Codeblock } from "../../components";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/solid";

export default function SendAda() {
  return (
    <Card>
      <div className="grid gap-4 grid-cols-2">
        <div className="">
          <h3>Send some ADA to another address</h3>
          <p>Send ADA</p>
        </div>
        <div className="mt-8">
          <CodeDemo />
        </div>
      </div>
    </Card>
  );
}

function CodeDemo() {
  const [state, setState] = useState(0);
  const [result, setResult] = useState<null | string>(null);
  const [recipients, setRecipients] = useState([
    {
      address:
        "addr_test1qq5tay78z9l77vkxvrvtrv70nvjdk0fyvxmqzs57jg0vq6wk3w9pfppagj5rc4wsmlfyvc8xs7ytkumazu9xq49z94pqzl95zt",
      assets: {
        lovelace: 1500000,
      },
    },
  ]);

  function add() {
    let newRecipients = [...recipients];
    newRecipients.push({
      address: "",
      assets: {
        lovelace: 1000000,
      },
    });
    setRecipients(newRecipients);
  }

  function remove(index) {
    let newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  }

  function updateAddress(index, field, value) {
    let newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  }

  function updateAsset(index, assetId, value) {
    let newRecipients = [...recipients];
    newRecipients[index].assets[assetId] = value;
    setRecipients(newRecipients);
  }

  async function makeSimpleTransaction() {
    if (process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY === undefined) {
      throw "Need blockfrost API key";
    }

    setState(1);

    try {
      const tx = await Mesh.transaction.new({
        outputs: recipients,
        blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY,
        network: 0,
      });

      const signature = await Mesh.wallet.signTx({ tx });

      const txHash = await Mesh.wallet.submitTransaction({
        tx: tx,
        witnesses: [signature],
      });
      setResult(txHash);

      setState(2);
    } catch (error) {
      setResult(`${error}`);
      setState(0);
    }
  }

  return (
    <>
      <table className="border border-slate-300 w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              Address
            </th>
            <th scope="col" className="py-3 px-6">
              Lovelace
            </th>
            <th scope="col" className="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient, i) => {
            return (
              <tr
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                key={i}
              >
                <td className="py-4 px-4 w-3/4">
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded p-2 border focus:outline-none focus:border-blue-500"
                    placeholder="address"
                    onChange={(e) =>
                      updateAddress(i, "address", e.target.value)
                    }
                    value={recipient.address}
                  />
                </td>
                <td className="py-4 px-4 w-1/4">
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded p-2 border focus:outline-none focus:border-blue-500"
                    placeholder="lovelace"
                    onChange={(e) => updateAsset(i, "lovelace", e.target.value)}
                    value={recipient.assets.lovelace}
                  />
                </td>
                <td className="py-4 px-4">
                  <Button
                    onClick={() => remove(i)}
                    style="error"
                    disabled={state == 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="py-4 px-4" colSpan={3}>
              <Button
                onClick={() => add()}
                style="success"
                className="block w-full"
                disabled={state == 1}
              >
                <PlusCircleIcon className="m-0 mr-2 w-6 h-6" />
                <span>Add recipient</span>
              </Button>
            </td>
          </tr>
        </tbody>
      </table>

      <Codeblock
        data={`const recipients = ${JSON.stringify(recipients, null, 2)}}

const tx = await Mesh.transaction.new({
  outputs: recipients,
  blockfrostApiKey: "BLOCKFROST_API_KEY",
  network: 0, // 0 for testnet, 1 for mainnet
});

const signature = await Mesh.wallet.signTx({ tx });

const txHash = await Mesh.wallet.submitTransaction({
  tx: tx,
  witnesses: [signature],
});`}
        isJson={false}
      />

      <Button
        onClick={() => makeSimpleTransaction()}
        disabled={state == 1}
        style={state == 1 ? "warning" : state == 2 ? "success" : "light"}
      >
        Run code snippet
      </Button>

      {result && (
        <>
          <h4>Result</h4>
          <Codeblock data={result} />
        </>
      )}
    </>
  );
}