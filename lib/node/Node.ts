import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import { hexToBytes } from 'npm:@noble/hashes@1.3.3/utils'
import { Docker } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/docker@0.0.4/mod.ts'
import { ExitHandlers } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/exit-handlers@0.0.1/mod.ts'
import { Signer, ejra } from '../mod.ts'
const { methods } = ejra
type Tag = ejra.types.Tag
type TxCallObject = ejra.types.TxCallObject

// super basic wait fn, don't care about other wait fn's existing or concurrency
// poll at an interval, timeout if X amount of time occurs
async function defaultWaitFn(node:Node, hash:string) {
    const interval = 100
    const timeout = 5000
    const start = Date.now()
    while (true) {
        const receipt = await node.receipt(hash)
        if (receipt) return
        if (Date.now() - start >= timeout) throw new Error('w4_defaultWaitFn timeout')
        await new Promise(r => setTimeout(r, interval))
    }
}

export class Node {

    rpc:string
    balance:(address:string,tag:Tag)=>ReturnType<typeof methods.balance>
    call:(txCallObject:TxCallObject, tag:Tag)=>ReturnType<typeof methods.call>
    chainId:()=>ReturnType<typeof methods.chainId>
    code:(address:string,tag:Tag)=>ReturnType<typeof methods.code>
    clientVersion:()=>ReturnType<typeof methods.clientVersion>
    estimateGas:(txCallObject:Partial<TxCallObject>, tag:Tag)=>ReturnType<typeof methods.estimateGas>
    gasPrice:()=>ReturnType<typeof methods.gasPrice>
    height:()=>ReturnType<typeof methods.height>
    nonce:(address:string,tag:Tag)=>ReturnType<typeof methods.nonce>
    receipt:(hash:string)=>ReturnType<typeof methods.receipt>
    sendRawTx:(data:string)=>ReturnType<typeof methods.sendRawTx>
    slot:(address:string,slot:bigint,tag:Tag)=>ReturnType<typeof methods.slot>
    traceCall:(txCallObject:Partial<TxCallObject>, tag:Tag)=>ReturnType<typeof methods.traceCall>
    traceTx:(hash:string)=>ReturnType<typeof methods.traceTx>

    constructor(rpc:string) {
        this.rpc = rpc
        this.balance = (address:string, tag:Tag) => methods.balance(rpc, address, tag)
        this.call = (txCallObject:TxCallObject, tag:Tag) => methods.call(rpc, txCallObject, tag)
        this.chainId = () => methods.chainId(rpc)
        this.clientVersion = () => methods.clientVersion(rpc)
        this.code = (address:string, tag:Tag) => methods.code(rpc, address, tag)
        this.estimateGas = (txCallObject:Partial<TxCallObject>, tag:Tag) => methods.estimateGas(rpc, txCallObject, tag)
        this.gasPrice = () => methods.gasPrice(rpc)
        this.height = () => methods.height(rpc)
        this.nonce = (address:string, tag:Tag) => methods.nonce(rpc, address, tag)
        this.receipt = (hash:string) => methods.receipt(rpc, hash)
        this.sendRawTx = (data:string) => methods.sendRawTx(rpc, data)
        this.slot = (address:string, slot:bigint, tag:Tag) => methods.slot(rpc, address, slot, tag)
        this.traceCall = (txCallObject:Partial<TxCallObject>, tag:Tag) => methods.traceCall(rpc, txCallObject, tag)
        this.traceTx = (hash:string) => methods.traceTx(rpc, hash)
    }

    async wait(hash:string, waitFn:(node:Node,hash:string)=>Promise<void>=defaultWaitFn) {
        await waitFn(this, hash)
    }

    async deploy(signer:Signer, bytecode:string, args:string='') {
        const from = signer.address
        const input = `0x${bytecode}${args}`
        const nonce = await this.nonce(signer.address, 'latest')
        const gasLimit = await this.estimateGas({ from, input }, 'latest')
        const gasPrice = await this.gasPrice()
        const data = input
        const chainId = await this.chainId()
        const signedTx = signer.signTx({ gasLimit, gasPrice, data, nonce, chainId })
        const address = `0x${keccak256(encode([signer.address, nonce])).slice(-40)}`
        const hash = `0x${keccak256(hexToBytes(signedTx.slice(2)))}`
        const contract = { address, hash }
        this.sendRawTx(signedTx)
        await this.wait(contract.hash)
        return contract
    }

    static async make(exitHandlers:ExitHandlers) {

        const id = await Docker.run('w4-node', exitHandlers)
        const inspection = await Docker.inspect(id)
        const ip = inspection.NetworkSettings.IPAddress
        const rpc = `http://${ip}`

        const node = new Node(rpc)

        // poll every tenth of a second for 5 seconds, throwing error if we can't get height in 5 seconds
        for (let i = 0; i < 5 / 0.1; i++) {
            const height = await node.height().catch((e:Error) => e)
            if (typeof height == 'bigint') break
            if (i == (5 / 0.1) - 1) throw height
            await new Promise(r => setTimeout(r, 1000 * 0.1))
        }

        return node

    }

}