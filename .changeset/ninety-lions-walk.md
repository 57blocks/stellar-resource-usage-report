---
'stellar-resource-usage': minor
---

- Add `ResourceUsageClient` class for `Client` style contract call.

```
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
