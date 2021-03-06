/** @param {NS} ns */
export async function main(ns) {
  let hostname = ns.getHostname();
  while (true) {
    await ns.sleep(1);
    await ns.hack(hostname);
    await ns.weaken(hostname);
    await ns.grow(hostname);
  }
}
