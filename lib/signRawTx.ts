import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import { etc } from 'npm:@noble/secp256k1@2.0.0'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
const { bytesToHex } = etc
import { Signer } from './Signer.ts'

export function signRawTx({
    signer, nonce, gasPrice, gasLimit, to, value, data, chainId, accessList=[], eip='eip-155'
}:{
    signer:Signer
    nonce:bigint
    gasPrice:bigint
    gasLimit:bigint
    to?:string
    value?:bigint
    data?:string
    chainId:number
    accessList?:[address:string,slots:string[]][]
    eip?:'eip-155'|'eip-2930'
}) {

    switch (eip) {
        case 'eip-155': {
            const rawTxArray = [nonce, gasPrice, gasLimit, to, value, data, chainId, 0, 0]
            const rawTxEncoding = encode(rawTxArray)
            const rawTxHash = keccak256(rawTxEncoding)
            const { r, s, recovery } = signer.sign(rawTxHash)
            if (recovery === undefined) throw new Error('undefined recovery bit')
            const v = BigInt(chainId) * 2n + 35n + BigInt(recovery)
            const signedTxArray = [...rawTxArray.slice(0, 6), v, r, s]
            const signedTx = `0x${bytesToHex(encode(signedTxArray))}`
            return signedTx
        }
        case 'eip-2930': {
            const rawTxArray = [chainId, nonce, gasPrice, gasLimit, to, value, data, accessList]
            const rawTxHash = keccak256(Uint8Array.from([0x01, ...encode(rawTxArray)]))
            const { r, s, recovery } = signer.sign(rawTxHash)
            if (recovery === undefined) throw new Error('undefined recovery bit')
            const signedTxArray = [...rawTxArray, recovery, r, s]
            const txType = 1
            const txPayload = encode(signedTxArray)
            const tx = Uint8Array.from([txType, ...txPayload])
            const signedTx = `0x${bytesToHex(tx)}`
            return signedTx
        }
        default: throw new Error('unknown eip', { cause: { eip } })
    }

}