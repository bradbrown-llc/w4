export async function gethImport(gethPath:string, dataDir:string, keyPath:string) {

    const args = [
        '--lightkdf',
        '--datadir', dataDir,
        'account', 'import', keyPath
    ]
    const gethAccountImport = new Deno.Command(gethPath, {
        args,
        stderr: 'inherit',
        stdout: 'inherit',
        stdin: 'piped'
    }).spawn()
    const writer = gethAccountImport.stdin.getWriter()
    writer.write(new Uint8Array([0x0a, 0x0a]))
    await gethAccountImport.output()

}