

[![NPM version](https://img.shields.io/npm/v/stellar-resource-usage)](https://www.npmjs.com/package/stellar-resource-usage) 
[![View changelog](https://img.shields.io/badge/Explore%20Changelog-brightgreen)](https://github.com/57blocks/stellar-resource-usage-report-private/blob/main/CHANGELOG.md)


# stellar-resource-usage

<p align="center">
Resource Usage Analytics for Stellar
</p>

# Resource Limits
[Resource limits description](https://github.com/57blocks/stellar-resource-usage-report-private/blob/main/docs/RESOURCE_LIMITS_DESC.md)

# Example Report
![image](https://github.com/57blocks/stellar-resource-usage-report-private/blob/main/public/report.png)

# Installation

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

Add the following to your contract:

```ts
import calcResource from "stellar-resource-usage"
```

Configuration:

```ts
const params: CalcResourceProps = {
  tx: tx,
  rpcServer: rpc,
  keypair: keypair,
}

calcResource(params)
```

If use `Client`:

```ts
import { Client, networks, scValToNative } from "path/to/client";
import { ResourceUsageClient } from 'stellar-resource-usage';
const _contract = ResourceUsageClient(Client, {
      contractId: networks.standalone.contractId,
      networkPassphrase: networks.standalone.networkPassphrase,
      rpcUrl: "http://localhost:8000/soroban/rpc",
      publicKey: pubkey, // process.env.SOROBAN_PUBLIC_KEY,
      allowHttp: true,
      signTransaction,
    });
```

# Usage

1. Make sure Docker Desktop is running on your system

2. Start the unlimited network simulator. Executing the code below will launch a [stellar/quickstart](https://github.com/stellar/quickstart) image. You can also customize your own image according to the *quickstart* if you want.

 _Note: Using npx requires you to install npm globally in advance, more info please refer to [npx](https://docs.npmjs.com/cli/v10/commands/npx)_

```sh
npx dockerDev [--port=your port]
```

3. Make sure you have seen a steady stream of *stellar-core: Synced!* logs in step 2. Deploy your contract once your local network is running. If you don’t know how to deploy a contract, you can check the [Stellar build doc](https://developers.stellar.org/docs/build/smart-contracts/getting-started) or the [deploy.example.ts](./deploy.example.ts) we provide for reference.

4. Use the simulator in your code:

```ts
+ import calcResource from "stellar-resource-usage";

import {
  Account,
  Keypair,
  Networks,
  Operation,
  rpc,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

// The port must be the same as dockerDev.
const rpcUrl = 'http://localhost:8000/rpc';
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

+ calcResource({
+   tx,
+   rpcServer,
+   keypair,
+ })
```


