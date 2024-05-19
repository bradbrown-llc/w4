import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as ejra from 'https://cdn.jsdelivr.net/gh/bradbrown-llc/ejra@0.5.3/lib/mod.ts'

Deno.test('ejra height', async () => {
    const height = await ejra.methods.height('http://node')
    assertEquals(height, 0n)
})