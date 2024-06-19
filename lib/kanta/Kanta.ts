import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.1/lib/mod.ts'
import * as docker from '../docker/mod.ts'
import { compileResult } from "./schemas/compileResult.ts";

// array of exit handlers, so we can stop all docker containers made with Node.make
const exitHandlers:(()=>void)[] = []
// simple fn that calls all exit handlers
const callExitHandlers = () => { exitHandlers.forEach(exitHandler => exitHandler()); Deno.exit() }

// call all exit handlers when script exits (on unload, rejection, SIGINT, and SIGTERM). should cover everything. (TODO: throw?)
globalThis.addEventListener('beforeunload', (_e: Event) => callExitHandlers())
globalThis.addEventListener('unhandledrejection', (e: Event) => {
    if (e instanceof PromiseRejectionEvent) console.error(e.reason)
    callExitHandlers()
})
Deno.addSignalListener('SIGINT', callExitHandlers)
Deno.addSignalListener('SIGTERM', callExitHandlers)

export class Kanta {

    rpc:string

    constructor(rpc:string) {
        this.rpc = rpc
    }

    async compile(code:string) {
        const jraClient = new jra.Client(this.rpc)
        const result = await jraClient.request('compile', { code }, 0)
        return compileResult.parse(result)
    }

    static async make() {

        function dockerRun() {
            const args = [ 'run', '-d', '--rm', 'w4-kanta' ]
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

        const kanta = new Kanta(rpc)

        // poll every tenth of a second for 5 seconds, throwing error if we can't get height in 5 seconds
        for (let i = 0; i < 5 / 0.1; i++) {
            const result = await kanta.compile('pragma solidity 0.8.0;').catch((e:Error) => e)
            if (!(result instanceof Error)) break
            if (i == (5 / 0.1) - 1) throw result
            await new Promise(r => setTimeout(r, 1000 * 0.1))
        }

        return kanta

    }

}