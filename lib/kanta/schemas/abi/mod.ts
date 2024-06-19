import { functionDesc } from './functionDesc.ts'
import { eventDesc } from './eventDesc.ts'
import { errorDesc } from './errorDesc.ts'

export const abi = functionDesc.or(eventDesc).or(errorDesc).array()