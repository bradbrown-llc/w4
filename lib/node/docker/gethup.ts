async function getGethVersions() {
    const args = ['ls-remote', '-t', 'https://github.com/ethereum/go-ethereum']
    const command = new Deno.Command('git', { args })
    const { stdout } = await command.output()
    const text = new TextDecoder().decode(stdout)
    const lines = text.split('\n')
    return lines.map(line => line.split(/.{32}\trefs\/tags\/v?/) as [commit:string, version:string])
        .filter(([_hash, version]) => version?.match(/^\d+\.\d+\.\d+$/))
}

export async function gethup(target:string, gethDir:string) {
    await Deno.mkdir(gethDir, { recursive: true })
    const versions = await getGethVersions()
    const info = versions.find(([_commit, version]) => version == target)
    if (!info) throw new Error(`could not find geth version ${target}`)
    const [commit, version] = info
    const build = `geth-linux-amd64-${version}-${commit}`
    const url = `https://gethstore.blob.core.windows.net/builds/${build}.tar.gz`
    const wget = new Deno.Command('wget', { args: [url, '-qO-'], stdout: 'piped' }).spawn()
    const args = [
        `--transform=s/geth$/${version}/`,  // rename binary from geth to version
        '--strip-components=1',             // strip first archive dir
        '-C', gethDir,                      // output to gethDir
        '-xzf', '-',                        // extract zipped archive from stdin
        `${build}/geth`                     // extract only the binary
    ]
    const tar = new Deno.Command('tar', { args, stdin: 'piped', stdout: 'piped', stderr: 'piped' }).spawn()
    wget.stdout.pipeTo(tar.stdin)
    await tar.output()
}