import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { NetworkSettings } from "./NetworkSettings.ts";

export const Inspection = z.object({
    NetworkSettings
}).array().transform(xs => { if (!xs.at(0)) { throw new Error('no inspection result') } else return xs.at(0)! })