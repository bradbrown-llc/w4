// import { fromFileUrl } from 'https://deno.land/std@0.211.0/path/from_file_url.ts'
import * as semver from "https://deno.land/x/semver@v1.4.1/mod.ts";
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.3/mod.ts'
import { getSolc } from './solcup.ts'
import { abi } from '../schemas/abi/mod.ts';

// const cacheDir = fromFileUrl(import.meta.resolve('./.cache'))
// const solcDir = `${cacheDir}/solc`

export class Server {

    static async codeFromParams(params:jra.types.Params, id:jra.types.Id) {
        const paramSchema = z.object({ code: z.string() })
        try {
          const parsed = await paramSchema.parseAsync(params);
          return parsed.code;
        } catch {
          return jra.Server.error.INVALID_PARAMS(id);
        }
    }

    static async getSolcFromCode(code:string, id:jra.types.Id, solcDir:string) {
        const solidityVersionRaw = code.match(/pragma solidity (.+?);/)?.[1]
        if (!solidityVersionRaw) return jra.Server.error.INVALID_PARAMS(id)
        const solidityVersion = semver.clean(solidityVersionRaw)
        if (!solidityVersion) return jra.Server.error.INVALID_PARAMS(id)
        await getSolc(solidityVersion, solcDir)
        return solidityVersion
    }

    static async compile(code:string, version:string, _id:jra.types.Id, solcDir:string) {
        const command = new Deno.Command(`${solcDir}/${version}`, {
            args: ['--standard-json'],
            stdin: 'piped',
            stderr: 'piped',
            stdout: 'piped'
        })
        const process = command.spawn()
        const writer = process.stdin.getWriter()
        await writer.write(new TextEncoder().encode(`${JSON.stringify({
            language: 'Solidity',
            sources: { contract: { content: code } },
            settings: {
                evmVersion: 'paris',
                outputSelection: { contract: { '*': ['abi', 'evm.bytecode.object'] } }
            }
        })}`))
        await writer.close()
        const output = new TextDecoder().decode((await process.output()).stdout)
        const outputSchema = z.object({
            contracts: z.object({
                contract: z.record(z.string(), z.object({
                    abi,
                    evm: z.object({
                        bytecode: z.object({
                            object: z.string()
                        })
                    })
                }))
            }).optional().transform(x => {
                if (x) {
                    return Object.fromEntries(Object.entries(x.contract).map(([k, v]) => 
                        [k, { abi: v.abi, bytecode: v.evm.bytecode.object}]
                    ))
                } else x
            }),
            errors: z.unknown().array().optional()
        })
        return outputSchema.parse(JSON.parse(output))
    }

}