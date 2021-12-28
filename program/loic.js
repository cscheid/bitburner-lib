import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { visit } from "/lib/net.js";

/** @param {NS} ns */
export async function main(ns) {
  const lst = [];
  await visit(ns, (node) => {
    if (node.hasRootAccess && node.name !== "home") {
      lst.push(node);
    }
  });
  const target = ns.args[0];
  const action = ns.args[1];
  let msg;
  if (action !== undefined) {
    msg = `Will loic (${action}) ${target} using ${JSON.stringify(lst.map(node => node.name))}`;
  } else {
    msg = `Will loic ${target} using ${JSON.stringify(lst.map(node => node.name))}`;
  }
  ns.tprint(msg);

  let totalThreads = 0;
  for (const node of lst) {
    await ns.killall(node.name);
    let ram = await ns.getScriptRam("/program/hack.js");
    let maxRam = node.maxRam;
    let threads = ~~(maxRam / ram);
    if (threads > 0) {
      totalThreads += threads;
      ns.tprint(`${node.name}: ${threads} threads`);
      if (action) {
        await ns.exec("/program/hack.js", node.name, threads, target, action);
      } else {
        await ns.exec("/program/hack.js", node.name, threads, target);
      }
    } else {
      ns.tprint(`Can't use ${node.name}, ${maxRam} < ${ram}`);
    }
  }
  ns.tprint(`Loic'ing with ${totalThreads} threads.`);
}
