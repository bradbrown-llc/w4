import { Docker } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/docker@0.0.1/mod.ts'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import { Node, Signer } from '../mod.ts';
import { ExitHandlers } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/ExitHandlers@0.0.0/ExitHandlers.ts';

const root = new Signer({ secret: ''.padEnd(64, 'A') })

export class UniversalRouterNode extends Node {

    WETH9:{ address:string }
    UniswapV2Factory:{ address:string }
    UniswapV3Factory:{ address:string }
    UniversalRouter:{ address:string }

    constructor(rpc:string) {
        super(rpc)
        const fn = (n:bigint) => `0x${keccak256(encode([root.address, n])).slice(-40)}`
        this.WETH9 = { address: fn(0n) }
        this.UniswapV2Factory = { address: fn(1n) }
        this.UniswapV3Factory = { address: fn(2n) }
        this.UniversalRouter = { address: fn(3n) }
    }

    static async make(exitHandlers:ExitHandlers) {

        const id = await Docker.run('w4-universalrouter-node', exitHandlers)
        const inspection = await Docker.inspect(id)
        const ip = inspection.NetworkSettings.IPAddress
        const rpc = `http://${ip}`

        const node = new UniversalRouterNode(rpc)

        // poll every tenth of a second for 5 seconds
        // break if we get a nonce and it's 4 (UniversalRouter deployed)
        // if we're on the last iteration and it's not 4, throw whatever it is
        for (let i = 0; i < 5 / 0.1; i++) {
            const nonce = await node.nonce(root.address, 'latest').catch((e:Error) => e)
            if (typeof nonce == 'bigint' && nonce == 4n) break
            if (i == (5 / 0.1) - 1) throw nonce
            await new Promise(r => setTimeout(r, 1000 * 0.1))
        }

        return node

    }

}