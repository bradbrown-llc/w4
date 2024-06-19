import { uint } from "./uint.ts";
import { int } from "./int.ts";
import { address } from "./address.ts";
import { bool } from "./bool.ts";
import { bytes } from "./bytes.ts";

export const type = uint.or(int).or(address).or(bool).or(bytes)