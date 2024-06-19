import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { io } from "./io/mod.ts";
import { stateMutability } from "./stateMutability.ts";

export const functionDesc = z.object({
    type: z.literal('function'),
    name: z.string(),
    inputs: io,
    outputs: io,
    stateMutability
}).or(z.object({
    type: z.literal('constructor'),
    inputs: io,
    stateMutability
})).or(z.object({
    type: z.literal('receive').or(z.literal('fallback')),
    stateMutability
}))