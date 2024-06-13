import { geth } from './geth.ts'
import { Signer } from '../../Signer.ts'

const secret = ''.padEnd(64, 'A')
const keyPath = Deno.makeTempFileSync()
Deno.writeTextFileSync(keyPath, secret)
const signer = new Signer({ secret })
const dataDir = '.'
const gethDir = '.cache/geth'
const gethVersion = '1.13.8'
const gethPath = `${gethDir}/${gethVersion}`
const port = 80

await geth(gethPath, dataDir, port, signer)