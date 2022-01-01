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

export function hack(ns, host, threads, target)
{
  return execAndThen(ns, "/lib/rpc/scripts/hack-main.js", host, threads, target);  
}

export function weaken(ns, host, threads, target)
{
  return execAndThen(ns, "/lib/rpc/scripts/weaken-main.js", host, threads, target);  
}

export function grow(ns, host, threads, target)
{
  return execAndThen(ns, "/lib/rpc/scripts/grow-main.js", host, threads, target);  
}
