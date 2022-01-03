/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    await ns.grow(ns.args[0]);
    await ns.weaken(ns.args[0]);
    await ns.hack(ns.args[0]);
  }
}
