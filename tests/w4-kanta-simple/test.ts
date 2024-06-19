import { Kanta } from "../../lib/kanta/Kanta.ts";
import { Signer } from "../../lib/Signer.ts";

const implementer = new Signer({ secret: ''.padEnd(64, 'A') })
const destroyer = new Signer({ secret: ''.padEnd(64, 'B') })
const wallet = new Signer({ secret: ''.padEnd(64, 'C') })

const kanta = await Kanta.make()

const code = Deno.readTextFileSync('Resolver.sol')
    .replace(/\?I\?+/, implementer.address.slice(2))
    .replace(/\?D\?+/, destroyer.address.slice(2))
    .replace(/\?W\?+/, wallet.address.slice(2))

console.log(code)

console.log(await kanta.compile(code))

// while (true) await new Promise(r => setTimeout(r, 1000))