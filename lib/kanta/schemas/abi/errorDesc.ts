import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { io } from "./io/mod.ts";

export const errorDesc = z.object({
    type: z.literal('error'),
    name: z.string(),
    inputs: io
})