import { fromFileUrl } from 'https://deno.land/std@0.211.0/path/from_file_url.ts'
import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.3/mod.ts'
import { Server } from './Server.ts';

const cacheDir = fromFileUrl(import.meta.resolve('./.cache'))
const solcDir = `${cacheDir}/solc`

export async function compile(params: jra.types.Params, id:jra.types.Id) {
    const code = await Server.codeFromParams(params, id)
    if (code instanceof Response) return code
    const version = await Server.getSolcFromCode(code, id, solcDir)
    if (version instanceof Response) return version
    const output = await Server.compile(code, version, id, solcDir)
    return jra.Server.respond({ result: output, id })

}

const handler:jra.types.ServeHandler = async (jraRequest, _httpRequest, _info):Promise<Response> => {
    const { method, params, id } = jraRequest
    switch (method) {
        case "compile": return await compile(params, id)
        default: return jra.Server.error.METHOD_NOT_FOUND(id)
    }
}

jra.Server.serve({ port: 80, hostname: '0.0.0.0' }, handler)