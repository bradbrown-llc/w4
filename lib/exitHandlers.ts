// array of exit handlers, so we can stop all docker containers made with Node.make
export const exitHandlers:(()=>void)[] = []
// simple fn that calls all exit handlers
const callExitHandlers = () => { exitHandlers.forEach(exitHandler => exitHandler()); Deno.exit() }

// call all exit handlers when script exits (on unload, rejection, SIGINT, and SIGTERM). should cover everything. (TODO: throw?)
globalThis.addEventListener('beforeunload', (_e: Event) => callExitHandlers())
globalThis.addEventListener('unhandledrejection', (e: Event) => {
    if (e instanceof PromiseRejectionEvent) console.error(e.reason)
    callExitHandlers()
})
Deno.addSignalListener('SIGINT', callExitHandlers)
Deno.addSignalListener('SIGTERM', callExitHandlers)