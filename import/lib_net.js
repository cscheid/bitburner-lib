import { getFullScan } from "./lib_read.ns";

export async function visit(ns, callable) {
	let net = await getFullScan(ns);
	async function inner(host) {
		await callable(host);
		for (let i = 0; i < host.children.length; ++i) {
			await inner(host.children[i]);
		}
	}
	await inner(net);
}
