export async function gethInit(dataDir:string, genesisPath:string, gethPath:string) {

    const args = [
        'init',
        '--datadir', dataDir,
        genesisPath
    ]
    await new Deno.Command(gethPath, {
        args,
        stderr: 'inherit',
        stdout: 'inherit',
        stdin: 'inherit'
    }).spawn().output()

} 