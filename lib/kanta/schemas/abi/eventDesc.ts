import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { io } from "./io/mod.ts";

export const eventDesc = z.object({
    type: z.literal('event'),
    name: z.string(),
    inputs: io
})