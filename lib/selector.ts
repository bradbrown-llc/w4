import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3

export function selector(s:string) { return `0x${keccak256(s).slice(0, 8)}` }