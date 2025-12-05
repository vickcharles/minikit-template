"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseAbi } from "viem";

// Example contract ABI for demonstration
const EXAMPLE_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
]);

export default function Examples() {
  const { address, isConnected } = useAccount();

  // Example: Read from a contract
  const { data: balance } = useReadContract({
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    abi: EXAMPLE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Example: Write to a contract
  const { writeContract, isPending } = useWriteContract();

  const handleTransfer = () => {
    if (!address) return;

    writeContract({
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      abi: EXAMPLE_ABI,
      functionName: "transfer",
      args: [address, 1000000n], // 1 USDC (6 decimals)
    });
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold mb-2">
          OnchainKit Component Examples
        </h1>
        <p className="text-gray-600">
          Reference implementations for building with OnchainKit in your MiniApp
        </p>
      </header>

      {/* Wallet Connection */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        <p className="text-sm text-gray-600 mb-4">
          The Wallet component provides a complete wallet connection UI with
          dropdown menu.
        </p>

        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownBasename />
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>

        <details className="mt-4">
          <summary className="text-sm font-medium cursor-pointer">
            View code
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
            {`import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

<Wallet>
  <ConnectWallet>
    <Avatar className="h-6 w-6" />
    <Name />
  </ConnectWallet>
  <WalletDropdown>
    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
      <Avatar />
      <Name />
      <Address />
      <EthBalance />
    </Identity>
    <WalletDropdownBasename />
    <WalletDropdownDisconnect />
  </WalletDropdown>
</Wallet>`}
          </pre>
        </details>
      </section>

      {/* Account Information */}
      {isConnected && address && (
        <section className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Account</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Address:</span>{" "}
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {address}
              </code>
            </p>
            <p className="text-sm">
              <span className="font-medium">Connection Status:</span>{" "}
              <span className="text-green-600">Connected</span>
            </p>
          </div>
        </section>
      )}

      {/* Contract Read Example */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Reading Contract Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            useReadContract
          </code>{" "}
          from wagmi to read data from smart contracts.
        </p>

        {isConnected && balance !== undefined ? (
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm">
              <span className="font-medium">USDC Balance:</span>{" "}
              {(Number(balance) / 1e6).toFixed(2)} USDC
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Connect wallet to see balance</p>
        )}

        <details className="mt-4">
          <summary className="text-sm font-medium cursor-pointer">
            View code
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
            {`import { useReadContract } from 'wagmi';
import { parseAbi } from 'viem';

const abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
]);

const { data: balance } = useReadContract({
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  abi,
  functionName: 'balanceOf',
  args: [address],
});

// balance is returned as bigint (wei), convert for display:
const usdcBalance = (Number(balance) / 1e6).toFixed(2);`}
          </pre>
        </details>
      </section>

      {/* Contract Write Example */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Writing to Contracts</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            useWriteContract
          </code>{" "}
          from wagmi to send transactions.
        </p>

        <button
          onClick={handleTransfer}
          disabled={!isConnected || isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isPending ? "Sending..." : "Send 1 USDC (Demo)"}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Note: This is a demo button. Clicking will prompt a transaction.
        </p>

        <details className="mt-4">
          <summary className="text-sm font-medium cursor-pointer">
            View code
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
            {`import { useWriteContract } from 'wagmi';
import { parseAbi } from 'viem';

const abi = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

const { writeContract, isPending } = useWriteContract();

const handleTransfer = () => {
  writeContract({
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    abi,
    functionName: 'transfer',
    args: [recipientAddress, 1000000n], // 1 USDC (6 decimals)
  });
};`}
          </pre>
        </details>
      </section>

      {/* Best Practices */}
      <section className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Always mark components using OnchainKit or wagmi hooks as{" "}
              <code className="bg-white px-1 py-0.5 rounded">"use client"</code>
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Check{" "}
              <code className="bg-white px-1 py-0.5 rounded">isConnected</code>{" "}
              before accessing{" "}
              <code className="bg-white px-1 py-0.5 rounded">address</code>
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Use{" "}
              <code className="bg-white px-1 py-0.5 rounded">parseAbi()</code>{" "}
              for simple ABIs, import full ABIs for complex contracts
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Handle loading and error states for contract interactions
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Convert BigInt values for display (
              <code className="bg-white px-1 py-0.5 rounded">
                Number(value) / 1e18
              </code>{" "}
              for ETH)
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
