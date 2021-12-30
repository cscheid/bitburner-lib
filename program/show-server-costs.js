/** @param {NS} ns **/
export async function main(ns) {
  for (let i = 1; i <= 20; ++i)
    ns.tprint([1 << i, ns.getPurchasedServerCost(1 << i)]);
}
