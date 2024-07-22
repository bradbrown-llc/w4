// prepares geth to be run:
// 1 - creates a genesis json file
// 2 - acquires geth
// 3 - imports a signer/account
// 4 - initializes geth with the genesis and signer
// once prepared (which is done in a RUN statement in a dockerfile),
// geth can be run in one command (which is done in an ENTRYPOINT and/or CMD statement in a dockerfile)

import { Signer } from '../../Signer.ts'
import { gethup } from './gethup.ts'
import { createGenesis } from './createGenesis.ts'
import { gethInit } from './gethInit.ts'
import { gethImport } from './gethImport.ts'

const secret = ''.padEnd(64, 'A')
const keyPath = './key'
Deno.writeTextFileSync(keyPath, secret)
const signer = new Signer({ secret })
const signers = [signer]
const chainId = 8000
const genesisPath = 'genesis.json'
const dataDir = '.'
const gethDir = '.cache/geth'
const gethVersion = '1.13.8'
const gethPath = `${gethDir}/${gethVersion}`

await createGenesis(signers, chainId, genesisPath)
await gethup(gethVersion, gethDir)
await gethImport(gethPath, dataDir, keyPath)
await gethInit(dataDir, genesisPath, gethPath)