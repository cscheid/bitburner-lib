import { nsAndThen } from "/lib/rpc.js";
import { getSharedState } from "/lib/shared-state.js";

export function runAndThen(ns, program, threads, ...args)
{
  return nsAndThen(ns, async (uid) => {
    let result = ns.run(program, threads, ...args, "-uid", String(uid));
    if (result === 0) {
      try {
        throw new Error(`Could not "run" ${program} on ${ns.getHostname()}. OOM or wrong file?`);
      } catch (e) {
        getSharedState(ns, "rpc-closures")[uid].reject(e);
      }
    }
  });
}

export function execAndThen(ns, program, host, threads, ...args)
{
  return nsAndThen(ns, async (uid) => {
    let result = ns.exec(program, host, threads, ...args, "-uid", String(uid));
    if (result === 0) {
      try {
        throw new Error(`Could not "exec" ${program} on ${host}. OOM or wrong file?`);
      } catch (e) {
        getSharedState(ns, "rpc-closures")[uid].reject(e);
      }
    }
  });
}
