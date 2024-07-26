import * as jra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/jra@0.1.1/mod.ts'
import { TxCallObject } from '../types/TxCallObject.ts';
import { Tag } from '../types/Tag.ts';

export async function traceCall(rpc: string, txCallObject:Partial<TxCallObject>, tag:Tag) {
  const { gas, gasPrice, value } = txCallObject
  const method = "debug_traceCall";
  const params = [
    {
        ...txCallObject,
        ...(gas ? { gas: `0x${gas.toString(16)}` } : {}),
        ...(gasPrice ? { gasPrice: `0x${gasPrice.toString(16)}` } : {}),
        ...(value ? { value: `0x${value.toString(16)}` } : {})
      } as {
        from?:string
        to?:string
        gas?:string
        gasPrice?:string
        value?:string
        input?:string
    },
    typeof tag == 'bigint' ? `0x${tag.toString(16)}` : tag,
    {
        enableMemory: true,
        disableStack: false,
        disableStorage: false,
        enableReturnData: true
    }
  ]
  const schema = jra.schemas.json;
  return schema.parse(await new jra.Client(rpc).request(method, params, 0))
}
