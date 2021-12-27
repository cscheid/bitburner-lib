/** @param {NS} ns **/
export async function main(ns) {
	let name = ns.args[0];
	while (true) {
		await ns.hack(name);
		await ns.grow(name);
		await ns.weaken(name);
	}    
}
