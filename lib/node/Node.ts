import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.1/lib/mod.ts'
import * as docker from '../docker/mod.ts'
import { ejra } from '../mod.ts';
import { exitHandlers } from '../exitHandlers.ts';
const { methods } = ejra
type Tag = ejra.types.Tag
type TxCallObject = ejra.types.TxCallObject

type NodeMakeOptions = {
    mount?: {
        src:string
        dst:string
    }[]
}

export class Node {

    rpc:string
    balance:(address:string,tag:Tag)=>ReturnType<typeof methods.balance>
    call:(txCallObject:TxCallObject, tag:Tag)=>ReturnType<typeof methods.call>
    chainId:()=>ReturnType<typeof methods.chainId>
    clientVersion:()=>ReturnType<typeof methods.clientVersion>
    estimateGas:(txCallObject:Partial<TxCallObject>, tag:Tag)=>ReturnType<typeof methods.estimateGas>
    gasPrice:()=>ReturnType<typeof methods.gasPrice>
    height:()=>ReturnType<typeof methods.height>
    receipt:(hash:string)=>ReturnType<typeof methods.receipt>
    sendRawTx:(data:string)=>ReturnType<typeof methods.sendRawTx>
    slot:(address:string,slot:bigint,tag:Tag)=>ReturnType<typeof methods.slot>
    code:(address:string,tag:Tag)=>ReturnType<typeof methods.code>
    traceTx:(hash:string)=>ReturnType<typeof methods.traceTx>

    constructor(rpc:string) {
        this.rpc = rpc
        this.balance = (address:string, tag:Tag) => methods.balance(rpc, address, tag)
        this.call = (txCallObject:TxCallObject, tag:Tag) => methods.call(rpc, txCallObject, tag)
        this.chainId = () => methods.chainId(rpc)
        this.clientVersion = () => methods.clientVersion(rpc)
        this.estimateGas = (txCallObject:Partial<TxCallObject>, tag:Tag) => methods.estimateGas(rpc, txCallObject, tag)
        this.gasPrice = () => methods.gasPrice(rpc)
        this.height = () => methods.height(rpc)
        this.receipt = (hash:string) => methods.receipt(rpc, hash)
        this.sendRawTx = (data:string) => methods.sendRawTx(rpc, data)
        this.slot = (address:string, slot:bigint, tag:Tag) => methods.slot(rpc, address, slot, tag)
        this.code = (address:string, tag:Tag) => methods.code(rpc, address, tag)
        this.traceTx = (hash:string) => methods.traceTx(rpc, hash)
    }

    static async make(options?:NodeMakeOptions) {

        function dockerRun() {
            const args = [ 'run', '-d', '--rm', 'w4-node' ]
            for (const m of options?.mount ?? []) args.splice(3, 0, '--mount', `type=bind,src=${m.src},dst=${m.dst}`)
            const cmdOut = new Deno.Command('docker', { args, stdout: 'piped', stderr: 'piped' }).outputSync()
            const id = new TextDecoder().decode(cmdOut.stdout).replace(/\n/, '')
            exitHandlers.push(() => new Deno.Command('docker', { args: [ 'stop', id ] }).output())
            return id
        }

        function dockerInspect(id:string) {
            const args = [ 'inspect', id ]
            const cmdOut = new Deno.Command('docker', { args, stdout: 'piped', stderr: 'piped' }).outputSync()
            const out = new TextDecoder().decode(cmdOut.stdout)
            const jsonParseResult = jra.schemas.json.parse(JSON.parse(out))
            const dockerInspectParseResult = docker.schemas.Inspection.parse(jsonParseResult)
            return dockerInspectParseResult
        }

        const id = dockerRun()
        const inspection = dockerInspect(id)
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