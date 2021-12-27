/** @param {NS} ns **/
export async function main(ns) {
    let vs = Object.values(JSON.parse(await ns.read("rewards.txt")));
	vs = vs.filter(v => v.cost !== null);
	vs.sort((a, b) => b.productionDelta / b.cost - a.productionDelta / a.cost);
	for (let i = 0; i < vs.length; ++i) {
		let v = vs[i];
		ns.tprint(`${v.name}: ${v.productionDelta}, ${v.cost}, ${v.productionDelta / v.cost}`);
	}
}
