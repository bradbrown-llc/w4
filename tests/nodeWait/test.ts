import { Signer, Node } from '../../lib/mod.ts'

const root = new Signer({ secret: ''.padEnd(64, 'A') })
const target = new Signer({ secret: ''.padEnd(64, 'B') })
const node = await Node.make()

const chainId = await node.chainId()
const gasPrice = await node.gasPrice()

const signedTx = root.signTx({ nonce: 0n, gasPrice, gasLimit: 21000n, chainId, value: 100n, to: target.address })
const hash = await node.sendRawTx(signedTx)

console.log(await node.receipt(hash))

await node.wait(hash)

console.log(await node.receipt(hash))