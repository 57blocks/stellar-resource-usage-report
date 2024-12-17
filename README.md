# stellar-resource-usage (R&D stage)

> Note: **in the development stage, not yet available**

[![NPM version](https://img.shields.io/npm/v/stellar-resource-usage)](https://www.npmjs.com/package/stellar-resource-usage) 

# Summary

---

As a resource utilization tool based on Node.js, it allows developers to generate resources using the resource utilization tool for reference when writing tests.

# Example Report
![image](https://private-user-images.githubusercontent.com/135803214/396377866-75fb1e64-a661-446b-8254-50a1f2ac7cec.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzQ0MjQ3OTUsIm5iZiI6MTczNDQyNDQ5NSwicGF0aCI6Ii8xMzU4MDMyMTQvMzk2Mzc3ODY2LTc1ZmIxZTY0LWE2NjEtNDQ2Yi04MjU0LTUwYTFmMmFjN2NlYy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMjE3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTIxN1QwODM0NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02ZGM0ODdkMWZjZTVmNzA1Yzg0YzM3YTc0MzJiMGQzNTI3MGJkZjlkNDZjYWUwMjA3OTNlZGFhNGE0NjAyMzY2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.Y1vJtaeCZ3E8OLlB6FGiHl8U5LEuMYnTkkWwpdF3Np8)

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

calcResource(sim: SorobanRpc.Api.SimulateTransactionSuccessResponse, tx?: SorobanRpc.Api.GetSuccessfulTransactionResponse)
```


