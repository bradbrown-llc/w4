import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { type } from "./type/mod.ts";

export const io = z.object({
    name: z.string(),
    type
}).array()