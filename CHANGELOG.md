# STELLAR RESOURCE USAGE CHANGELOG

## 1.1.3

### Patch Changes

- 34d291b: - Updated README file
  - Updated the result table layout and style.
  - Fixed some bugs.

## 1.1.2

### Patch Changes

- 75af27e: - Bug fixed and some miner change

## 1.1.1

### Patch Changes

- 798c176: - Updated the printTable function to support the avg

## 1.1.0

### Minor Changes

- 5b269e2: - Add `ResourceUsageClient` class for `Client` style contract call.

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

## 1.0.13

### Patch Changes

- a1030b9: - save the report image to public directory

## 1.0.12

### Patch Changes

- f4d6807: - updated the readme.md file

## 1.0.11

### Patch Changes

- 077989d: feat: add legend for result table
- 6ed8d1c: fix: update the value of `Ledger entry size (including Wasm entries) …

## 1.0.10

### Patch Changes

- c0e7f29: Updated the result table info

## 1.0.9

### Patch Changes

- dcf0cda: - Add units to result values
  - Set alarm parameters to be configurable
- 3c644d0: update readme & add deploy.example

## 1.0.8

### Patch Changes

- 94c4f8d: chore: arrange the order of fields

## 1.0.7

### Patch Changes

- 21f5066: feat: add ledger size field

## 1.0.6

### Patch Changes

- 466a328: custom localhost port
  update calcResource function
- b1565f0: style: updated the style of the results table

## 1.0.5

### Patch Changes

- 11f05ec: fix: fixed the issue with displaying message when exceeding limit

## 1.0.4

### Patch Changes

- 0dc2f5c: get limit data from diagnostic events
- 9b93102: - build: release
  - chore: updated the limits standard value
- 7b9bd07: refactor: updated some of the limits config value.
  - updated the validation content message.
  - updated the package version link.

## 1.0.3

### Patch Changes

- chore: updated the limits standard value

## 1.0.2

### Patch Changes

- d69c687: fix: fix the reference error and remove the unused function

## 1.0.1

### Patch Changes

- fc46826: docs: Add descriptions for resource limits
  feat: Calculate resource usage based on incoming transaction response and transaction

## 1.0.0

### Major Changes

- ef4adc2: [feat] initialize the project architecture

### Patch Changes

- - Show table style in the terminal
  - Updated README.md
