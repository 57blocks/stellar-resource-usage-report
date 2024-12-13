## Soroban txn per ledger

In the Stellar network, "Soroban txn per ledger" refers to the **maximum number** of Soroban transactions allowed per ledger. Soroban is the platform for smart contracts on the Stellar network. Smart contract transactions typically require more computational resources, so limiting the number of Soroban transactions per ledger is crucial to maintaining network performance and stability.



## Max CPU instructions per txn

```ts
eventBody.data()  which event topics equal to [ "core_metrics", "cpu_insn" ] 
```


## Memory limit per txn

```ts
eventBody.data()  which event topics equal to [ "core_metrics", "mem_byte" ]
```



## Ledger key size (contract storage key)


## Ledger entry size (including Wasm entries) per txn
A limit on the `maximum` entry size （includes the ledger key）

```
// The  maximun value of the flatten array: 
// and the size of WASM"

transactionData.getReadWrite().flatMap((rw) => rw.toXDR().length) + transactionData.getReadOnly().flatMap((ro) => ro.toXDR().length),
```



## Read ledger entries per txn

Read ledger entries per txn"" refers to the number of ledger entries that a transaction reads during its execution. 

This metric is particularly relevant when dealing with operations that require access to existing ledger entries, such as account information, balances, or, in the case of Soroban smart contracts, entries related to contract state.

```
transactionData.build().footprint().readOnly().length
```



## Write ledger entries per txn

"Write ledger entries per txn" refers to the number of ledger entries that are modified or created during the execution of a transaction. 

```
transactionData.build().footprint().readWrite().length
```



## Read bytes per txn

Read bytes per txn"" refers to the volume of data, measured in bytes, that a transaction reads from the ledger during its execution. 

This metric is important for understanding the data throughput and resource consumption associated with executing transactions, especially when working with complex smart contracts.

```
transactionData.build().resource().readBytes()

```



### Write bytes per txn

Write bytes per txn"" refers to the amount of data, measured in bytes, that a transaction writes to the ledger during its execution. 

This metric is particularly relevant for understanding how much new data or modified data is being added to the network as a result of a transaction.

After executing a transaction, the result typically includes metadata that outlines the changes made to the ledger. This information can be analyzed to determine how much data was written.

```
transactionData.build().resource().writeBytes()
```



## Transaction size



## Persistent entry minimal/initial lifetime



## Temporary entry minimal/initial lifetime



## Max ledger entry expiration bump



## Events+return value size bytes



## Max write bytes per ledger



## Max txs size in bytes per ledger



## Eviction scan size