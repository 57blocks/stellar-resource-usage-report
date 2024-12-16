# stellar-resource-usage (R&D stage)

> Note: **in the development stage, not yet available**

[![NPM version](https://img.shields.io/npm/v/stellar-resource-usage)](https://www.npmjs.com/package/stellar-resource-usage) 

# Summary

---

As a resource utilization tool based on Node.js, it allows developers to generate resources using the resource utilization tool for reference when writing tests.

# Example Report
![screenshot](https://github.com/57blocks/stellar-resource-usage-report-private/tree/main/mockups/report.png)

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

---

```ts
import calcResource from "stellar-resource-usage";

calcResource(sim: SorobanRpc.Api.SimulateTransactionSuccessResponse, tx?: SorobanRpc.Api.GetSuccessfulTransactionResponse)
```


