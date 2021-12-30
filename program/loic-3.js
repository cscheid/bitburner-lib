import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { getNode, visit } from "/lib/net.js";
import { getLog } from "/program/hack-best-randomized.js";

/** @param {NS} ns */
export async function main(ns) {
  const lst = [];
  let target = ns.args[0];
  let nodesToAdd = ns.args.slice(1);
  await visit(ns, (node) => {
    if (node.hasRootAccess &&
        nodesToAdd.length > 0 &&
        (nodesToAdd.indexOf(node.name) !== -1)) {
      lst.push(node);
    }
  });


  let totalThreads = 0;
  for (const node of lst) {
    let ram = await ns.getScriptRam("/program/hack-best-randomized.js");
    let maxRam = node.name === "home" ? node.maxRam * 0.75 : node.maxRam;
    let threads = ~~(maxRam / ram);
    if (threads > 0) {
      totalThreads += threads;
    }
  }
  
  ns.tprint(`Loic'ing with ${totalThreads} threads.`);
  for (const node of lst) {
    if (node.name !== "home") {
      await ns.killall(node.name);
    }
    let ram = await ns.getScriptRam("/program/hack-best-randomized.js");
    let maxRam = node.name === "home" ? node.maxRam * 0.75 : node.maxRam;
    let threads = ~~(maxRam / ram);
    if (threads > 0) {
      ns.tprint(`${node.name}: ${threads} threads`);
      if (threads > 100000) {
        for (let t = 0; t < threads; t += 1000) {
          // deploy few threads at a time to allow quick retargeting
          await ns.exec("/program/hack-best-randomized.js", node.name, 1000, target, t);
          await ns.sleep(10); // stagger deployment to avoid clumping
        }
      } else if (threads > 1000) {
        for (let t = 0; t < threads; t += 100) {
          // deploy few threads at a time to allow quick retargeting
          await ns.exec("/program/hack-best-randomized.js", node.name, 100, target, t);
          await ns.sleep(10); // stagger deployment to avoid clumping
        }
      } else {
        for (let t = 0; t < threads; ++t) {
          // deploy one thread at a time to allow quick retargeting
          await ns.exec("/program/hack-best-randomized.js", node.name, 1, target, t);
          await ns.sleep(10); // stagger deployment to avoid clumping
        }
      }
    } else {
      ns.tprint(`Can't use ${node.name}, ${maxRam} < ${ram}`);
    }
  }
}
