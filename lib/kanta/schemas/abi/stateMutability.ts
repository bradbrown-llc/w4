import z from "https://deno.land/x/zod@v3.22.4/index.ts";

export const stateMutability = z
    .literal('pure')
    .or(z.literal('view'))
    .or(z.literal('nonpayable'))
    .or(z.literal('payable'))