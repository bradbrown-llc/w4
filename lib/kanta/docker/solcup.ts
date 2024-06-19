
// import { fromFileUrl } from 'https://deno.land/std@0.211.0/path/from_file_url.ts'

// const cacheDir = fromFileUrl(import.meta.resolve('./.cache'))
// const solcDir = `${cacheDir}/solc`

const solcCached = (version:string, solcDir:string) => Deno.stat(`${solcDir}/${version}`).then(_=>true).catch(_=>false)

export const getSolc = async (version:string, solcDir:string) => {
    if (await solcCached(version, solcDir)) return
    const response = await fetch(`https://github.com/ethereum/solidity/releases/download/v${version}/solc-static-linux`)
    const blob = await response.blob()
    const arbuf = await blob.arrayBuffer()
    const uints = new Uint8Array(arbuf)
    await Deno.mkdir(solcDir, { recursive: true })
    await Deno.writeFile(`${solcDir}/${version}`, uints, { mode: 0o755 })
}

// console.log(await getSolc('0.8.23'))