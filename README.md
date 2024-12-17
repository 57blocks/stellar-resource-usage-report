# stellar-resource-usage (R&D stage)

> Note: **in the development stage, not yet available**

[![NPM version](https://img.shields.io/npm/v/stellar-resource-usage)](https://www.npmjs.com/package/stellar-resource-usage) 

# Summary

---

As a resource utilization tool based on Node.js, it allows developers to generate resources using the resource utilization tool for reference when writing tests.

# Example Report
![image](/mockups/report.png)

# Installation

---

**npm**

```sh
npm i stellar-resource-usage
```

**pnpm**

```sh
pnpm add stellar-resource-usage
```

**bun**

```sh
bun add stellar-resource-usage
```

# Usage

1. Make sure Docker Desktop is running on your system
2. Start the unlimited network simulator:

 Note: Using npx requires you to install npm globally in advance, more info please refer to [npx](https://docs.npmjs.com/cli/v10/commands/npx)
```
npx run dockerDev [--port=your port]
```
3. Use the simulator in your code(make sure you have seen a steady stream of *stellar-core: Synced!* logs in step 2):

```ts
import calcResource from "stellar-resource-usage";
import {
  Account,
  Keypair,
  Networks,
  Operation,
  rpc,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

// The port must be the same as dockerDev.
const rpcUrl = 'http://localhost:8000/soroban/rpcServer';
const rpcServer = new rpc.Server(rpcUrl, { allowHttp: true });
const keypair = Keypair.fromSecret('your secret key');
const pubkey = keypair.publicKey();
const contractId = 'your contract id';
// It must be STANDALONE.
const networkPassphrase = Networks.STANDALONE; 

const source = await rpcServer
  .getAccount(pubkey)
  .then((account) => new Account(account.accountId(), account.sequenceNumber()))
  .catch(() => {
    throw new Error(
      `Issue with ${pubkey} account. Ensure you're running dockerDev`
    );
  });

// your custom array.
const args = []

const tx = new TransactionBuilder(source, {
  fee: '0',
  networkPassphrase,
})
  .addOperation(
    Operation.invokeContractFunction({
      contract: contractId,
      function: 'your function in contract',
      args,
    })
  )
  .setTimeout(0)
  .build();

calcResource({
  tx,
  rpcServer,
  keypair,
})
```


