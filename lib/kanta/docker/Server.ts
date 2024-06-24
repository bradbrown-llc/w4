import * as semver from "https://deno.land/std@0.224.0/semver/parse.ts";
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.4/mod.ts'
import { getSolc } from './solcup.ts'
import { abi } from '../schemas/abi/mod.ts';

export class Server {

    static async codeFromParams(params:jra.types.Params, id:jra.types.Id) {
        const paramSchema = z.object({ code: z.string() })
        try {
          const parsed = await paramSchema.parseAsync(params);
          return parsed.code;
        } catch {
          return jra.Server.error.INVALID_PARAMS(id, 'no code or code not string');
        }
    }

    static async getSolcFromCode(code:string, id:jra.types.Id, solcDir:string) {
        const solidityVersionRaw = code.match(/pragma solidity .?(\d+\.\d+\.\d+);/)?.[1]
        if (!solidityVersionRaw) return jra.Server.error.INVALID_PARAMS(id, 'no pattern match for solidity version')
        try {
            const v = semver.parse(solidityVersionRaw)
            const vf = `${v.major}.${v.minor}.${v.patch}`
            await getSolc(vf, solcDir)
            return vf
        } catch (e) {
            if (e instanceof Error) return jra.Server.error.INVALID_PARAMS(id, {
                message: e.message,
                cause: JSON.stringify(e.cause),
                stack: e.stack ?? 'no stack'
            })
            else return jra.Server.error.INVALID_PARAMS(id, JSON.stringify(e))
        }
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