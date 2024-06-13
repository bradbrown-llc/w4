import { Signer } from '../../Signer.ts'

export async function createGenesis(signers:Signer[], chainId:number, dest:string) {

    const alloc = Object.fromEntries(signers.map(({ address }) => [address, { balance: (2n ** 255n).toString() }]))
    const genesis = JSON.stringify({
        alloc, // prefunds defined accounts
        config: {
            chainId: chainId, // karalabe can go fuck himself
            clique: { period: 0 }, // required to mine on-demand
            homesteadBlock: 0, // required to use eip150Block
            byzantiumBlock: 0, // REVERT, RETURNDATASIZE, RETURNDATACOPY, STATICCALL opcodes
            istanbulBlock: 0, // required for berlinBlock
            petersburgBlock: 0, // required for istanbulBlock
            constantinopleBlock: 0, // required for petersbergBlock
            berlinBlock: 0, // required for EIP-2718 and EIP-2930 (tx types and access lists, respectively)
            eip150Block: 0, // required to use eip155Block
            eip155Block: 0, // required to use rawTxArray with chainId
            eip158Block: 0, // required for byzantium
        },
        extraData: `0x${
            ''.padEnd(32*2, '0')/*32B vanity*/
            }${signers[0].address.slice(2)/*signer*/
            }${''.padEnd(65*2, '0')/*65B proposer seal*/
        }`,
        gasLimit: "0x989680", // required
        difficulty: "0x0" // required
    })
    await Deno.writeTextFile(dest, genesis)

}