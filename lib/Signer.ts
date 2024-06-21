
import { hmac } from 'npm:@noble/hashes@1.3.3/hmac'
import { sha256 } from 'npm:@noble/hashes@1.3.3/sha256'
import { getPublicKey, sign, etc } from 'npm:@noble/secp256k1@2.0.0'
import jsSha3 from 'npm:js-sha3@0.9.2'
etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, etc.concatBytes(...m))
const { keccak256 } = jsSha3
import { signRawTx } from './signRawTx.ts'

type SignTxOpts = {
    chainId:number
    nonce:bigint
    gasPrice:bigint
    gasLimit:bigint
    to?:string
    value?:bigint
    data?:string
    accessList?:[address:string,slots:string[]][]
    eip?:'eip-155'|'eip-2930'
}

type SignerOpts = { secret:string }

export interface Signer extends SignerOpts {}
export class Signer {

    constructor({ secret }:SignerOpts) {
        if (!secret) throw new Error('Signer instantiation with undefined secret')
        Object.assign(this, { secret })
    }
    
    get address() {
        if (!this.secret) throw new Error('missing secret')
        const pub = getPublicKey(this.secret, false).slice(1)
        const rawAddress = keccak256(pub).slice(-40)
        const hash = keccak256(rawAddress)
        let address = '0x'
        for (let i = 0; i < 40; i++) address += rawAddress[i][parseInt(hash[i], 16) >= 8 ? 'toUpperCase' : 'toLowerCase']()
        return address
    }
    
    sign(msgh:string) { return sign(msgh, this.secret) }
    
    signTx(opts:SignTxOpts) { return signRawTx({ signer: this, ...opts }) }
    
}