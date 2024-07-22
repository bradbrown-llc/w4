import { Signer } from '../../Signer.ts'

export async function geth(gethPath:string, dataDir:string, httpPort:number, signer:Signer) {

    const args = [
        '--datadir', dataDir,
        '--authrpc.port', '0',
        '--discovery.port', '0',
        '--nodiscover',
        '--port', '0',
        '--http',
        '--http.addr', '0.0.0.0',
        '--http.port', ''+httpPort ?? '0',
        '--http.api', 'eth,web3,net,debug',
        '--http.corsdomain', '*',
        '--http.vhosts', '*',
        '--nat', 'none',
        '--mine',
        '--miner.etherbase', signer.address,
        '--allow-insecure-unlock',
        '--unlock', signer.address,
        '--password', await Deno.makeTempFile(),
        '--datadir.minfreedisk', '0'
    ]

    new Deno.Command(gethPath, {
        args,
        stderr: 'inherit',
        stdout: 'inherit',
        stdin: 'inherit'
    }).spawn()

}