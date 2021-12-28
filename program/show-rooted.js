import { visit } from "/lib/net.js";

/** @param {NS} ns */
export async function main(ns) {
  const lst = [];
  await visit(ns, (node) => {
    if (node.hasRootAccess) {
      lst.push(node.name);
    }
  });
  ns.tprint("\n\n" + lst.join("\n"));
}
