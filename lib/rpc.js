// we're trying to keep this to 0GB RAM.

import { getSharedState } from "/lib/shared-state.js";

let uid = 0;
function getUid(i) {
  return ++uid;
}

export function signalDone(ns, result)
{
  if (ns.args.length < 2) {
    ns.tprint("warning: signalDone called without RPC metadata in args");
    return;
  }
  let arg0 = ns.args[ns.args.length - 2];
  if (arg0 !== "-uid") {
    ns.tprint(`warning: signalDone called with bad RPC metadata in args. Expected '-uid', got ${arg0} instead.`);
    return;
  }
  let arg1 = ns.args[ns.args.length - 1];

  let ss = getSharedState(ns, "rpc-closures");

  if (ss[arg1] === undefined) {
    ns.tprint(`warning: uid ${arg1} not found in shared state.`);
    return;
  }

  ss[arg1].resolve(result);
  delete ss[arg1];
}

export function signalError(ns, msg)
{
  if (ns.args.length < 2) {
    ns.tprint("warning: signalError called without RPC metadata in args");
    return;
  }
  let arg0 = ns.args[ns.args.length - 2];
  if (arg0 !== "-uid") {
    ns.tprint(`warning: signalError called with bad RPC metadata in args. Expected '-uid', got ${arg0} instead.`);
    return;
  }
  let arg1 = Number(ns.args[ns.args.length - 1]);

  let ss = getSharedState(ns, "rpc-closures");

  if (ss[arg1] === undefined) {
    ns.tprint(`warning: uid ${arg1} not found in shared state.`);
    return;
  }

  ss[arg1].reject(msg);
  delete ss[arg1];
}

export function nsAndThen(ns, thunk)
{
  let uid = getUid();
  return new Promise((resolve, reject) => {
    getSharedState(ns, "rpc-closures")[uid] = {
      resolve,
      reject
    };
    thunk(uid);
  });
}

export function wrapMain(oldMain)
{
  async function newMain(ns) {
    try {
      let result = await oldMain(ns);
      signalDone(ns, result);
    } catch (e) {
      signalError(ns, e);
    }
  }
  return newMain;
}
