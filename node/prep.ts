import { Signer } from '../Signer.ts'
import { gethup } from './gethup.ts'
import { createGenesis } from './createGenesis.ts'
import { gethInit } from './gethInit.ts'
import { gethImport } from './gethImport.ts'

const secret = ''.padEnd(64, 'A')
const keyPath = Deno.makeTempFileSync()
Deno.writeTextFileSync(keyPath, secret)
const signer = new Signer({ secret })
const signers = [signer]
const chainId = 80
const genesisPath = 'genesis.json'
const dataDir = '.'
const gethDir = '.cache/geth'
const gethVersion = '1.13.8'
const gethPath = `${gethDir}/${gethVersion}`

await createGenesis(signers, chainId, genesisPath)
await gethup(gethVersion, gethDir)
await gethImport(gethPath, dataDir, keyPath)
await gethInit(dataDir, genesisPath, gethPath)