import { Docker } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/docker@0.0.1/mod.ts'
import { ExitHandlers } from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/ExitHandlers@0.0.0/mod.ts'
import { ejra } from '../mod.ts';
const { methods } = ejra
type Tag = ejra.types.Tag
type TxCallObject = ejra.types.TxCallObject

// super basic wait fn, don't care about other wait fn's existing or concurrency
// poll at an interval, timeout if X amount of time occurs
async function defaultWaitFn(node:Node, hash:string) {
    const interval = 250
    const timeout = 30000
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
    traceCall:(txCallObject:TxCallObject, tag:Tag)=>ReturnType<typeof methods.traceCall>
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
        this.traceCall = (txCallObject:TxCallObject, tag:Tag) => methods.traceCall(rpc, txCallObject, tag)
        this.traceTx = (hash:string) => methods.traceTx(rpc, hash)
    }

    async wait(hash:string, waitFn:(node:Node,hash:string)=>Promise<void>=defaultWaitFn) {
        await waitFn(this, hash)
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