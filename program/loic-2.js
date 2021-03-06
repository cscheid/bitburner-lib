import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { visit } from "/lib/net.js";
import { getLog } from "/program/hack-best-randomized.js";

/** @param {NS} ns */
export async function main(ns) {
  const nodesToUse = new Set(ns.args);
  const lst = [];
  
  await visit(ns, (node) => {
    if (nodesToUse.size !== 0 && !nodesToUse.has(node.name)) {
      ns.tprint(`Skipping ${node.name}`);
      return;
    }
    
    if (node.hasRootAccess && node.name !== "home") {
      lst.push(node);
    }
  });

  let totalThreads = 0;
  for (const node of lst) {
    let ram = await ns.getScriptRam("/program/hack-best-randomized.js");
    let maxRam = node.maxRam;
    let threads = ~~(maxRam / ram);
    if (threads > 0) {
      totalThreads += threads;
    }
  }
  
  ns.tprint(`Loic'ing with ${totalThreads} threads.`);
  for (const node of lst) {
    await ns.killall(node.name);
    let ram = await ns.getScriptRam("/program/hack-best-randomized.js");
    let maxRam = node.maxRam;
    let threads = ~~(maxRam / ram);
    if (threads > 0) {
      ns.tprint(`${node.name}: ${threads} threads`);
      if (threads > 1000) {
        for (let t = 0; t < threads; t += 100) {
          // deploy few threads at a time to allow quick retargeting
          await ns.exec("/program/hack-best-randomized.js", node.name, 100, t);
          await ns.sleep(10); // stagger deployment to avoid clumping
        }
      } else {
        for (let t = 0; t < threads; ++t) {
          // deploy one thread at a time to allow quick retargeting
          await ns.exec("/program/hack-best-randomized.js", node.name, 1, t);
          await ns.sleep(10); // stagger deployment to avoid clumping
        }
      }
    } else {
      ns.tprint(`Can't use ${node.name}, ${maxRam} < ${ram}`);
    }
  }
}
