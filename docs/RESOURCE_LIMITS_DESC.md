## Max CPU instructions per txn

```ts
eventBody.data()  which event topics equal to [ "core_metrics", "cpu_insn" ] 
```


## Memory limit per txn

```ts
eventBody.data()  which event topics equal to [ "core_metrics", "mem_byte" ]
```

## Ledger entry size (including Wasm entries) per txn
A limit on the `maximum` entry size （includes the ledger key）

```ts
// The  sum of ledgerEntryCreated and ledgerEntryUpdated event data

  const entries = tx.resultMetaXdr
    .v3()
    .operations()
    .flatMap((op) =>
      op.changes().flatMap((change) => {
        switch (change.switch().name) {
          case 'ledgerEntryCreated':
            return change.created().data().value().toXDR().length;
          case 'ledgerEntryUpdated':
            return change.updated().data().value().toXDR().length;
          default:
            return 0;
        }
      })
    );

  const entrySize = Math.max(...entries) ?? 0;
```



## Read ledger entries per txn

Read ledger entries per txn"" refers to the number of ledger entries that a transaction reads during its execution. 

This metric is particularly relevant when dealing with operations that require access to existing ledger entries, such as account information, balances, or, in the case of Soroban smart contracts, entries related to contract state.

```ts
transactionData.build().footprint().readOnly().length
```



## Write ledger entries per txn

"Write ledger entries per txn" refers to the number of ledger entries that are modified or created during the execution of a transaction. 

```ts
transactionData.build().footprint().readWrite().length
```



## Read bytes per txn

Read bytes per txn"" refers to the volume of data, measured in bytes, that a transaction reads from the ledger during its execution. 

This metric is important for understanding the data throughput and resource consumption associated with executing transactions, especially when working with complex smart contracts.

```ts
transactionData.build().resource().readBytes()

```



### Write bytes per txn

Write bytes per txn"" refers to the amount of data, measured in bytes, that a transaction writes to the ledger during its execution. 

This metric is particularly relevant for understanding how much new data or modified data is being added to the network as a result of a transaction.

After executing a transaction, the result typically includes metadata that outlines the changes made to the ledger. This information can be analyzed to determine how much data was written.

```ts
transactionData.build().resource().writeBytes()
```