import { visit } from "/lib/net.js";

export async function placeFile(ns, file) {
	await visit(ns, async (host) => {
		if (host.name === "home") {
			return;
		}
		await ns.print(`placing ${file} in host ${host.name}`);
		await ns.scp(file, "home", host.name);
	});
}
