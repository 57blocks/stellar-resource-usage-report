## Max CPU instructions per txn `cpu_insns`
This refers to the maximum number of CPU instructions allowed when executing smart contract transactions.
It limits the amount of computation that a contract can perform.

## Memory limit per txn `mem_bytes`

This refers to the maximum amount of memory allowed to be used when executing smart contract transactions.
It limits the memory space that a contract can use.

## Ledger entry size (including Wasm entries) per txn `entry_bytes`
A limit on the `maximum` entry size （includes the ledger key）

## Read ledger entries per txn `entry_reads`

Read ledger entries per txn"" refers to the number of ledger entries that a transaction reads during its execution. 

This metric is particularly relevant when dealing with operations that require access to existing ledger entries, such as account information, balances, or, in the case of Soroban smart contracts, entries related to contract state.

## Write ledger entries per txn `entry_writes`

"Write ledger entries per txn" refers to the number of ledger entries that are modified or created during the execution of a transaction. 

## Read bytes per txn `read_bytes`

Read bytes per txn"" refers to the volume of data, measured in bytes, that a transaction reads from the ledger during its execution. 

This metric is important for understanding the data throughput and resource consumption associated with executing transactions, especially when working with complex smart contracts.


## Write bytes per txn `write_bytes`

Write bytes per txn"" refers to the amount of data, measured in bytes, that a transaction writes to the ledger during its execution. 

This metric is particularly relevant for understanding how much new data or modified data is being added to the network as a result of a transaction.

After executing a transaction, the result typically includes metadata that outlines the changes made to the ledger. This information can be analyzed to determine how much data was written.

## Transaction size `min_txn_bytes`

This refers to the maximum amount of data that can be included in a single transaction.
It limits the complexity of operations that can be included in a transaction.

> For more information about the fields description, see the [steller-docs-issue](https://github.com/stellar/stellar-docs/issues/433).

