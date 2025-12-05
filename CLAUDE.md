# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster MiniApp template built with Next.js 16, OnchainKit, and the Farcaster SDK. It serves as a blank dApp template for building Web3 applications that can be published to the Base app and Farcaster ecosystem.

**Key Technologies:**

- Next.js 16.0.1 (App Router)
- OnchainKit (Coinbase's Web3 toolkit)
- Farcaster MiniApp SDK
- Wagmi & Viem for Web3 interactions
- TanStack React Query for state management
- TypeScript

## Development Commands

```bash
# Install dependencies (use bun only - not npm, yarn, or pnpm)
bun install

# Run development server (localhost:3000)
# Uses --webpack flag for Docker/Daytona compatibility with file polling
bun run dev

# Build for production
# Uses --webpack flag for consistent build process
bun run build

# Run production build locally
bun run start

# Lint code
bun run lint
```

**Package Manager:** This template uses Bun exclusively for faster installation and execution. Do not use other package managers (npm, yarn, pnpm) as they may result in different dependency resolutions. All dependencies are pinned to exact versions for reproducibility.

## Environment Variables

Required environment variables (create `.env.local`):

```bash
NEXT_PUBLIC_PROJECT_NAME="Your App Name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<CDP-API-KEY>
NEXT_PUBLIC_URL=<production-url>  # Leave empty for local dev
```

- Get CDP API Key from: https://portal.cdp.coinbase.com/
- `NEXT_PUBLIC_URL` should be your Vercel deployment URL in production

## Architecture

### Configuration & Manifest System

**`minikit.config.ts`** - Central configuration for Farcaster MiniApp manifest

- Defines app metadata (name, description, icons, screenshots)
- Configures `accountAssociation` for Farcaster verification (initially empty)
- Used by `app/.well-known/farcaster.json/route.ts` to generate the manifest endpoint
- Must follow Farcaster MiniApp specification

**Manifest Flow:**

1. `minikit.config.ts` exports config object
2. `app/.well-known/farcaster.json/route.ts` uses `withValidManifest()` to validate and serve manifest
3. `app/layout.tsx` uses config for metadata and OpenGraph tags
4. Farcaster reads manifest from `/.well-known/farcaster.json` endpoint

### Provider Architecture

**Root Provider (`app/rootProvider.tsx`):**

- Client-side only ("use client")
- Wraps entire app in `OnchainKitProvider`
- Configures chain (Base), wallet display, and MiniKit settings
- Enables MiniKit with `autoConnect: true` for Farcaster integration

**Layout Structure (`app/layout.tsx`):**

- Server component that generates dynamic metadata from `minikit.config.ts`
- Embeds Farcaster frame metadata in `fc:frame` meta tag for cast embeds
- Includes `SafeArea` component for mobile safe area handling
- Contains **required** `FloatingBanner` component (Vibe3 attribution - do not remove)

### Authentication Flow

**API Route: `app/api/auth/route.ts`**

- Uses `@farcaster/quick-auth` for JWT verification
- Verifies Bearer tokens from Farcaster MiniApp SDK
- `getUrlHost()` helper handles domain detection across environments (Vercel/local)
- Returns user's Farcaster ID (FID) from verified JWT payload
- Critical for authenticating users in Farcaster MiniApps

### Next.js Configuration

**`next.config.ts`:**

- **Docker/Daytona Compatibility:**
  - `turbopack: {}` - Empty config allows webpack to coexist (DO NOT REMOVE)
  - `devIndicators: false` - Disables dev overlay indicators
  - Webpack polling with `watchOptions` (1s interval) for file watching in containerized environments
- **MiniKit Externals:**
  - Externalizes `pino-pretty`, `lokijs`, `encoding` packages
  - Required for proper Web3 library compatibility
- **Usage:** All dev/build commands use `--webpack` flag explicitly (requires Next.js 16+)

**`tsconfig.json`:**

- Path alias: `@/*` maps to project root
- Target: ES2020 (required for BigInt literal support in Web3 development)
- Uses Next.js TypeScript plugin

## Deployment Workflow

### Initial Deployment

1. Deploy to Vercel: `vercel --prod`
2. Update `.env.local` with production URL
3. Upload environment variables to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_PROJECT_NAME production
   vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
   vercel env add NEXT_PUBLIC_URL production
   ```

### Account Association (Required for Farcaster)

1. Visit https://farcaster.xyz/~/developers/mini-apps/manifest
2. Enter your domain (e.g., `your-app.vercel.app`)
3. Generate and sign account association with Farcaster wallet
4. Copy the `accountAssociation` object to `minikit.config.ts`
5. Redeploy: `vercel --prod`

### Validation

- Preview app at: https://base.dev/preview
- Validate manifest, metadata, and account association
- Test launching the app before publishing to Farcaster

## Project Structure

```
app/
├── api/
│   └── auth/route.ts          # Farcaster JWT verification endpoint
├── .well-known/
│   └── farcaster.json/route.ts  # Manifest endpoint
├── components/
│   └── branding/
│       └── floating-banner.tsx  # Required Vibe3 attribution
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Main landing page (blank template)
├── rootProvider.tsx           # OnchainKit provider setup
└── globals.css               # Global styles

minikit.config.ts             # Farcaster MiniApp configuration
next.config.ts                # Next.js webpack config
```

## Important Notes

### Required Components

- **FloatingBanner** in `app/layout.tsx` must not be removed (Vibe3 attribution requirement)

### MiniKit Integration

- MiniKit is auto-enabled in `rootProvider.tsx` with `autoConnect: true`
- This allows automatic wallet connection within Farcaster apps
- The `SafeArea` component handles mobile notch/status bar spacing

### Manifest Updates

- Any changes to app metadata should be made in `minikit.config.ts`
- After updating manifest, always redeploy and revalidate at base.dev/preview
- Account association signature must match your deployed domain

### Web3 Configuration

- Default chain is Base (imported from wagmi/chains)
- OnchainKit handles wallet connection UI automatically
- Wallet display is set to "modal" mode with "all" wallets preference

## Publishing

To publish your MiniApp to Farcaster:

1. Ensure account association is configured and deployed
2. Create a post in the Base app containing your app's URL
3. The app will be embedded as a frame with launch button

## Adding OnchainKit Components

### Component Usage Guidelines

All OnchainKit components that use React hooks or state MUST be used in client components. Add `"use client"` directive at the top of any file using these components.

### Available Component Imports

OnchainKit 1.0.2 provides modular imports organized by feature:

```typescript
// Wallet components - connection, dropdown, management
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";

// Identity components - address, ENS names, avatars, balances
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";

// Transaction components - send tokens, contract interactions
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";

// Swap components - token swaps
import {
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
} from "@coinbase/onchainkit/swap";

// MiniKit components - Farcaster-specific features
import {
  SafeArea,
  useComposeCast,
  withValidManifest,
} from "@coinbase/onchainkit/minikit";
```

### Wallet Connection Example

See `app/examples/page.tsx` for a complete working example. Basic usage:

```typescript
"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Identity, Address } from "@coinbase/onchainkit/identity";

export function WalletButton() {
  return (
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
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
```

### Reading Contract Data

Use wagmi's `useReadContract` hook for reading blockchain data:

```typescript
"use client";

import { useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { useAccount } from "wagmi";

const contractAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

export function ContractReader() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: "0x...", // Contract address
    abi: contractAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Balance: {data?.toString()}</div>;
}
```

### Writing to Contracts

Use wagmi's `useWriteContract` hook for sending transactions:

```typescript
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

const contractAbi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

export function ContractWriter() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = () => {
    writeContract({
      address: "0x...", // Contract address
      abi: contractAbi,
      functionName: "transfer",
      args: ["0x...recipient", 1000000n], // Use BigInt for amounts
    });
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={isPending || isConfirming}>
        {isPending ? "Sending..." : isConfirming ? "Confirming..." : "Transfer"}
      </button>
      {isSuccess && <div>Transaction successful!</div>}
    </div>
  );
}
```

### Working with BigInt Values

Ethereum values are returned as BigInt. Convert for display:

```typescript
// ETH (18 decimals)
const ethAmount = Number(weiValue) / 1e18;

// USDC (6 decimals)
const usdcAmount = Number(usdcValue) / 1e6;

// When sending amounts, use BigInt:
const amount = 1000000n; // 1 USDC (6 decimals)
const ethAmount = parseEther("0.1"); // Use viem's parseEther for ETH
```

### Client vs Server Components

**Client Components (require `"use client"`)**:

- Components using OnchainKit UI components
- Components using wagmi hooks (`useAccount`, `useReadContract`, etc.)
- Components using React hooks (`useState`, `useEffect`, etc.)
- Event handlers and interactive elements

**Server Components (default)**:

- Static layouts
- Metadata generation
- API route handlers
- Data fetching without interactivity

## Troubleshooting

### Common Errors and Solutions

#### "Module not found" for OnchainKit imports

**Error:** `Module not found: Can't resolve '@coinbase/onchainkit/wallet'`

**Solution:**

1. Verify you're using OnchainKit 1.0.2 (check `package.json`)
2. Ensure imports match the version's API (see component imports above)
3. Run `bun install` to ensure dependencies are installed
4. Check that you're importing from the correct path (e.g., `/wallet`, `/identity`)

#### "React hooks" error in Server Component

**Error:** `Error: You're importing a component that needs [hook]. This only works in a Client Component`

**Solution:** Add `"use client"` directive at the top of your file:

```typescript
"use client";

import { useAccount } from "wagmi";
// ... rest of your component
```

#### TypeScript errors with React types

**Error:** `Type 'ReactNode' is not assignable to type 'ReactNode'`

**Solution:** This template uses React 19.1.1. If you see this error:

1. Ensure `react` and `react-dom` are both version `19.1.1` in `package.json`
2. Delete `node_modules` and `bun.lockb`
3. Run `bun install` to reinstall dependencies
4. The error usually comes from mixing React versions

#### Build fails with "use client" directive errors

**Error:** Build fails or components don't work as expected with client directive

**Solution:**

1. Ensure `"use client"` is the FIRST line in the file (before imports)
2. Check that all files using wagmi/OnchainKit hooks have the directive
3. Verify you're not trying to use client hooks in `layout.tsx` or server components

#### Peer dependency warnings

**Warning:** Peer dependency warnings about React 19 compatibility

**Solution:** You can safely ignore these warnings. The template uses React 19.1.1 and is fully functional. These warnings appear because some deep dependencies haven't updated their peer dependency declarations yet, but React 19 maintains backward compatibility.

### Debugging Tips

1. **Check versions:** Run `bun pm ls react` or check `package.json` to verify installed versions
2. **Clean install:** Delete `node_modules` and `bun.lockb`, then run `bun install`
3. **Build locally:** Run `bun run build` to catch errors before deploying
4. **Check browser console:** Many runtime errors appear in browser DevTools
5. **Verify wallet connection:** Use `useAccount()` hook to check connection state

### Getting Help

- **OnchainKit Docs:** https://onchainkit.xyz
- **Wagmi Docs:** https://wagmi.sh
- **Viem Docs:** https://viem.sh
- **Next.js App Router:** https://nextjs.org/docs/app

## Documentation References

- Farcaster MiniApp Spec: https://miniapps.farcaster.xyz/docs/guides/publishing
- OnchainKit Docs: https://onchainkit.xyz
- Base MiniApp Tutorial: https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/
- Wagmi Documentation: https://wagmi.sh
- Viem Documentation: https://viem.sh
