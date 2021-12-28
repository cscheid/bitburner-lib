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
  ns.tprint(`Will loic ${target} using ${JSON.stringify(lst.map(node => node.name))}`);
  
  for (const node of lst) {
    await ns.killall(node.name);
    let ram = await ns.getScriptRam("/program/hack.js");
    let maxRam = node.maxRam;
    let threads = ~~(ram / maxRam);
    if (threads > 0) {
      ns.tprint(`${node.name}: ${threads} threads`);
      await ns.exec("/program/hack.js", node.name, threads, target);
    } else {
      ns.tprint(`Can't use ${node.name}, ${ram} < ${maxRam}`);
    }
  }
}
