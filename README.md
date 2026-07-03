# Stellar Split Bill 

**Live Deployment:** [https://stela-mauve.vercel.app/](https://stela-mauve.vercel.app/)

## Project Description
Split Bill is a decentralized application built for the Stellar Frontend Challenge (Level 1). It acts as a precise, fractional bill-splitting tool on the Stellar Testnet. 

Instead of a basic "send/receive" interface, this app allows a user to input a total bill and the size of their party. The application mathematically derives the exact fractional XLM owed per person, builds the `Operation.payment` payload, and handles the XDR serialization and signing process via the Freighter wallet. It is built with a highly tactile, Neobrutalist UI and engineered with strict separation of blockchain logic from the React component tree.

## Screenshots
(public/)

## Setup Instructions (How to run locally)

### Prerequisites
* Node.js 18+
* [Freighter Wallet Extension](https://www.freighter.app/) installed in your browser.
* Freighter network set to **Testnet** (via the gear icon in the extension).

### Installation & Execution

1. **Clone the repository:**
git clone https://github.com/dexterhere-2k/stela.git
cd stela

2. **Install dependencies:**  
*(This project was scaffolded with pnpm, but npm or yarn will also work).*
pnpm install

3. **Run the local development server:**
pnpm dev
*Note: This project utilizes a custom next.config.mjs to polyfill native Node.js modules (fs, crypto) required by the Stellar SDK in the browser environment.*

4. **Open the App:**  
Navigate to http://localhost:3000 in your Freighter-enabled browser.

---

## Challenge Requirements Fulfilled

- **Wallet Setup:** Deep integration with the Freighter browser extension.
- **Wallet Connection:** Clean connect/disconnect lifecycle managed via a custom React hook (useStellarWallet).
- **Balance Handling:** Queries the Horizon REST API to fetch and render the connected wallet's native XLM balance.
- **Transaction Flow:** Mathematically derives exact split amounts, constructs the payload, and manages the signing pipeline.
- **Development Standards:** Implements a strict service-layer architecture (services/stellar.ts), robust error interception for user cancellations, and animated UI loading/success states.

## Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Blockchain SDK:** @stellar/stellar-sdk, @stellar/freighter-api
* **Styling:** Tailwind CSS (Custom Neobrutalist design system)
* **Motion:** Framer Motion (Hardware-accelerated micro-interactions)
