import { Horizon, Keypair, Networks } from '@stellar/stellar-sdk';
import { $ } from 'bun';

await $`bun rimraf target/wasm32-unknown-unknown/release .env.local packages`;
console.log('cleaned target');

// Make sure the port the same as the docker port.
const horizonUrl = 'http://localhost:8000';
const horizon = new Horizon.Server(horizonUrl, { allowHttp: true });

const keypair = Keypair.random();
const secret = keypair.secret();
const pubkey = keypair.publicKey();

try {
  await horizon.friendbot(pubkey).call();
} catch {
  throw new Error(
    `Issue with ${pubkey} account. Ensure you're running the \`./docker.sh\` network and have run \`bun run deploy.ts\` recently.`
  );
}

await $`stellar network add net57Blocks --rpc-url http://localhost:8000/rpc --network-passphrase ${Networks.STANDALONE}`;
await $`stellar keys add alice --secret-key`.env({ ...process.env, SOROBAN_SECRET_KEY: secret });

await $`stellar contract build`;
await $`stellar contract optimize --wasm target/wasm32-unknown-unknown/release/resource_usage.wasm`;

const contractIdBlob =
  await $`stellar contract deploy --wasm target/wasm32-unknown-unknown/release/resource_usage.optimized.wasm --source alice --network net57Blocks`;
const contractId = contractIdBlob.text().replace(/\W/g, '');

if (!contractId) {
  throw new Error('Contract not deployed');
}
const init = await $`stellar contract invoke --id ${contractId} --network net57Blocks --source alice -- init`.quiet();

if (init.exitCode === 0) {
  console.log('initialized contract');
}

let file = ``;
file += `CONTRACT_ID=${contractId}\n`;
file += `SECRET=${secret}`;

await Bun.write('.env.local', file);
// You can import Client from './packages/typescriptBinding'.
await $`stellar contract bindings typescript \
  --network net57Blocks \
  --contract-id ${contractId} \
  --output-dir packages/typescriptBinding`;
console.log('✅');
