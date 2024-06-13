import z from "https://deno.land/x/zod@v3.22.4/index.ts";

export const NetworkSettings = z.object({
    IPAddress: z.string()
}) 